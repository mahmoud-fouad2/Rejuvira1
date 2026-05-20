import { NextResponse } from "next/server";

import { recordAppLog } from "@/lib/app-log";

/** Detect device class from user-agent. */
function deviceFromUA(ua: string): "mobile" | "tablet" | "desktop" {
  const lower = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(lower)) return "tablet";
  if (/mobi|android|iphone|ipod|blackberry|iemobile|opera mini/.test(lower))
    return "mobile";
  return "desktop";
}

/** Detect browser family from user-agent. */
function browserFromUA(ua: string): string {
  const lower = ua.toLowerCase();
  if (lower.includes("edg/")) return "Edge";
  if (lower.includes("opr/") || lower.includes("opera")) return "Opera";
  if (lower.includes("chrome/") && !lower.includes("chromium")) return "Chrome";
  if (lower.includes("safari/") && !lower.includes("chrome")) return "Safari";
  if (lower.includes("firefox/")) return "Firefox";
  return "Other";
}

/** Detect OS from user-agent. */
function osFromUA(ua: string): string {
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}

/** Rough country approximation from timezone string (e.g. Asia/Riyadh → SA). */
function countryFromTimezone(tz: string): string {
  const map: Record<string, string> = {
    "Asia/Riyadh": "SA",
    "Asia/Mecca": "SA",
    "Asia/Dubai": "AE",
    "Asia/Qatar": "QA",
    "Asia/Bahrain": "BH",
    "Asia/Kuwait": "KW",
    "Asia/Muscat": "OM",
    "Africa/Cairo": "EG",
    "Asia/Amman": "JO",
    "Asia/Beirut": "LB",
    "Asia/Damascus": "SY",
    "Asia/Baghdad": "IQ",
    "Asia/Karachi": "PK",
    "Asia/Kolkata": "IN",
    "Asia/Calcutta": "IN",
    "Asia/Istanbul": "TR",
    "Europe/Istanbul": "TR",
    "Europe/London": "GB",
    "Europe/Paris": "FR",
    "Europe/Berlin": "DE",
    "America/New_York": "US",
    "America/Los_Angeles": "US",
    "America/Chicago": "US",
  };
  if (map[tz]) return map[tz]!;
  if (tz.startsWith("Africa/")) return "AF";
  if (tz.startsWith("Asia/")) return "AS";
  if (tz.startsWith("Europe/")) return "EU";
  if (tz.startsWith("America/")) return "AM";
  return "??";
}

/** Normalize referrer to a clean source domain. */
function sourceFromReferrer(referrer: string): string {
  if (!referrer) return "Direct";
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace(/^www\./, "");
    if (host.includes("google.")) return "Google";
    if (host.includes("bing.")) return "Bing";
    if (host.includes("yahoo.")) return "Yahoo";
    if (host.includes("duckduckgo.")) return "DuckDuckGo";
    if (host.includes("facebook.") || host.includes("fb.")) return "Facebook";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("twitter.") || host.includes("x.com")) return "Twitter/X";
    if (host.includes("tiktok.")) return "TikTok";
    if (host.includes("youtube.")) return "YouTube";
    if (host.includes("linkedin.")) return "LinkedIn";
    if (host.includes("snapchat.")) return "Snapchat";
    if (host.includes("whatsapp.") || host.includes("wa.me")) return "WhatsApp";
    if (host.includes("rejuvera.")) return "Internal";
    return host;
  } catch {
    return "Direct";
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const path = typeof body.path === "string" ? body.path.slice(0, 240) : "/";
    const referrer =
      typeof body.referrer === "string" ? body.referrer.slice(0, 500) : "";
    const language =
      typeof body.language === "string" ? body.language.slice(0, 16) : "";
    const timezone =
      typeof body.timezone === "string" ? body.timezone.slice(0, 80) : "";
    const screen =
      typeof body.screen === "string" ? body.screen.slice(0, 40) : "";

    const headers = request.headers;
    const ua = headers.get("user-agent") ?? "";

    /* Country from CDN header (Cloudflare/Vercel) or derive from timezone */
    const countryHeader =
      headers.get("cf-ipcountry") ??
      headers.get("x-vercel-ip-country") ??
      headers.get("x-country") ??
      "";
    const country =
      countryHeader && countryHeader !== "XX"
        ? countryHeader
        : countryFromTimezone(timezone);

    const device = deviceFromUA(ua);
    const browser = browserFromUA(ua);
    const os = osFromUA(ua);
    const source = sourceFromReferrer(referrer);

    /* Screen category for charts */
    const screenWidth = parseInt(screen.split("x")[0] ?? "0", 10);
    const screenCategory =
      screenWidth >= 1280
        ? "Desktop large"
        : screenWidth >= 768
          ? "Desktop/Tablet"
          : screenWidth >= 480
            ? "Mobile"
            : "Mobile small";

    await recordAppLog({
      level: "info",
      kind: "analytics.pageview",
      message: "Public page viewed",
      meta: {
        path,
        referrer,
        language,
        timezone,
        screen,
        screenCategory,
        country,
        device,
        browser,
        os,
        source,
        userAgent: ua.slice(0, 240),
      },
    });
  } catch {
    /* Analytics must never block the visitor path. */
  }

  return NextResponse.json({ ok: true });
}
