import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ path: string[] }> },) {
  const { path } = await props.params;
  const subPath = (path || []).join("/");
  const url = new URL(request.url);
  const targetUrl = "https://www.faheemly.com/api/widget/" + subPath + url.search;

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
        Accept: request.headers.get("accept") || "*/*",
        Origin: "https://www.rejuvera.sa",
      },
      cache: "no-store",
    });

    const data = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get("content-type") || "application/json; charset=utf-8";

    return new Response(data, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch widget resource", details: String(err) },
      { status: 502 },
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ path: string[] }> },
) {
  const { path } = await props.params;
  const subPath = (path || []).join("/");
  const url = new URL(request.url);
  const targetUrl = "https://www.faheemly.com/api/widget/" + subPath + url.search;

  try {
    const body = await request.arrayBuffer();
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
        "Content-Type":
          request.headers.get("content-type") || "application/json",
        Origin: "https://www.rejuvera.sa",
      },
      body,
    });

    const data = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get("content-type") || "application/json; charset=utf-8";

    return new Response(data, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to forward widget request", details: String(err) },
      { status: 502 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}
