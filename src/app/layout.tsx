import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";

import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { MaintenanceOverlay } from "@/components/layout/MaintenanceOverlay";
import { PageLoader } from "@/components/layout/PageLoader";
import { PageViewTracker } from "@/components/layout/PageViewTracker";
import { ExternalIntegrations } from "@/components/layout/ExternalIntegrations";
import { CustomCursor } from "@/components/ui/new/CustomCursor";
import { getRuntimeSettings } from "@/lib/content-repository";
import { normalizeGoogleTagConfig } from "@/lib/google-tag";
import {
  buildLocalBusinessJsonLd,
  buildSiteCreatorJsonLd,
  getSiteUrl,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#4a2476",
  colorScheme: "light dark",
};

function detectInitialLang(url: string | null, cookieLang: string | undefined) {
  if (url) {
    try {
      const search = new URL(url, "http://x").searchParams.get("lang");
      if (search === "en" || search === "ar") return search;
    } catch {
      /* ignore */
    }
  }
  if (cookieLang === "en" || cookieLang === "ar") return cookieLang;
  return "ar";
}

/* ── Local IBM Plex Sans Arabic (body) ──────────────────── */
const rejuviraSans = localFont({
  src: [
    {
      path: "../../public/assets/fonts/IBMPlexSansArabic-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/IBMPlexSansArabic-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/IBMPlexSansArabic-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/IBMPlexSansArabic-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/IBMPlexSansArabic-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-rejuvira-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const rejuviraDisplay = localFont({
  src: [
    {
      path: "../../public/assets/fonts/IBMPlexSansArabic-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/IBMPlexSansArabic-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/IBMPlexSansArabic-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-rejuvira-display",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const runtimeSettings = await getRuntimeSettings();
  const canonical = getSiteUrl();

  return {
    metadataBase: new URL(canonical),
    title: {
      default: `${runtimeSettings.brand.siteName} | جراحات تجميلية وطب جلدية وعناية بالبشرة`,
      template: `%s | ${runtimeSettings.brand.siteName}`,
    },
    description: runtimeSettings.brand.seoDescription,
    authors: [{ name: "Mahmoud Fouad", url: "https://ma-fo.info" }],
    creator: "Mahmoud Fouad",
    publisher: runtimeSettings.brand.siteName,
    alternates: {
      canonical,
      languages: {
        ar: canonical,
        "ar-SA": canonical,
        en: `${canonical}/?lang=en`,
        "en-US": `${canonical}/?lang=en`,
        "x-default": canonical,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
    },
    openGraph: {
      title: runtimeSettings.brand.siteName,
      description: runtimeSettings.brand.seoDescription,
      url: canonical,
      siteName: runtimeSettings.brand.siteName,
      locale: "ar_SA",
      alternateLocale: "en_US",
      type: "website",
      images: [
        {
          url: runtimeSettings.media.ogImage,
          width: 1200,
          height: 630,
          alt: runtimeSettings.brand.logoAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: runtimeSettings.brand.siteName,
      description: runtimeSettings.brand.seoDescription,
      images: [runtimeSettings.media.ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "rejuvera:developer": "Mahmoud Fouad",
      "rejuvera:developer-phone": "0530047640",
      "rejuvera:developer-url": "https://ma-fo.info",
      "rejuvera:developer-linkedin":
        "https://www.linkedin.com/in/mahmoud-fouad",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const runtimeSettings = await getRuntimeSettings();
  const headerStore = await headers();
  const cookieStore = await cookies();
  const pathname =
    headerStore.get("x-pathname") ?? headerStore.get("x-invoke-path") ?? "/";
  const url = headerStore.get("x-url");
  const cookieLang = cookieStore.get("rejuvira-lang")?.value;
  const initialLang = detectInitialLang(url, cookieLang);
  const isAdminOrAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/forbidden") ||
    pathname.startsWith("/api");
  const showMaintenance =
    Boolean(runtimeSettings.ops.maintenanceMode) && !isAdminOrAuth;
  const googleTagConfig =
    runtimeSettings.integrations.googleTagEnabled && !isAdminOrAuth
      ? normalizeGoogleTagConfig(runtimeSettings.integrations.googleTagUrl)
      : null;
  const localBusinessLd = buildLocalBusinessJsonLd({
    brand: runtimeSettings.brand,
    contact: runtimeSettings.contact,
    media: runtimeSettings.media,
    social: runtimeSettings.social,
  });
  const siteCreatorLd = buildSiteCreatorJsonLd({
    brand: runtimeSettings.brand,
  });
  const initialTheme = "light";

  return (
    <html
      lang={initialLang}
      dir={initialLang === "ar" ? "rtl" : "ltr"}
      data-lang={initialLang}
      suppressHydrationWarning
      className={`${rejuviraSans.variable} ${rejuviraDisplay.variable} h-full antialiased`}
    >
      <head>
        {/* IBM Plex Arabic is loaded locally through next/font. */}

        {/* Initial UI state: language + theme before hydration */}
        <Script
          id="rejuvira-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var defaultTheme=${JSON.stringify(initialTheme)};var serverLang=${JSON.stringify(initialLang)};var c=document.cookie.match(/(?:^|;\\s*)rejuvira-lang=(en|ar)\\b/);var cookieLang=c?c[1]:null;var l=localStorage.getItem("rejuvira-lang");if(l!=="en"&&l!=="ar")l=null;var effective=(cookieLang==="en"||cookieLang==="ar")?cookieLang:((l==="en"||l==="ar")?l:serverLang||"ar");d.setAttribute("data-lang",effective);d.lang=effective;d.dir=effective==="ar"?"rtl":"ltr";var t=localStorage.getItem("rejuvira-theme");if(t!=="dark"&&t!=="light"){t=defaultTheme==="dark"?"dark":"light";}d.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
        <Script
          id="rejuvira-local-business-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
        />
        <Script
          id="rejuvera-site-creator-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteCreatorLd) }}
        />
        {googleTagConfig?.kind === "gtag" ? (
          <>
            <Script
              id="rejuvera-google-tag-src"
              src={googleTagConfig.scriptUrl}
              strategy="afterInteractive"
            />
            <Script
              id="rejuvera-google-tag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(googleTagConfig.id)});`,
              }}
            />
          </>
        ) : null}
        {googleTagConfig?.kind === "gtm" ? (
          <Script
            id="rejuvera-google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0];var j=d.createElement(s);var dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(i)+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(googleTagConfig.id)});`,
            }}
          />
        ) : null}
      </head>
      <body className="page-enter flex min-h-full min-w-0 flex-col">
        {googleTagConfig?.kind === "gtm" ? (
          <noscript>
            <iframe
              src={googleTagConfig.noscriptUrl}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <LanguageProvider>
          {showMaintenance ? (
            <MaintenanceOverlay
              brandName={runtimeSettings.brand.siteName}
              {...(runtimeSettings.contact.email
                ? { contactEmail: runtimeSettings.contact.email }
                : {})}
              {...(runtimeSettings.contact.phone
                ? { contactPhone: runtimeSettings.contact.phone }
                : {})}
            />
          ) : null}
          <CustomCursor />
          <PageLoader />
          {!isAdminOrAuth ? <PageViewTracker /> : null}
          {!isAdminOrAuth ? (
            <Script
              id="rejuvera-utm-hidden-fields"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(){try{var keys=["utm_source","utm_medium","utm_campaign","utm_content"];var params=new URLSearchParams(window.location.search);var stored={};try{stored=JSON.parse(localStorage.getItem("rejuvera_utm")||"{}")||{};}catch(e){stored={};}var changed=false;keys.forEach(function(k){var v=params.get(k);if(v){stored[k]=v;changed=true;}});if(changed)localStorage.setItem("rejuvera_utm",JSON.stringify(stored));var aliases={utm_source:"utmSource",utm_medium:"utmMedium",utm_campaign:"utmCampaign",utm_content:"utmContent"};function fill(){keys.forEach(function(k){var v=stored[k]||"";document.querySelectorAll('input[name="'+k+'"],input[name="'+aliases[k]+'"]').forEach(function(input){if(!input.value)input.value=v;});});}fill();new MutationObserver(fill).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}})();`,
              }}
            />
          ) : null}
          {children}
          {!isAdminOrAuth ? (
            <ExternalIntegrations
              chatbaseEnabled={runtimeSettings.integrations.chatbaseEnabled}
              chatbaseWidgetId={runtimeSettings.integrations.chatbaseWidgetId}
              customHeadCode={runtimeSettings.integrations.customHeadCode}
              customBodyCode={runtimeSettings.integrations.customBodyCode}
            />
          ) : null}
          <Script
            id="rv-scroll-reveal"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(){var o=new IntersectionObserver(function(e){e.forEach(function(i){if(i.isIntersecting){i.target.classList.add('is-visible');o.unobserve(i.target);}});},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});document.querySelectorAll('.rv-reveal,.rv-reveal-left,.rv-reveal-scale,.rv-v0-section-title,.rv-v0-services-grid,.rv-v0-devices-grid,.rv-v0-trust-grid,.rv-v0-testimonials,.rv-v0-wide-stats,.rv-v0-partners,.rv-v0-gallery-grid,.rv-doctors-section,.rv-strip-section,.rv-v0-home-contact-section').forEach(function(el){o.observe(el);});})();`,
            }}
          />
          <Script
            id="rv-header-scroll"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(){var h=document.querySelector('.rv-v0-header');if(!h)return;window.addEventListener('scroll',function(){h.classList.toggle('is-scrolled',window.scrollY>20);},{passive:true});})();`,
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
