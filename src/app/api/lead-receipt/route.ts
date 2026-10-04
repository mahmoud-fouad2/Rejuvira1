import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyLeadReceipt } from "@/lib/lead-receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const receiptSchema = z.object({
  receipt: z.string().min(20).max(2_000),
});

export async function POST(request: Request) {
  const parsed = receiptSchema.safeParse(
    await request.json().catch(() => null),
  );
  const receipt = parsed.success
    ? verifyLeadReceipt(parsed.data.receipt)
    : null;

  if (!receipt) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired lead receipt" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      requestId: receipt.requestId,
      state: receipt.state,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
