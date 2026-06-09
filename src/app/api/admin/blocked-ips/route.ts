import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute, canManageCrm } from "@/lib/admin-permissions";
import {
  blockIpAddress,
  getBlockedIps,
  recordAuditLog,
  unblockIpAddress,
} from "@/lib/content-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const blockSchema = z.object({
  ipAddress: z.string().min(3).max(120),
  reason: z.string().max(500).optional().or(z.literal("")),
});

const deleteSchema = z.object({
  id: z.string().min(3).optional(),
  ipAddress: z.string().min(3).max(120).optional(),
});

function json(
  status: "success" | "error",
  message: string,
  init?: ResponseInit,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ status, message, ...(extra ?? {}) }, init);
}

async function requireAdmin() {
  const session = await auth();
  if (
    !session?.user?.role ||
    !canAccessAdminRoute("/admin/crm", session.user.role)
  ) {
    return null;
  }
  return session;
}

async function requireCrmManager() {
  const session = await requireAdmin();
  if (!session?.user?.role || !canManageCrm(session.user.role)) {
    return null;
  }
  return session;
}

function isMissingRecord(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

function revalidate() {
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

export async function GET() {
  if (!(await requireAdmin())) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const items = await getBlockedIps();
  return NextResponse.json({ status: "success", items });
}

export async function POST(request: Request) {
  const session = await requireCrmManager();
  if (!session) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      "error",
      "راجع عنوان الـ IP وسبب الحظر قبل الحفظ. / Invalid IP block request.",
      { status: 400 },
    );
  }

  try {
    const result = await blockIpAddress({
      ipAddress: parsed.data.ipAddress,
      reason: parsed.data.reason || undefined,
      createdById: session.user?.id,
      createdByName: session.user?.name ?? session.user?.email ?? undefined,
    });
    await recordAuditLog({
      actorUserId: session.user?.id,
      action: "crm.blockedIp.block",
      entityType: "BlockedIp",
      entityId: result.mode === "database" ? result.item.id : undefined,
      metadata: {
        ipAddress: parsed.data.ipAddress,
        reason: parsed.data.reason || null,
      },
    });
    revalidate();
    return json("success", "تم حظر الـ IP من إرسال طلبات جديدة.", undefined, {
      item: result.item,
    });
  } catch (error) {
    return json(
      "error",
      error instanceof Error
        ? error.message
        : "تعذر حظر الـ IP حاليًا. / IP block failed.",
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await requireCrmManager();
  if (!session) {
    return json("error", "Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = deleteSchema.safeParse({
    id: url.searchParams.get("id") || undefined,
    ipAddress: url.searchParams.get("ipAddress") || undefined,
  });
  if (!parsed.success || (!parsed.data.id && !parsed.data.ipAddress)) {
    return json(
      "error",
      "حدد الـ IP المطلوب فك حظره. / Missing IP block identifier.",
      { status: 400 },
    );
  }

  try {
    const result = await unblockIpAddress(parsed.data);
    await recordAuditLog({
      actorUserId: session.user?.id,
      action: "crm.blockedIp.unblock",
      entityType: "BlockedIp",
      entityId: result.mode === "database" ? result.item.id : parsed.data.id,
      metadata: {
        ipAddress: parsed.data.ipAddress || null,
      },
    });
    revalidate();
    return json("success", "تم فك حظر الـ IP.", undefined, {
      item: result.item,
    });
  } catch (error) {
    if (isMissingRecord(error)) {
      return json("success", "هذا الـ IP غير محظور بالفعل.");
    }
    return json(
      "error",
      error instanceof Error
        ? error.message
        : "تعذر فك حظر الـ IP حاليًا. / IP unblock failed.",
      { status: 500 },
    );
  }
}
