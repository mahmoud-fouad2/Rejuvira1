import { renderSitemapIndexXml, xmlHeaders } from "@/lib/seo-sitemaps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(renderSitemapIndexXml(), {
    status: 200,
    headers: xmlHeaders,
  });
}
