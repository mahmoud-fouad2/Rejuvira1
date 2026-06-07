import { renderLlmsTxt, textHeaders } from "@/lib/seo-sitemaps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(await renderLlmsTxt(), {
    status: 200,
    headers: textHeaders,
  });
}
