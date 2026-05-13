import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "rejuvira-center-web",
    runtime: "next-app-router",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    timestamp: new Date().toISOString(),
  });
}
