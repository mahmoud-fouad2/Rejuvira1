import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch (error) {
    console.error(
      "[database] health check failed:",
      error instanceof Error ? error.name : typeof error,
    );
    return Response.json(
      {
        status: "error",
        message: "Database connection failed",
      },
      { status: 500 },
    );
  }
}
