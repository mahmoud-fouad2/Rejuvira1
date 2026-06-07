import { getSitemapEntries, renderPagesSitemapXml, xmlHeaders } from "@/lib/seo-sitemaps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await getSitemapEntries();
  return new Response(renderPagesSitemapXml(entries), {
    status: 200,
    headers: xmlHeaders,
  });
}
