import { NextRequest, NextResponse } from "next/server";
import { ReceiptV1Schema } from "@qodewk/protocol";
import * as crypto from "node:crypto";
import { saveReceiptToStore, getReceiptFromStore, ReceiptConflictError } from "@/lib/storage";
import { checkDistributedRateLimit } from "@/lib/ratelimit";
import { getClientIP } from "@/lib/ai-chat/rate-limit";

const MAX_BODY_BYTES = 51200; // 50 KB

/**
 * Reads the request body while counting actual bytes, so the cap also holds for
 * chunked requests and requests with a missing or understated `Content-Length`.
 * Returns `null` as soon as the body exceeds `maxBytes`.
 */
async function readBodyWithLimit(req: NextRequest, maxBytes: number): Promise<string | null> {
  if (!req.body) return "";

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function resolveBaseUrl(req: NextRequest): string {
  const reqHost = req.headers?.get ? (req.headers.get("x-forwarded-host") || req.headers.get("host")) : null;
  const reqProto = req.headers?.get ? (req.headers.get("x-forwarded-proto") || "https") : "https";
  const detectedOrigin = reqHost ? `${reqProto}://${reqHost}` : null;

  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.QODEWK_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    detectedOrigin ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function payloadTooLarge() {
  return NextResponse.json(
    { error: "Payload exceeds 50 KB maximum request limit." },
    { status: 413 }
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting & abuse protection (max 30 req/min per IP)
    const clientIp = getClientIP(req);
    const rateLimit = await checkDistributedRateLimit(clientIp);

    if (!rateLimit.allowed) {
      const retryAfter = Math.max(rateLimit.reset - Math.ceil(Date.now() / 1000), 1);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.reset)
          }
        }
      );
    }

    // 2. Enforce 50 KB payload cap: reject early on a declared oversize body,
    //    then count the bytes actually received
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return payloadTooLarge();
    }

    const rawBody = await readBodyWithLimit(req, MAX_BODY_BYTES);
    if (rawBody === null) {
      return payloadTooLarge();
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Request body is not valid JSON" }, { status: 400 });
    }

    // 3. Validate against canonical ReceiptV1Schema
    const parsed = ReceiptV1Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid receipt protocol payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const receipt = parsed.data;
    const publicUrl = `${resolveBaseUrl(req)}/r/${receipt.receipt.id}`;
    const claimToken = `clm_${crypto.randomBytes(16).toString("hex")}`;
    const claimTokenHash = crypto.createHash("sha256").update(claimToken).digest("hex");

    // 4. Store in persistence layer. Published receipts are immutable.
    try {
      await saveReceiptToStore(receipt, claimTokenHash);
    } catch (storageErr: unknown) {
      if (storageErr instanceof ReceiptConflictError) {
        return NextResponse.json(
          {
            error: "Receipt already published",
            publicId: receipt.receipt.id,
            url: publicUrl
          },
          { status: 409 }
        );
      }

      const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
      if (isProduction) {
        console.error("[Qodewk Receipts] Durable storage failure:", storageErr);
        return NextResponse.json(
          {
            error: "Durable storage failure",
            message: "Receipt storage is temporarily unavailable. Please try again later."
          },
          { status: 503 }
        );
      }
      throw storageErr;
    }

    return NextResponse.json(
      {
        publicId: receipt.receipt.id,
        url: publicUrl,
        claimToken
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.reset)
        }
      }
    );
  } catch (err: unknown) {
    console.error("[Qodewk Receipts] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing receipt id" }, { status: 400 });
  }

  const receipt = await getReceiptFromStore(id);
  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  return NextResponse.json(receipt);
}
