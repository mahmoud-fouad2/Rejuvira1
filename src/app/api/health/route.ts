import { releaseRevision } from "@/lib/release-revision";

export const dynamic = "force-dynamic";

/**
 * Lightweight health check that does NOT hit the database.
 * Render pings this every ~30s; using Prisma here was causing
 * excessive connection churn and contributing to the
 * "PostgreSQL connection: Closed" errors in production logs.
 */
export async function GET() {
  return Response.json(
    {
      ok: true,
      service: "rejuvera",
      timestamp: new Date().toISOString(),
      revision: releaseRevision(process.env.RENDER_GIT_COMMIT),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
