import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaDbInfoLogged: boolean | undefined;
  lastTransientPrismaErrorAt: number | undefined;
};

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function isLocalDatabaseHost(hostname: string) {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname.toLowerCase());
}

function isRenderRuntime() {
  return Boolean(
    process.env.RENDER ||
      process.env.RENDER_SERVICE_ID ||
      process.env.RENDER_EXTERNAL_HOSTNAME,
  );
}

function buildRuntimeDatabaseUrl(rawUrl: string | undefined) {
  if (!rawUrl) return undefined;

  const normalized = stripWrappingQuotes(rawUrl);
  try {
    const url = new URL(normalized);
    if (!["postgresql:", "postgres:"].includes(url.protocol)) {
      console.warn(
        "[database] DATABASE_URL has an unsupported protocol for Prisma.",
      );
      return normalized;
    }

    const shouldApplyRenderPooling =
      (isRenderRuntime() || process.env.NODE_ENV === "production") &&
      !isLocalDatabaseHost(url.hostname);

    if (shouldApplyRenderPooling) {
      if (!url.searchParams.has("sslmode")) {
        url.searchParams.set("sslmode", "require");
      }
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set(
          "connection_limit",
          process.env.PRISMA_RUNTIME_CONNECTION_LIMIT || "1",
        );
      }
      if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set(
          "pool_timeout",
          process.env.PRISMA_RUNTIME_POOL_TIMEOUT || "20",
        );
      }
      if (!url.searchParams.has("connect_timeout")) {
        url.searchParams.set(
          "connect_timeout",
          process.env.PRISMA_RUNTIME_CONNECT_TIMEOUT || "15",
        );
      }
    }

    return url.toString();
  } catch {
    console.warn("[database] DATABASE_URL is not a valid URL.");
    return normalized;
  }
}

function getSafeDatabaseInfo(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    return { host: "not-configured", port: "not-configured" };
  }

  try {
    const url = new URL(stripWrappingQuotes(databaseUrl));
    return {
      host: url.hostname || "unknown",
      port: url.port || "default",
    };
  } catch {
    return { host: "invalid-url", port: "invalid-url" };
  }
}

function logDatabaseRuntimeInfo(databaseUrl: string | undefined) {
  if (globalForPrisma.prismaDbInfoLogged) return;
  globalForPrisma.prismaDbInfoLogged = true;

  const info = getSafeDatabaseInfo(databaseUrl);
  console.info(
    `[database] NODE_ENV=${process.env.NODE_ENV || "unknown"} DB_HOST=${info.host} DB_PORT=${info.port}`,
  );
}

function isTransientPrismaConnectionMessage(message: string) {
  return (
    message.includes("PostgreSQL connection") ||
    message.includes("kind: Closed") ||
    message.includes("Connection terminated") ||
    message.includes("Can't reach database server") ||
    message.includes("Timed out fetching a new connection")
  );
}

const prismaLogConfig = [
  { emit: "event", level: "error" },
  { emit: "stdout", level: "warn" },
] satisfies Prisma.PrismaClientOptions["log"];

function createPrismaClient() {
  const client = new PrismaClient({
    log: prismaLogConfig,
    ...(runtimeDatabaseUrl ? { datasourceUrl: runtimeDatabaseUrl } : {}),
  });

  client.$on("error", (event) => {
    if (isTransientPrismaConnectionMessage(event.message)) {
      const now = Date.now();
      const last = globalForPrisma.lastTransientPrismaErrorAt ?? 0;
      if (now - last > 60_000) {
        globalForPrisma.lastTransientPrismaErrorAt = now;
        console.warn(
          "[database] transient Prisma/PostgreSQL connection closed; Prisma will reconnect on the next query.",
        );
      }
      return;
    }

    console.error("[database] Prisma error:", event.message);
  });

  return client;
}

const runtimeDatabaseUrl = buildRuntimeDatabaseUrl(process.env.DATABASE_URL);
if (process.env.npm_lifecycle_event !== "build") {
  logDatabaseRuntimeInfo(runtimeDatabaseUrl);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
