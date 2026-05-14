import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "ok",
    service: "rejuvira-center-web",
    runtime: "next-app-router",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasR2: Boolean(
      process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY,
    ),
    hasRecaptcha: Boolean(process.env.RECAPTCHA_SECRET_KEY),
    ts: Date.now(),
    timestamp: new Date().toISOString(),
  });
}
