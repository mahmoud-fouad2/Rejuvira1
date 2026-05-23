import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import { setIntegrationToolStatus } from "@/lib/integration-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  return Boolean(
    session?.user?.role &&
      canAccessAdminRoute("/admin/integration-tools", session.user.role),
  );
}

const schema = z.object({ isActive: z.boolean() });

export async function PATCH(
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
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: "Invalid payload" },
      { status: 400 },
    );
  }
  try {
    const updated = await setIntegrationToolStatus(id, parsed.data.isActive);
    revalidatePath("/admin/integration-tools");
    return NextResponse.json({ status: "success", data: updated });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: (error as Error).message ?? "Failed" },
      { status: 500 },
    );
  }
}
