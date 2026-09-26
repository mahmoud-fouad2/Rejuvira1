import { NextResponse } from "next/server";

import { getRuntimeSettings } from "@/lib/content-repository";

const UPSTREAM_ORIGIN =
  process.env.CAREER_UPSTREAM_ORIGIN?.replace(/\/+$/, "") ||
  "https://mail.dralsalmi.com";
const UPSTREAM_FALLBACK_ORIGINS = [
  "https://ntk.zut.mybluehost.me",
  "https://dralsalmi.com",
] as const;
const UPSTREAM_REWRITE_ORIGINS = Array.from(
  new Set([
    UPSTREAM_ORIGIN,
    "https://mail.dralsalmi.com",
    "https://ntk.zut.mybluehost.me",
    "https://www.dralsalmi.com",
    "https://dralsalmi.com",
  ]),
);
const UPSTREAM_PREFIX = "/career";
const LOCAL_PREFIX = "/career";
const UPSTREAM_HOST = "dralsalmi.com";

const DEFAULT_UPSTREAM_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

// Shared secret the upstream's Cloudflare rule can match to let this proxy through.
const PROXY_KEY_HEADER = "x-rejuvera-proxy-key";
// Bounds time-to-headers (and HTML buffering); form posts get longer.
const UPSTREAM_TIMEOUT_MS = 20_000;
const UPSTREAM_WRITE_TIMEOUT_MS = 60_000;
const ASSET_PATH =
  /\.(?:js|mjs|css|map|json|xml|txt|pdf|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|mp4|webm)$/i;

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host-header",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const REQUEST_HEADERS_TO_FORWARD = [
  "accept",
  "accept-language",
  "content-type",
  "user-agent",
  "x-requested-with",
] as const;

export const careerProxyCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm",
  "connect-src 'self' https://challenges.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "frame-src 'self' https://challenges.cloudflare.com blob:",
  "child-src 'self' https://challenges.cloudflare.com blob:",
  "media-src 'self' https: data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || "";
}

function getRequestOrigin(request: Request, fallbackUrl: URL) {
  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ||
    firstHeaderValue(request.headers.get("host")) ||
    fallbackUrl.host;
  const proto =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ||
    fallbackUrl.protocol.replace(/:$/, "") ||
    "https";
  return `${proto}://${host}`;
}

function upstreamUrlFor(request: Request, origin = UPSTREAM_ORIGIN) {
  const url = new URL(request.url);
  const suffix = url.pathname.slice(LOCAL_PREFIX.length);
  const upstream = new URL(`${UPSTREAM_PREFIX}${suffix || "/"}`, origin);
  upstream.search = url.search;
  return upstream;
}

function rewriteOutboundLocation(value: string, request: Request) {
  const requestOrigin = getRequestOrigin(request, new URL(request.url));
  for (const origin of UPSTREAM_REWRITE_ORIGINS) {
    if (value.startsWith(`${origin}${UPSTREAM_PREFIX}`)) {
      return `${requestOrigin}${value.slice(origin.length)}`;
    }
    if (value.startsWith(`${origin}/`)) {
      return `${requestOrigin}${LOCAL_PREFIX}${value.slice(origin.length)}`;
    }
  }
  if (value.startsWith(UPSTREAM_PREFIX)) {
    return `${requestOrigin}${value}`;
  }
  if (value.startsWith("/")) {
    return `${requestOrigin}${LOCAL_PREFIX}${value}`;
  }
  return value;
}

function rewriteInboundReferer(
  value: string | null,
  request: Request,
  upstreamOrigin = UPSTREAM_ORIGIN,
) {
  if (!value) return null;
  const requestOrigin = getRequestOrigin(request, new URL(request.url));
  return value.replace(
    `${requestOrigin}${LOCAL_PREFIX}`,
    `${upstreamOrigin}${UPSTREAM_PREFIX}`,
  );
}

function filteredCookieHeader(value: string | null) {
  if (!value) return undefined;
  const allowed = value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => /^PHPSESSID=/i.test(part));
  return allowed.length ? allowed.join("; ") : undefined;
}

function splitSetCookie(value: string) {
  return value.split(/,(?=\s*[^;,=\s]+=[^;]*)/g).map((part) => part.trim());
}

function getSetCookieHeaders(headers: Headers) {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
    raw?: () => Record<string, string[]>;
  };

  if (typeof withGetSetCookie.getSetCookie === "function") {
    return withGetSetCookie.getSetCookie();
  }

  const rawCookies = withGetSetCookie.raw?.()["set-cookie"];
  if (rawCookies?.length) return rawCookies;

  const combined = headers.get("set-cookie");
  return combined ? splitSetCookie(combined) : [];
}

function rewriteSetCookie(value: string) {
  if (/^(?:__cf_bm|_cfuvid)=/i.test(value)) return null;

  let cookie = value
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*Path=[^;]*/i, "; Path=/career");

  if (!/;\s*Path=/i.test(cookie)) {
    cookie += "; Path=/career";
  }

  if (!/;\s*Secure/i.test(cookie)) {
    cookie += "; Secure";
  }

  if (!/;\s*SameSite=/i.test(cookie)) {
    cookie += "; SameSite=Lax";
  }

  return cookie;
}

function responseHeadersFrom(upstream: Response, request: Request) {
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  const cacheControl = upstream.headers.get("cache-control");
  const location = upstream.headers.get("location");

  if (contentType) headers.set("content-type", contentType);
  if (cacheControl) headers.set("cache-control", cacheControl);
  if (location) headers.set("location", rewriteOutboundLocation(location, request));

  for (const [key, value] of upstream.headers) {
    const lower = key.toLowerCase();
    if (
      HOP_BY_HOP_HEADERS.has(lower) ||
      lower === "content-type" ||
      lower === "cache-control" ||
      lower === "location" ||
      lower === "set-cookie" ||
      lower === "content-security-policy" ||
      lower === "x-content-security-policy" ||
      lower === "x-webkit-csp"
    ) {
      continue;
    }
    headers.set(key, value);
  }

  for (const cookie of getSetCookieHeaders(upstream.headers)) {
    const rewritten = rewriteSetCookie(cookie);
    if (rewritten) headers.append("set-cookie", rewritten);
  }

  headers.set("content-security-policy", careerProxyCsp);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-career-proxy", UPSTREAM_HOST);

  return headers;
}

function rewriteHtml(html: string, request: Request) {
  const requestOrigin = getRequestOrigin(request, new URL(request.url));
  let output = html;
  for (const origin of UPSTREAM_REWRITE_ORIGINS) {
    output = output
      .replaceAll(
        `${origin}${UPSTREAM_PREFIX}/`,
        `${requestOrigin}${LOCAL_PREFIX}/`,
      )
      .replaceAll(
        `${origin}${UPSTREAM_PREFIX}`,
        `${requestOrigin}${LOCAL_PREFIX}`,
      );
  }
  return output;
}

async function requestBodyFor(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  return await request.arrayBuffer();
}

function buildUpstreamHeaders(request: Request, upstreamOrigin = UPSTREAM_ORIGIN) {
  const requestUrl = new URL(request.url);
  const requestOrigin = getRequestOrigin(request, requestUrl);
  const headers = new Headers();

  for (const key of REQUEST_HEADERS_TO_FORWARD) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }

  const ua = headers.get("user-agent")?.trim();
  if (!ua || ua === "Mozilla/5.0") {
    headers.set("user-agent", DEFAULT_UPSTREAM_USER_AGENT);
  }

  const cookie = filteredCookieHeader(request.headers.get("cookie"));
  if (cookie) headers.set("cookie", cookie);

  const referer = rewriteInboundReferer(
    request.headers.get("referer"),
    request,
    upstreamOrigin,
  );
  if (referer) headers.set("referer", referer);

  const origin = request.headers.get("origin");
  if (origin === requestOrigin) {
    headers.set("origin", upstreamOrigin);
  }

  headers.set("x-forwarded-host", requestUrl.host);
  headers.set("x-forwarded-prefix", LOCAL_PREFIX);
  headers.set("x-forwarded-proto", "https");

  const proxyKey = process.env.CAREER_PROXY_SECRET;
  if (proxyKey) headers.set(PROXY_KEY_HEADER, proxyKey);

  return headers;
}

type FallbackContact = { whatsappDigits: string; email: string };

function renderCareerFallbackHtml(request: Request, contact: FallbackContact) {
  const origin = getRequestOrigin(request, new URL(request.url));
  const whatsappButton = contact.whatsappDigits
    ? `<a href="https://wa.me/${contact.whatsappDigits}?text=${encodeURIComponent("السلام عليكم، أرغب في التقديم على فرصة وظيفية في مركز ريجوفيرا")}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
            <span>التواصل عبر واتساب</span>
          </a>`
    : "";
  const emailButton = contact.email
    ? `<a href="mailto:${contact.email}?subject=${encodeURIComponent("طلب توظيف - مركز ريجوفيرا")}" class="btn btn-secondary">
            <span>إرسال عبر البريد الإلكتروني</span>
          </a>`
    : "";
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>التوظيف والانضمام لفريق العمل | مركز ريجوفيرا الطبي</title>
  <meta name="description" content="انضم إلى نخبة الكوادر الطبية والإدارية في مركز ريجوفيرا الطبي بالرياض. فرص وظيفية متميزة في جراحة التجميل والجلدية والأسنان والتمريض.">
  <link rel="icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4a2476;
      --primary-dark: #321652;
      --primary-light: #f5f0fa;
      --gold: #d4a34b;
      --text-main: #1f2937;
      --text-muted: #6b7280;
      --bg: #faf9fc;
      --card-bg: #ffffff;
      --border: #e5e7eb;
      --radius: 1rem;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
      direction: rtl;
    }
    .header {
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 1.25rem;
    }
    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 4.5rem;
    }
    .logo {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      list-style: none;
    }
    .nav-links a {
      color: var(--text-main);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--primary); }
    .hero {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      color: #ffffff;
      padding: 4.5rem 0 3.5rem;
      text-align: center;
      border-bottom-left-radius: 2rem;
      border-bottom-right-radius: 2rem;
    }
    .hero-badge {
      display: inline-block;
      background: rgba(212, 163, 75, 0.2);
      border: 1px solid rgba(212, 163, 75, 0.4);
      color: #fed7aa;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .hero h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.3;
    }
    .hero p {
      max-width: 650px;
      margin: 0 auto;
      font-size: 1.1rem;
      color: #e9d5ff;
    }
    .section {
      padding: 3.5rem 0;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    @media(min-width: 768px) {
      .grid-2 { grid-template-columns: 1fr 1fr; }
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
    }
    .card h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    .roles-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .role-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.85rem;
      background: var(--primary-light);
      border-radius: 0.75rem;
    }
    .role-icon {
      color: var(--primary);
      flex-shrink: 0;
      margin-top: 0.15rem;
    }
    .role-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--primary-dark);
    }
    .role-desc {
      font-size: 0.82rem;
      color: var(--text-muted);
    }
    .contact-box {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-primary {
      background: #25D366;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1eb956;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }
    .btn-secondary {
      background: var(--primary);
      color: #ffffff;
    }
    .btn-secondary:hover {
      background: var(--primary-dark);
      box-shadow: 0 4px 12px rgba(74, 36, 118, 0.25);
    }
    .info-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .footer {
      background: #ffffff;
      border-top: 1px solid var(--border);
      padding: 2.5rem 0;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 3rem;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <a href="${origin}/" class="logo">
          <span>مركز ريجوفيرا الطبي</span>
        </a>
        <ul class="nav-links">
          <li><a href="${origin}/">الرئيسية</a></li>
          <li><a href="${origin}/services">الخدمات</a></li>
          <li><a href="${origin}/doctors">الأطباء</a></li>
          <li><a href="${origin}/contact">اتصل بنا</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <span class="hero-badge">فرص وظيفية واعدة</span>
      <h1>انضم إلى فريق مركز ريجوفيرا الطبي</h1>
      <p>نبحث دائمًا عن الكفاءات الطبية والإدارية المتميزة لتقديم أرقى مستويات الرعاية التجميلية والصحية في الرياض.</p>
    </div>
  </section>

  <main class="container section">
    <div class="grid-2">
      <div class="card">
        <h2>التخصصات والوظائف المتاحة</h2>
        <ul class="roles-list">
          <li class="role-item">
            <span class="role-icon">🩺</span>
            <div>
              <div class="role-title">استشاريو وأخصائيو الجلدية وجراحة التجميل</div>
              <div class="role-desc">خبرة معتمدة وترخيص ساري من الهيئة السعودية للتخصصات الصحية.</div>
            </div>
          </li>
          <li class="role-item">
            <span class="role-icon">🦷</span>
            <div>
              <div class="role-title">أطباء وأخصائيو طب وجراحة وتجميل الأسنان</div>
              <div class="role-desc">خبرة في التركيبات وتجميل الابتسامة وعلاج الجذور.</div>
            </div>
          </li>
          <li class="role-item">
            <span class="role-icon">💉</span>
            <div>
              <div class="role-title">أخصائيات تمريض وفنيات ليزر وتجميل</div>
              <div class="role-desc">ترخيص هيئة التخصصات وخبرة سابقة في المراكز التجميلية المعتمدة.</div>
            </div>
          </li>
          <li class="role-item">
            <span class="role-icon">💼</span>
            <div>
              <div class="role-title">خدمة العملاء والاستقبال وتنسيق المواعيد</div>
              <div class="role-desc">مهارات تواصل راقية وإتقان للغة العربية والإنجليزية وإدارة الحجوزات.</div>
            </div>
          </li>
          <li class="role-item">
            <span class="role-icon">📈</span>
            <div>
              <div class="role-title">التسويق الطبي وإدارة المحتوى الرقمي</div>
              <div class="role-desc">خبرة في إدارة الحملات الإعلانية وصناعة المحتوى التجميلي والرعاية الطبية.</div>
            </div>
          </li>
        </ul>
      </div>

      <div class="card">
        <h2>طريقة التقديم وإرسال السيرة الذاتية</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.25rem;">
          يسرنا استقبال سيرتك الذاتية وبيانات التواصل الخاصة بك عبر القنوات الرسمية التالية، وسيقوم فريق الموارد البشرية بالتواصل معك مباشرة:
        </p>

        <div class="info-badge">
          <span>✓</span>
          <span>يتم التعامل مع جميع الطلبات بسرية.</span>
        </div>

        <div class="contact-box">
          ${whatsappButton}
          ${emailButton}
        </div>
      </div>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <p>© ${new Date().getFullYear()} مركز ريجوفيرا الطبي | Rejuvera Medical Center. جميع الحقوق محفوظة.</p>
      <p style="font-size: 0.8rem; margin-top: 0.5rem; color: #9ca3af;">الرياض - المملكة العربية السعودية</p>
    </div>
  </footer>
</body>
</html>`;
}

async function fallbackContact(): Promise<FallbackContact> {
  try {
    const { contact } = await getRuntimeSettings();
    const digits = (contact.whatsapp || contact.phone || "").replace(/\D/g, "");
    const whatsappDigits = !digits
      ? ""
      : digits.startsWith("966")
        ? digits
        : digits.startsWith("0")
          ? `966${digits.slice(1)}`
          : `966${digits}`;
    const email = /^[^\s@<>"'&]+@[^\s@<>"'&]+\.[^\s@<>"'&]+$/.test(
      contact.email ?? "",
    )
      ? contact.email
      : "";
    return { whatsappDigits, email };
  } catch {
    return { whatsappDigits: "", email: "" };
  }
}

let lastFallbackLogAt = 0;

function logFallback(reason: string) {
  const now = Date.now();
  if (now - lastFallbackLogAt < 60_000) return;
  lastFallbackLogAt = now;
  console.warn(
    `[career-proxy] serving the native fallback instead of the upstream portal: ${reason} ` +
      `(CAREER_PROXY_SECRET ${process.env.CAREER_PROXY_SECRET ? "set" : "NOT set"})`,
  );
}

async function fallbackFor(request: Request, pathname: string, reason: string) {
  logFallback(reason);

  const headers = new Headers();
  headers.set("content-security-policy", careerProxyCsp);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-career-proxy", "rejuvera-native-fallback");
  headers.set("cache-control", "no-store");

  const isPage =
    (request.method === "GET" || request.method === "HEAD") &&
    !ASSET_PATH.test(pathname);
  if (!isPage) {
    // Never answer a form post or an asset request with a fake 200 page.
    headers.set("content-type", "text/plain; charset=utf-8");
    headers.set("retry-after", "60");
    return new Response("Career portal temporarily unavailable", {
      status: 503,
      headers,
    });
  }

  headers.set("content-type", "text/html; charset=utf-8");
  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(
    renderCareerFallbackHtml(request, await fallbackContact()),
    { status: 200, headers },
  );
}

export async function proxyCareerRequest(request: Request) {
  const url = new URL(request.url);
  if (url.pathname === LOCAL_PREFIX) {
    return new NextResponse(null, {
      status: 308,
      headers: { location: `${LOCAL_PREFIX}/` },
    });
  }

  const candidateOrigins = Array.from(
    new Set([UPSTREAM_ORIGIN, ...UPSTREAM_FALLBACK_ORIGINS]),
  );
  const body = await requestBodyFor(request);
  let lastFailureReason = "no upstream candidates";

  for (const candidateOrigin of candidateOrigins) {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      request.method === "GET" || request.method === "HEAD"
        ? UPSTREAM_TIMEOUT_MS
        : UPSTREAM_WRITE_TIMEOUT_MS,
    );

    try {
      const upstreamInit: RequestInit = {
        method: request.method,
        headers: buildUpstreamHeaders(request, candidateOrigin),
        redirect: "manual",
        cache: "no-store",
        signal: controller.signal,
      };
      if (body) upstreamInit.body = body;

      const upstream = await fetch(
        upstreamUrlFor(request, candidateOrigin),
        upstreamInit,
      );

      if (
        upstream.status === 403 ||
        upstream.status === 406 ||
        upstream.status >= 500
      ) {
        const challenged = upstream.headers.get("cf-mitigated") === "challenge";
        lastFailureReason = `${candidateOrigin} answered ${upstream.status}${challenged ? " (Cloudflare challenge)" : ""}`;
        continue;
      }

      const headers = responseHeadersFrom(upstream, request);

      if (request.method === "HEAD") {
        return new Response(null, { status: upstream.status, headers });
      }

      const contentType = upstream.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const text = await upstream.text();
        // Cloudflare can also return its challenge page with a 200.
        if (
          text.includes("<title>Just a moment...") ||
          text.includes("cf-mitigated")
        ) {
          lastFailureReason = `${candidateOrigin} returned a Cloudflare challenge page`;
          continue;
        }
        return new Response(rewriteHtml(text, request), {
          status: upstream.status,
          headers,
        });
      }

      return new Response(upstream.body, { status: upstream.status, headers });
    } catch (error) {
      lastFailureReason = controller.signal.aborted
        ? `${candidateOrigin} timed out`
        : `${candidateOrigin} network error (${error instanceof Error ? error.name : "unknown"})`;
    } finally {
      clearTimeout(timer);
    }
  }

  return await fallbackFor(request, url.pathname, lastFailureReason);
}
