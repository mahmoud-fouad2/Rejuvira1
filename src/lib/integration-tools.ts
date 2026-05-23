import {
  IntegrationAuthType,
  IntegrationHttpMethod,
  IntegrationToolType,
  Prisma,
  type IntegrationTool,
  type IntegrationToolLog,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

/* ── Types ─────────────────────────────────────────────────────── */

export type ParameterType = "string" | "number" | "boolean" | "date" | "enum";

export interface IntegrationParameter {
  name: string;
  type: ParameterType;
  required: boolean;
  description?: string;
  example?: string;
  enumOptions?: string[];
}

export interface IntegrationHeader {
  key: string;
  value: string;
}

export interface IntegrationAuthConfig {
  /** Bearer token */
  token?: string;
  /** API key value */
  key?: string;
  /** Header name for API key (defaults to "x-api-key") */
  headerName?: string;
  /** Basic auth */
  username?: string;
  password?: string;
}

export interface IntegrationResponseMapping {
  success?: string;
  message?: string;
  data?: string;
}

export interface IntegrationToolDTO {
  id: string;
  name: string;
  description: string;
  type: IntegrationToolType;
  method: IntegrationHttpMethod;
  url: string;
  headers: IntegrationHeader[];
  authType: IntegrationAuthType;
  authConfig: IntegrationAuthConfig;
  parameters: IntegrationParameter[];
  bodyTemplate: string | null;
  responseMapping: IntegrationResponseMapping;
  aiInstructions: string | null;
  timeoutMs: number;
  isActive: boolean;
  lastTestStatus: string | null;
  lastTestAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationLogDTO {
  id: string;
  integrationId: string;
  toolName: string;
  status: string;
  httpStatus: number | null;
  requestPreview: unknown;
  responsePreview: unknown;
  error: string | null;
  executionMs: number;
  createdAt: string;
}

export interface IntegrationExecutionResult {
  success: boolean;
  message: string;
  data: unknown;
  raw: {
    httpStatus: number | null;
    body: unknown;
  };
  error?: string;
  executionMs: number;
}

/* ── Validation ───────────────────────────────────────────────── */

/** Tool name must be lowercase snake_case. */
export function isValidToolName(name: string): boolean {
  return /^[a-z][a-z0-9_]{1,63}$/.test(name);
}

/* ── Mapping (DB row → DTO) ───────────────────────────────────── */

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function maskAuthConfig(
  authType: IntegrationAuthType,
  raw: unknown,
): IntegrationAuthConfig {
  const cfg = asObject(raw);
  switch (authType) {
    case IntegrationAuthType.BEARER: {
      const token = typeof cfg.token === "string" ? cfg.token : "";
      return { token: maskSecret(token, "Bearer ") };
    }
    case IntegrationAuthType.API_KEY: {
      const key = typeof cfg.key === "string" ? cfg.key : "";
      const headerName =
        typeof cfg.headerName === "string" && cfg.headerName.length > 0
          ? cfg.headerName
          : "x-api-key";
      return { key: maskSecret(key), headerName };
    }
    case IntegrationAuthType.BASIC: {
      const username = typeof cfg.username === "string" ? cfg.username : "";
      return { username, password: cfg.password ? "********" : "" };
    }
    default:
      return {};
  }
}

/** Mask a secret value preserving last 4 chars. */
export function maskSecret(value: string, prefix = ""): string {
  if (!value) return "";
  const last4 = value.slice(-4);
  if (value.length <= 4) return `${prefix}********`;
  return `${prefix}********${last4}`;
}

function rowToDto(row: IntegrationTool): IntegrationToolDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    method: row.method,
    url: row.url,
    headers: asArray<IntegrationHeader>(row.headersJson),
    authType: row.authType,
    authConfig: maskAuthConfig(row.authType, row.authConfigJson),
    parameters: asArray<IntegrationParameter>(row.parametersJson),
    bodyTemplate:
      typeof row.bodyTemplateJson === "string"
        ? row.bodyTemplateJson
        : row.bodyTemplateJson != null
          ? JSON.stringify(row.bodyTemplateJson, null, 2)
          : null,
    responseMapping: asObject(
      row.responseMappingJson,
    ) as IntegrationResponseMapping,
    aiInstructions: row.aiInstructions,
    timeoutMs: row.timeoutMs,
    isActive: row.isActive,
    lastTestStatus: row.lastTestStatus,
    lastTestAt: row.lastTestAt ? row.lastTestAt.toISOString() : null,
    lastError: row.lastError,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function logRowToDto(row: IntegrationToolLog): IntegrationLogDTO {
  return {
    id: row.id,
    integrationId: row.integrationId,
    toolName: row.toolName,
    status: row.status,
    httpStatus: row.httpStatus,
    requestPreview: row.requestPreview,
    responsePreview: row.responsePreview,
    error: row.error,
    executionMs: row.executionMs,
    createdAt: row.createdAt.toISOString(),
  };
}

/* ── CRUD ──────────────────────────────────────────────────────── */

export interface IntegrationToolInput {
  name: string;
  description: string;
  type: IntegrationToolType;
  method: IntegrationHttpMethod;
  url: string;
  headers: IntegrationHeader[];
  authType: IntegrationAuthType;
  authConfig: IntegrationAuthConfig;
  parameters: IntegrationParameter[];
  bodyTemplate?: string | null;
  responseMapping?: IntegrationResponseMapping;
  aiInstructions?: string | null;
  timeoutMs?: number;
  isActive?: boolean;
}

function sanitizeAuthConfig(
  authType: IntegrationAuthType,
  raw: IntegrationAuthConfig,
  existing?: IntegrationAuthConfig | null,
): IntegrationAuthConfig {
  switch (authType) {
    case IntegrationAuthType.BEARER: {
      const token = raw.token ?? "";
      const isMasked = token.includes("********");
      return { token: isMasked && existing?.token ? existing.token : token };
    }
    case IntegrationAuthType.API_KEY: {
      const key = raw.key ?? "";
      const isMasked = key.includes("********");
      return {
        key: isMasked && existing?.key ? existing.key : key,
        headerName: raw.headerName?.trim() || "x-api-key",
      };
    }
    case IntegrationAuthType.BASIC: {
      const password = raw.password ?? "";
      const isMasked = password === "********";
      return {
        username: raw.username ?? "",
        password:
          isMasked && existing?.password ? existing.password : password,
      };
    }
    default:
      return {};
  }
}

function buildPersistPayload(
  input: IntegrationToolInput,
  existingAuth?: IntegrationAuthConfig | null,
) {
  const cleanedAuth = sanitizeAuthConfig(
    input.authType,
    input.authConfig,
    existingAuth ?? null,
  );
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    type: input.type,
    method: input.method,
    url: input.url.trim(),
    headersJson: input.headers.filter(
      (h) => h.key.trim().length > 0,
    ) as unknown as Prisma.InputJsonValue,
    authType: input.authType,
    authConfigJson:
      input.authType === IntegrationAuthType.NONE
        ? Prisma.JsonNull
        : (cleanedAuth as unknown as Prisma.InputJsonValue),
    parametersJson: input.parameters as unknown as Prisma.InputJsonValue,
    bodyTemplateJson:
      input.bodyTemplate && input.bodyTemplate.trim().length > 0
        ? (input.bodyTemplate as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    responseMappingJson: input.responseMapping
      ? (input.responseMapping as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    aiInstructions: input.aiInstructions ?? null,
    timeoutMs: Math.max(
      1000,
      Math.min(60000, Math.floor(input.timeoutMs ?? 10000)),
    ),
    isActive: input.isActive ?? true,
  };
}

export async function listIntegrationTools(): Promise<IntegrationToolDTO[]> {
  const rows = await prisma.integrationTool.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(rowToDto);
}

export async function getIntegrationTool(
  id: string,
): Promise<IntegrationToolDTO | null> {
  const row = await prisma.integrationTool.findUnique({ where: { id } });
  return row ? rowToDto(row) : null;
}

/** Internal: returns full unmasked record (use with care). */
export async function getIntegrationToolFull(id: string) {
  return prisma.integrationTool.findUnique({ where: { id } });
}

export async function createIntegrationTool(
  input: IntegrationToolInput,
): Promise<IntegrationToolDTO> {
  if (!isValidToolName(input.name)) {
    throw new Error(
      "Tool name must be snake_case (lowercase letters, digits, underscores).",
    );
  }
  const data = buildPersistPayload(input);
  const row = await prisma.integrationTool.create({ data });
  return rowToDto(row);
}

export async function updateIntegrationTool(
  id: string,
  input: IntegrationToolInput,
): Promise<IntegrationToolDTO> {
  if (!isValidToolName(input.name)) {
    throw new Error(
      "Tool name must be snake_case (lowercase letters, digits, underscores).",
    );
  }
  const existing = await prisma.integrationTool.findUnique({ where: { id } });
  if (!existing) throw new Error("Integration not found.");
  const data = buildPersistPayload(
    input,
    asObject(existing.authConfigJson) as IntegrationAuthConfig,
  );
  const row = await prisma.integrationTool.update({ where: { id }, data });
  return rowToDto(row);
}

export async function setIntegrationToolStatus(
  id: string,
  isActive: boolean,
): Promise<IntegrationToolDTO> {
  const row = await prisma.integrationTool.update({
    where: { id },
    data: { isActive },
  });
  return rowToDto(row);
}

export async function deleteIntegrationTool(id: string): Promise<void> {
  await prisma.integrationTool.delete({ where: { id } });
}

export async function listIntegrationLogs(
  integrationId: string,
  limit = 25,
): Promise<IntegrationLogDTO[]> {
  const rows = await prisma.integrationToolLog.findMany({
    where: { integrationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(logRowToDto);
}

/* ── Template interpolation ──────────────────────────────────── */

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function interpolateTemplate(
  template: string,
  params: Record<string, unknown>,
): string {
  return template.replace(PLACEHOLDER_RE, (_match, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) return "";
    return String(value);
  });
}

function interpolateUrl(url: string, params: Record<string, unknown>): string {
  return interpolateTemplate(url, params);
}

function buildBody(
  template: string | null,
  params: Record<string, unknown>,
): { contentType: string; body: string } | null {
  if (!template) return null;
  const trimmed = template.trim();
  if (!trimmed) return null;
  const interpolated = interpolateTemplate(trimmed, params);
  // Try to keep JSON shape if template parses as JSON
  try {
    JSON.parse(interpolated);
    return { contentType: "application/json", body: interpolated };
  } catch {
    return { contentType: "text/plain", body: interpolated };
  }
}

/* ── Parameter validation ────────────────────────────────────── */

function coerceParameter(
  param: IntegrationParameter,
  raw: unknown,
): { ok: true; value: unknown } | { ok: false; reason: string } {
  if (raw === undefined || raw === null || raw === "") {
    if (param.required) {
      return { ok: false, reason: `Missing required parameter: ${param.name}` };
    }
    return { ok: true, value: undefined };
  }
  switch (param.type) {
    case "number": {
      const n = typeof raw === "number" ? raw : Number(String(raw));
      if (Number.isNaN(n)) {
        return { ok: false, reason: `${param.name} must be a number.` };
      }
      return { ok: true, value: n };
    }
    case "boolean": {
      if (typeof raw === "boolean") return { ok: true, value: raw };
      const s = String(raw).toLowerCase();
      if (["true", "1", "yes"].includes(s)) return { ok: true, value: true };
      if (["false", "0", "no"].includes(s)) return { ok: true, value: false };
      return { ok: false, reason: `${param.name} must be a boolean.` };
    }
    case "date": {
      const d = new Date(String(raw));
      if (Number.isNaN(d.getTime())) {
        return { ok: false, reason: `${param.name} must be a valid date.` };
      }
      return { ok: true, value: d.toISOString() };
    }
    case "enum": {
      const opts = param.enumOptions ?? [];
      const v = String(raw);
      if (opts.length > 0 && !opts.includes(v)) {
        return {
          ok: false,
          reason: `${param.name} must be one of: ${opts.join(", ")}`,
        };
      }
      return { ok: true, value: v };
    }
    default:
      return { ok: true, value: String(raw) };
  }
}

/* ── Header / Auth assembly ──────────────────────────────────── */

function assembleHeaders(
  base: IntegrationHeader[],
  authType: IntegrationAuthType,
  authConfig: IntegrationAuthConfig,
  contentType?: string,
): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const h of base) {
    if (h.key.trim()) headers[h.key.trim()] = h.value;
  }
  if (contentType && !headers["Content-Type"]) {
    headers["Content-Type"] = contentType;
  }
  switch (authType) {
    case IntegrationAuthType.BEARER:
      if (authConfig.token) {
        headers["Authorization"] = `Bearer ${authConfig.token}`;
      }
      break;
    case IntegrationAuthType.API_KEY:
      if (authConfig.key) {
        const name = authConfig.headerName?.trim() || "x-api-key";
        headers[name] = authConfig.key;
      }
      break;
    case IntegrationAuthType.BASIC:
      if (authConfig.username) {
        const creds = `${authConfig.username}:${authConfig.password ?? ""}`;
        const encoded = Buffer.from(creds, "utf8").toString("base64");
        headers["Authorization"] = `Basic ${encoded}`;
      }
      break;
    default:
      break;
  }
  return headers;
}

/* ── Response mapping (very small JSONPath subset: $.a.b) ────── */

function pickPath(value: unknown, expr?: string): unknown {
  if (!expr) return undefined;
  const trimmed = expr.trim();
  if (!trimmed || trimmed === "$") return value;
  const parts = trimmed.replace(/^\$\.?/, "").split(".").filter(Boolean);
  let current: unknown = value;
  for (const part of parts) {
    if (current && typeof current === "object" && part in (current as object)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

/* ── Executor ────────────────────────────────────────────────── */

export interface ExecutionContext {
  integration: IntegrationTool;
  params: Record<string, unknown>;
  /** Persist a log entry. Defaults to true. */
  persistLog?: boolean;
}

export async function executeIntegration(
  ctx: ExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { integration, params, persistLog = true } = ctx;
  const start = Date.now();

  if (!integration.isActive) {
    const result = errorResult("Integration is inactive.", start);
    if (persistLog) await logExecution(integration, params, result, null);
    return result;
  }

  const parameters = asArray<IntegrationParameter>(integration.parametersJson);
  const collected: Record<string, unknown> = {};
  for (const param of parameters) {
    const coerced = coerceParameter(param, params[param.name]);
    if (!coerced.ok) {
      const result = errorResult(coerced.reason, start);
      if (persistLog) await logExecution(integration, params, result, null);
      return result;
    }
    if (coerced.value !== undefined) collected[param.name] = coerced.value;
  }

  let url: string;
  try {
    url = interpolateUrl(integration.url, collected);
    new URL(url);
  } catch {
    const result = errorResult("Invalid endpoint URL.", start);
    if (persistLog) await logExecution(integration, params, result, null);
    return result;
  }

  const bodyTemplate =
    typeof integration.bodyTemplateJson === "string"
      ? (integration.bodyTemplateJson as string)
      : integration.bodyTemplateJson
        ? JSON.stringify(integration.bodyTemplateJson)
        : null;

  const built = buildBody(bodyTemplate, collected);
  const headers = assembleHeaders(
    asArray<IntegrationHeader>(integration.headersJson),
    integration.authType,
    asObject(integration.authConfigJson) as IntegrationAuthConfig,
    built?.contentType,
  );

  const method = integration.method;
  const sendBody =
    method !== IntegrationHttpMethod.GET && method !== IntegrationHttpMethod.DELETE;

  const controller = new AbortController();
  const timeout = Math.max(
    1000,
    Math.min(60000, integration.timeoutMs ?? 10000),
  );
  const timer = setTimeout(() => controller.abort(), timeout);

  let response: Response | null = null;
  let bodyText = "";
  let parsedBody: unknown = null;
  let error: string | null = null;
  let httpStatus: number | null = null;

  try {
    const init: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };
    if (sendBody && built) init.body = built.body;
    response = await fetch(url, init);
    httpStatus = response.status;
    bodyText = await response.text();
    if (bodyText) {
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = bodyText;
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      error = `Request timed out after ${timeout}ms.`;
    } else {
      error = (err as Error).message || "Network error.";
    }
  } finally {
    clearTimeout(timer);
  }

  const elapsed = Date.now() - start;

  let result: IntegrationExecutionResult;
  if (error) {
    result = {
      success: false,
      message: error,
      data: null,
      raw: { httpStatus, body: parsedBody },
      error,
      executionMs: elapsed,
    };
  } else if (!response || response.status < 200 || response.status >= 300) {
    const message =
      typeof parsedBody === "object" && parsedBody !== null
        ? (((parsedBody as Record<string, unknown>).message as string) ??
          `HTTP ${response?.status ?? "?"}`)
        : `HTTP ${response?.status ?? "?"}`;
    result = {
      success: false,
      message,
      data: null,
      raw: { httpStatus, body: parsedBody },
      error: message,
      executionMs: elapsed,
    };
  } else {
    const mapping = asObject(
      integration.responseMappingJson,
    ) as IntegrationResponseMapping;
    const successFlag =
      mapping.success != null
        ? Boolean(pickPath(parsedBody, mapping.success))
        : true;
    const message =
      typeof pickPath(parsedBody, mapping.message) === "string"
        ? (pickPath(parsedBody, mapping.message) as string)
        : "OK";
    const data =
      mapping.data != null ? pickPath(parsedBody, mapping.data) : parsedBody;

    result = {
      success: successFlag,
      message,
      data,
      raw: { httpStatus, body: parsedBody },
      executionMs: elapsed,
    };
  }

  if (persistLog) {
    await logExecution(integration, collected, result, headers).catch(() => {});
  }
  await prisma.integrationTool
    .update({
      where: { id: integration.id },
      data: {
        lastTestStatus: result.success ? "ok" : "error",
        lastTestAt: new Date(),
        lastError: result.success ? null : (result.error ?? null),
      },
    })
    .catch(() => {});

  return result;
}

function errorResult(
  message: string,
  start: number,
): IntegrationExecutionResult {
  return {
    success: false,
    message,
    data: null,
    raw: { httpStatus: null, body: null },
    error: message,
    executionMs: Date.now() - start,
  };
}

function previewObject(value: unknown): unknown {
  try {
    const text = JSON.stringify(value);
    if (!text) return null;
    if (text.length > 4000) return text.slice(0, 4000) + "…";
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function logExecution(
  tool: IntegrationTool,
  params: Record<string, unknown>,
  result: IntegrationExecutionResult,
  headers: Record<string, string> | null,
) {
  // strip auth header for logging
  const safeHeaders = headers
    ? Object.fromEntries(
        Object.entries(headers).map(([k, v]) => [
          k,
          /authorization|api[-_]?key|x-api-key/i.test(k) ? "***" : v,
        ]),
      )
    : {};
  await prisma.integrationToolLog.create({
    data: {
      integrationId: tool.id,
      toolName: tool.name,
      status: result.success ? "ok" : "error",
      httpStatus: result.raw.httpStatus,
      requestPreview: previewObject({
        params,
        headers: safeHeaders,
      }) as object,
      responsePreview: previewObject(result.raw.body) as object,
      error: result.error ?? null,
      executionMs: result.executionMs,
    },
  });
}

/* ── Public helper: call by tool name ────────────────────────── */

export async function executeIntegrationTool(
  toolName: string,
  params: Record<string, unknown>,
): Promise<IntegrationExecutionResult> {
  const integration = await prisma.integrationTool.findUnique({
    where: { name: toolName },
  });
  if (!integration) {
    return {
      success: false,
      message: `Tool not found: ${toolName}`,
      data: null,
      raw: { httpStatus: null, body: null },
      error: "tool_not_found",
      executionMs: 0,
    };
  }
  return executeIntegration({ integration, params });
}
