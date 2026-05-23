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
  createIntegrationTool,
  isValidToolName,
  listIntegrationTools,
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

const responseMappingSchema = z.object({
  success: z.string().optional(),
  message: z.string().optional(),
  data: z.string().optional(),
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
  responseMapping: responseMappingSchema.optional(),
  aiInstructions: z.string().optional().nullable(),
  timeoutMs: z.number().int().min(1000).max(60000).optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return err("Unauthorized", 401);
  const tools = await listIntegrationTools();
  return NextResponse.json({ status: "success", data: tools });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return err("Unauthorized", 401);
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
    const created = await createIntegrationTool(
      parsed.data as IntegrationToolInput,
    );
    revalidatePath("/admin/integration-tools");
    return NextResponse.json({ status: "success", data: created });
  } catch (error) {
    const message = (error as Error).message ?? "Failed to create.";
    if (/Unique|name/i.test(message)) {
      return err("A tool with this name already exists.", 409);
    }
    return err(message, 500);
  }
}
