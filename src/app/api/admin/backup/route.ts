import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { runBackup } from "@/lib/backup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cronToken = process.env.BACKUP_TRIGGER_TOKEN;
  const authHeader = request.headers.get("authorization") ?? "";
  const allowToken = cronToken && authHeader === `Bearer ${cronToken}`;

  if (!allowToken) {
    const session = await auth();
    if (
      !session?.user?.role ||
      !canAccessAdminRoute("/admin/settings", session.user.role)
    ) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  const result = await runBackup();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}
