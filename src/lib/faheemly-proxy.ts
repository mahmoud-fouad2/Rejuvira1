export const dynamic = "force-dynamic";

const FAHEEMLY_UPSTREAM_ORIGIN = "https://www.faheemly.com";
const FAHEEMLY_ALLOWED_ORIGIN = "https://www.rejuvera.sa";

export async function proxyFaheemlyRequest(
  request: Request,
  pathname: string,
) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const url = new URL(request.url);
  const targetUrl = `${FAHEEMLY_UPSTREAM_ORIGIN}${pathname}${url.search}`;

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "connection" ||
      lower === "content-length"
    ) {
      continue;
    }
    headers.set(key, value);
  }

  headers.set("origin", FAHEEMLY_ALLOWED_ORIGIN);
  headers.set("referer", `${FAHEEMLY_ALLOWED_ORIGIN}/`);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "follow",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(targetUrl, init);

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    responseHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Faheemly proxy failed", details: String(err) }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}
