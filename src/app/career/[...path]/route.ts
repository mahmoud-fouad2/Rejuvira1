import { proxyCareerRequest } from "@/lib/career-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = proxyCareerRequest;
export const HEAD = proxyCareerRequest;
export const POST = proxyCareerRequest;
export const PUT = proxyCareerRequest;
export const PATCH = proxyCareerRequest;
export const DELETE = proxyCareerRequest;
export const OPTIONS = proxyCareerRequest;
