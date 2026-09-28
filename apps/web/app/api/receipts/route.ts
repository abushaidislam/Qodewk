import { NextRequest, NextResponse } from "next/server";
import { ReceiptV1Schema } from "@qodewk/protocol";
import * as crypto from "node:crypto";
import { saveReceiptToStore, getReceiptFromStore } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce 50 KB payload cap
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 51200) { // 50 KB in bytes
      return NextResponse.json(
        { error: "Payload exceeds 50 KB maximum request limit." },
        { status: 413 }
      );
    }

    const body = await req.json();

    // 2. Validate against canonical ReceiptV1Schema
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

    // Store in persistence layer
    await saveReceiptToStore(receipt, claimTokenHash);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.QODEWK_APP_URL || "https://qodewk.flinkeo.online";
    const publicUrl = `${baseUrl}/r/${receipt.receipt.id}`;

    return NextResponse.json({
      publicId: receipt.receipt.id,
      url: publicUrl,
      claimToken
    });
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
