import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { listIntegrationLogs } from "@/lib/integration-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  return Boolean(
    session?.user?.role &&
      canAccessAdminRoute("/admin/integration-tools", session.user.role),
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 },
    );
  }
  const { id } = await context.params;
  const url = new URL(request.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = Math.max(1, Math.min(200, Number(limitRaw) || 25));
  const logs = await listIntegrationLogs(id, limit);
  return NextResponse.json({ status: "success", data: logs });
}
