import { NextResponse } from "next/server";

import { recordAppLog } from "@/lib/app-log";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    await recordAppLog({
      level: "info",
      kind: "analytics.pageview",
      message: "Public page viewed",
      meta: {
        path: typeof body.path === "string" ? body.path.slice(0, 240) : "/",
        referrer:
          typeof body.referrer === "string" ? body.referrer.slice(0, 500) : "",
        language:
          typeof body.language === "string" ? body.language.slice(0, 16) : "",
        timezone:
          typeof body.timezone === "string" ? body.timezone.slice(0, 80) : "",
        screen: typeof body.screen === "string" ? body.screen.slice(0, 40) : "",
      },
    });
  } catch {
    // Analytics must never block the visitor path.
  }

  return NextResponse.json({ ok: true });
}
