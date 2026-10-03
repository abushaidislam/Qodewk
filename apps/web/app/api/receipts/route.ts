import { NextRequest, NextResponse } from "next/server";
import { ReceiptV1Schema } from "@qodewk/protocol";
import * as crypto from "node:crypto";
import { saveReceiptToStore, getReceiptFromStore } from "@/lib/storage";
import { checkRateLimit } from "@/lib/ratelimit";

function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    if (parts[0]) return parts[0].trim();
  }

  return "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting & abuse protection (max 30 req/min per IP)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp);

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

    // 2. Enforce 50 KB payload cap
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 51200) { // 50 KB in bytes
      return NextResponse.json(
        { error: "Payload exceeds 50 KB maximum request limit." },
        { status: 413 }
      );
    }

    const body = await req.json();

    // 3. Validate against canonical ReceiptV1Schema
    const parsed = ReceiptV1Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid receipt protocol payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const receipt = parsed.data;
    const claimToken = `clm_${crypto.randomBytes(16).toString("hex")}`;
    const claimTokenHash = crypto.createHash("sha256").update(claimToken).digest("hex");

    // 4. Store in persistence layer
    try {
      await saveReceiptToStore(receipt, claimTokenHash);
    } catch (storageErr: any) {
      const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
      if (isProduction) {
        return NextResponse.json(
          {
            error: "Durable storage failure",
            message: storageErr.message
          },
          { status: 503 }
        );
      }
      throw storageErr;
    }

    const reqHost = req.headers?.get ? (req.headers.get("x-forwarded-host") || req.headers.get("host")) : null;
    const reqProto = req.headers?.get ? (req.headers.get("x-forwarded-proto") || "https") : "https";
    const detectedOrigin = reqHost ? `${reqProto}://${reqHost}` : null;

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.QODEWK_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      detectedOrigin ||
      "http://localhost:3000"
    ).replace(/\/$/, "");
    const publicUrl = `${baseUrl}/r/${receipt.receipt.id}`;

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
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
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
