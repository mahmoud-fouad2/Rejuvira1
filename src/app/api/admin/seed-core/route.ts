import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { runCoreSeed } from "@/lib/run-core-seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json(
      { ok: false, error: "Super admin access required." },
      { status: 403 },
    );
  }

  const result = runCoreSeed({ force: true });
  return NextResponse.json(
    {
      ok: result.ok,
      status: result.status,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    },
    { status: result.ok ? 200 : 500 },
  );
}
