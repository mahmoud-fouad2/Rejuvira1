import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AppLogLevel = "info" | "warn" | "error" | "debug";

export type AppLogRecord = {
  id: string;
  level: AppLogLevel;
  kind: string;
  message: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

export type RecordAppLogInput = {
  level?: AppLogLevel;
  kind: string;
  message: string;
  meta?: Record<string, unknown> | undefined;
};

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Persist an application-level log entry. Failures fall back to the
 * console so a logging failure never breaks the request path. The
 * `AppLog` model is added in the Prisma schema; when migrations
 * haven't been applied yet the call is silently a no-op.
 */
export async function recordAppLog(input: RecordAppLogInput): Promise<void> {
  const payload = {
    level: input.level ?? "info",
    kind: input.kind || "general",
    message: input.message?.slice(0, 4_000) ?? "",
    meta: (input.meta ?? null) as Prisma.InputJsonValue | null,
  };

  if (!canUseDatabase()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[app-log:${payload.level}] ${payload.kind} — ${payload.message}`,
      );
    }
    return;
  }

  try {
    const client = prisma as unknown as {
      appLog?: {
        create: (args: { data: typeof payload }) => Promise<unknown>;
      };
    };
    if (!client.appLog) {
      return;
    }
    await client.appLog.create({ data: payload });
  } catch (error) {
    console.warn("recordAppLog failed", error);
  }
}

export type AppLogQuery = {
  level?: AppLogLevel | "all";
  kind?: string | "all";
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  cursor?: string;
};

export async function listAppLogs(
  query: AppLogQuery = {},
): Promise<{ items: AppLogRecord[]; nextCursor: string | null }> {
  if (!canUseDatabase()) {
    return { items: [], nextCursor: null };
  }

  try {
    const client = prisma as unknown as {
      appLog?: {
        findMany: (args: {
          where: Record<string, unknown>;
          orderBy: { createdAt: "desc" };
          take: number;
          cursor?: { id: string };
          skip?: number;
        }) => Promise<
          Array<{
            id: string;
            level: string;
            kind: string;
            message: string;
            meta: unknown;
            createdAt: Date;
          }>
        >;
      };
    };

    if (!client.appLog) {
      return { items: [], nextCursor: null };
    }

    const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
    const where: Record<string, unknown> = {};
    if (query.level && query.level !== "all") {
      where.level = query.level;
    }
    if (query.kind && query.kind !== "all") {
      where.kind = query.kind;
    }
    if (query.fromDate || query.toDate) {
      const range: Record<string, Date> = {};
      if (query.fromDate) range.gte = query.fromDate;
      if (query.toDate) range.lte = query.toDate;
      where.createdAt = range;
    }

    const rows = await client.appLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const items = rows.slice(0, limit).map((row) => ({
      id: row.id,
      level: (row.level as AppLogLevel) ?? "info",
      kind: row.kind,
      message: row.message,
      meta:
        row.meta && typeof row.meta === "object" && !Array.isArray(row.meta)
          ? (row.meta as Record<string, unknown>)
          : null,
      createdAt: row.createdAt.toISOString(),
    }));

    const nextCursor = rows.length > limit ? (rows[limit]?.id ?? null) : null;

    return { items, nextCursor };
  } catch {
    return { items: [], nextCursor: null };
  }
}
