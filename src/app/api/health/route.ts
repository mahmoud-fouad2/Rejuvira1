import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  let dbReachable = false;

  if (hasDatabaseUrl) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbReachable = true;
    } catch {
      dbReachable = false;
    }
  }

  return NextResponse.json({
    ok: true,
    status: "ok",
    service: "rejuvera-center-web",
    runtime: "next-app-router",
    hasDatabaseUrl,
    dbReachable,
    hasR2: Boolean(
      process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY,
    ),
    hasRecaptcha: Boolean(process.env.RECAPTCHA_SECRET_KEY),
    ts: Date.now(),
    timestamp: new Date().toISOString(),
  });
}
