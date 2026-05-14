import { prisma } from "@/lib/prisma";
import {
  backupKey,
  isR2Configured,
  uploadObject,
} from "@/lib/storage/r2";
import { recordAppLog } from "@/lib/app-log";

export type BackupResult = {
  ok: boolean;
  key?: string;
  url?: string;
  size?: number;
  error?: string;
  countsByModel: Record<string, number>;
};

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Snapshot the core content tables to a JSON document and (when R2
 * is configured) upload it to the `backups/yyyy/mm/...` prefix. PII
 * on contact submissions is reduced to a summary (id, status, dates,
 * preferred language) so backups don't leak personal data.
 */
export async function runBackup(): Promise<BackupResult> {
  if (!canUseDatabase()) {
    return {
      ok: false,
      error: "DATABASE_URL is not set; nothing to back up.",
      countsByModel: {},
    };
  }

  try {
    const [
      settings,
      doctors,
      services,
      devices,
      gallery,
      journalPosts,
      submissionsSummary,
      auditLogs,
    ] = await Promise.all([
      prisma.siteSetting.findMany().catch(() => []),
      prisma.doctor.findMany().catch(() => []),
      prisma.service.findMany().catch(() => []),
      prisma.device.findMany().catch(() => []),
      prisma.galleryItem.findMany().catch(() => []),
      prisma.journalPost.findMany().catch(() => []),
      prisma.contactSubmission
        .findMany({
          select: {
            id: true,
            status: true,
            preferredLanguage: true,
            source: true,
            createdAt: true,
            updatedAt: true,
            serviceId: true,
            assignedToId: true,
          },
        })
        .catch(() => []),
      prisma.auditLog.findMany({ take: 500, orderBy: { createdAt: "desc" } }).catch(() => []),
    ]);

    const payload = {
      version: 1,
      generatedAt: new Date().toISOString(),
      app: "rejuvira-center-web",
      counts: {
        settings: settings.length,
        doctors: doctors.length,
        services: services.length,
        devices: devices.length,
        gallery: gallery.length,
        journalPosts: journalPosts.length,
        contactSubmissions: submissionsSummary.length,
        auditLogs: auditLogs.length,
      },
      data: {
        settings,
        doctors,
        services,
        devices,
        gallery,
        journalPosts,
        contactSubmissions: submissionsSummary,
        auditLogs,
      },
    };

    const json = JSON.stringify(payload, null, 2);
    const size = Buffer.byteLength(json, "utf8");
    const counts = payload.counts as Record<string, number>;

    if (!isR2Configured()) {
      await recordAppLog({
        level: "warn",
        kind: "backup",
        message: "Backup generated but R2 is not configured; skipping upload.",
        meta: { size, counts },
      });
      return {
        ok: true,
        size,
        countsByModel: counts,
        error: "R2 not configured — backup not stored remotely.",
      };
    }

    const key = backupKey(new Date());
    const uploaded = await uploadObject(key, json, "application/json");
    await recordAppLog({
      level: "info",
      kind: "backup",
      message: `Backup uploaded to ${uploaded.key}`,
      meta: { size: uploaded.size, key: uploaded.key, counts },
    });
    return {
      ok: true,
      key: uploaded.key,
      url: uploaded.url,
      size: uploaded.size,
      countsByModel: counts,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await recordAppLog({
      level: "error",
      kind: "backup",
      message: `Backup failed: ${message}`,
    });
    return { ok: false, error: message, countsByModel: {} };
  }
}

/**
 * Build a CSV export for a logical entity (currently used for CRM
 * submissions and logs). Returns the CSV string ready for download.
 */
export function buildCsv(
  rows: Array<Record<string, unknown>>,
  columns: Array<{ key: string; label: string }>,
): string {
  const header = columns.map((col) => csvCell(col.label)).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => csvCell(row[col.key]))
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str: string;
  if (value instanceof Date) {
    str = value.toISOString();
  } else if (typeof value === "object") {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export type ConnectionCheck = {
  database: { ok: boolean; detail?: string };
  r2: { ok: boolean; detail?: string };
  recaptcha: { ok: boolean; detail?: string };
};

export async function runConnectionChecks(): Promise<ConnectionCheck> {
  const database = await (async () => {
    if (!canUseDatabase()) {
      return { ok: false as const, detail: "DATABASE_URL not set" };
    }
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ok: true as const };
    } catch (error) {
      return {
        ok: false as const,
        detail: error instanceof Error ? error.message : "Unknown DB error",
      };
    }
  })();

  const r2 = await (async () => {
    if (!isR2Configured()) {
      return { ok: false as const, detail: "R2 env vars missing" };
    }
    try {
      const { getR2Credentials } = await import("@/lib/storage/r2");
      const creds = getR2Credentials();
      return {
        ok: true as const,
        detail: `bucket=${creds.bucket}`,
      };
    } catch (error) {
      return {
        ok: false as const,
        detail: error instanceof Error ? error.message : "Unknown R2 error",
      };
    }
  })();

  const recaptcha = (() => {
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      return { ok: false as const, detail: "RECAPTCHA_SECRET_KEY missing" };
    }
    return {
      ok: true as const,
      detail: process.env.RECAPTCHA_SITE_KEY
        ? "secret + site key set"
        : "secret only",
    };
  })();

  return { database, r2, recaptcha };
}
