import {
  IntegrationAuthType,
  IntegrationHttpMethod,
  IntegrationToolType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { canAccessAdminRoute } from "@/lib/admin-permissions";
import {
  deleteIntegrationTool,
  getIntegrationTool,
  isValidToolName,
  updateIntegrationTool,
  type IntegrationToolInput,
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

function err(message: string, status = 400) {
  return NextResponse.json({ status: "error", message }, { status });
}

const headerSchema = z.object({
  key: z.string(),
  value: z.string().default(""),
});

const parameterSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "date", "enum"]),
  required: z.boolean().default(false),
  description: z.string().optional().default(""),
  example: z.string().optional().default(""),
  enumOptions: z.array(z.string()).optional().default([]),
});

const authConfigSchema = z.object({
  token: z.string().optional(),
  key: z.string().optional(),
  headerName: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

const bodySchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().min(5),
  type: z.nativeEnum(IntegrationToolType),
  method: z.nativeEnum(IntegrationHttpMethod),
  url: z.string().url(),
  headers: z.array(headerSchema).default([]),
  authType: z.nativeEnum(IntegrationAuthType).default(IntegrationAuthType.NONE),
  authConfig: authConfigSchema.default({}),
  parameters: z.array(parameterSchema).default([]),
  bodyTemplate: z.string().optional().nullable(),
  responseMapping: z
    .object({
      success: z.string().optional(),
      message: z.string().optional(),
      data: z.string().optional(),
    })
    .optional(),
  aiInstructions: z.string().optional().nullable(),
  timeoutMs: z.number().int().min(1000).max(60000).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return err("Unauthorized", 401);
  const { id } = await context.params;
  const tool = await getIntegrationTool(id);
  if (!tool) return err("Not found", 404);
  return NextResponse.json({ status: "success", data: tool });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return err("Unauthorized", 401);
  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }
  if (!isValidToolName(parsed.data.name)) {
    return err(
      "Tool name must be snake_case (lowercase letters, digits, underscores).",
      400,
    );
  }
  try {
    const updated = await updateIntegrationTool(
      id,
      parsed.data as IntegrationToolInput,
    );
    revalidatePath("/admin/integration-tools");
    revalidatePath(`/admin/integration-tools/${id}`);
    return NextResponse.json({ status: "success", data: updated });
  } catch (error) {
    return err((error as Error).message ?? "Failed to update.", 500);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return err("Unauthorized", 401);
  const { id } = await context.params;
  try {
    await deleteIntegrationTool(id);
    revalidatePath("/admin/integration-tools");
    return NextResponse.json({ status: "success" });
  } catch (error) {
    return err((error as Error).message ?? "Failed to delete.", 500);
  }
}
