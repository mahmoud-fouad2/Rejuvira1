import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { PageLoader } from "@/components/layout/PageLoader";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { CustomCursor } from "@/components/ui/new/CustomCursor";
import { getRuntimeSettings } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

/* ── Local IBM Plex Sans Arabic (body) ──────────────────── */
const rejuviraSans = localFont({
  src: [
    { path: "../../public/assets/fonts/IBMPlexSansArabic-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/assets/fonts/IBMPlexSansArabic-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/IBMPlexSansArabic-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/IBMPlexSansArabic-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/assets/fonts/IBMPlexSansArabic-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-rejuvira-sans",
  display: "swap",
});

const rejuviraDisplay = localFont({
  src: [
    { path: "../../public/assets/fonts/IBMPlexSansArabic-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/IBMPlexSansArabic-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/assets/fonts/IBMPlexSansArabic-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-rejuvira-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const runtimeSettings = await getRuntimeSettings();

  return {
    metadataBase: new URL("https://rejuveracenter.com"),
    title: {
      default: `${runtimeSettings.brand.siteName} | خدمات جلدية وتجميلية • مركز طبي متخصص`,
      template: `%s | ${runtimeSettings.brand.siteName}`,
    },
    description: runtimeSettings.brand.seoDescription,
    icons: {
      icon: runtimeSettings.media.favicon,
      apple: runtimeSettings.media.appleIcon,
      shortcut: runtimeSettings.media.favicon,
    },
    openGraph: {
      title: runtimeSettings.brand.siteName,
      description: runtimeSettings.brand.seoDescription,
      url: "https://rejuveracenter.com",
      siteName: runtimeSettings.brand.siteName,
      locale: "ar_SA",
      type: "website",
      images: [{ url: runtimeSettings.media.ogImage, width: 1200, height: 630, alt: runtimeSettings.brand.logoAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: runtimeSettings.brand.siteName,
      description: runtimeSettings.brand.seoDescription,
      images: [runtimeSettings.media.ogImage],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${rejuviraSans.variable} ${rejuviraDisplay.variable} h-full antialiased`}
    >
      <head>
        {/* Google Fonts: Cormorant Garamond (EN display) + Tajawal (AR display) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Tajawal:wght@200;300;400;500;700&display=swap" rel="stylesheet" />

        {/* Inline script: read saved lang BEFORE React hydrates — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem("rejuvira-lang");if(l==="en"||l==="ar"){document.documentElement.setAttribute("data-lang",l);document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="page-enter flex min-h-full flex-col">
        <LanguageProvider>
          <CustomCursor />
          <PageLoader />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
