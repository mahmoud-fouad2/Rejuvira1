import { getSitemapEntries, renderImageSitemapXml, xmlHeaders } from "@/lib/seo-sitemaps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await getSitemapEntries();
  return new Response(renderImageSitemapXml(entries), {
    status: 200,
    headers: xmlHeaders,
  });
}
