import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import {
  executeIntegration,
  getIntegrationToolFull,
} from "@/lib/integration-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  return Boolean(
    session?.user?.role &&
      canAccessAdminRoute("/admin/integration-tools", session.user.role),
  );
}

const schema = z.object({
  params: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function POST(
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
  const json = await request.json().catch(() => ({ params: {} }));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: "Invalid payload" },
      { status: 400 },
    );
  }
  const integration = await getIntegrationToolFull(id);
  if (!integration) {
    return NextResponse.json(
      { status: "error", message: "Not found" },
      { status: 404 },
    );
  }
  const result = await executeIntegration({
    integration,
    params: parsed.data.params,
  });
  return NextResponse.json({ status: "success", data: result });
}
