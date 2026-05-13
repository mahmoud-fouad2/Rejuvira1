import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";

import { getRuntimeSettings } from "@/lib/content-repository";

/* ── Minimal SVG social icons ─────────────────────────────────────── */
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTwitterX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.08 2.25h6.992l4.261 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function IconSnapchat() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2C8.4 2 6 4.6 6 7.8v.9c-.5.1-1.1.3-1.5.8-.3.4-.3.8-.1 1.2.3.6 1 .9 1.6.9v.1c0 .7-.3 1.4-.6 2l-.2.3c-.1.3 0 .6.3.8.5.3 1.3.5 2.2.6.2.5.7 1.6 2.3 1.6.4 0 .9-.1 1.4-.3.5.2 1 .3 1.4.3 1.6 0 2.1-1.1 2.3-1.6.9-.1 1.7-.3 2.2-.6.3-.2.4-.5.3-.8l-.2-.3c-.3-.6-.6-1.3-.6-2v-.1c.6 0 1.3-.3 1.6-.9.2-.4.2-.8-.1-1.2-.4-.5-1-.7-1.5-.8v-.9C18 4.6 15.6 2 12 2z" />
    </svg>
  );
}
function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}
function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31.2 31.2 0 000 12a31.2 31.2 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.3-1.8.5-3.9.5-5.8a31.2 31.2 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05a3.74 3.74 0 013.36-1.85c3.59 0 4.26 2.36 4.26 5.44zm-15.1-12.9A2.06 2.06 0 113.3 5.49a2.06 2.06 0 012.05 2.06zM7.12 20.45H3.57V9h3.55z" />
    </svg>
  );
}

const socialMeta = [
  { key: "instagram" as const, label: "Instagram", Icon: IconInstagram },
  { key: "twitter" as const, label: "Twitter", Icon: IconTwitterX },
  { key: "snapchat" as const, label: "Snapchat", Icon: IconSnapchat },
  { key: "tiktok" as const, label: "TikTok", Icon: IconTikTok },
  { key: "youtube" as const, label: "YouTube", Icon: IconYouTube },
  { key: "linkedin" as const, label: "LinkedIn", Icon: IconLinkedIn },
] as const;

export async function SiteFooter() {
  const runtimeSettings = await getRuntimeSettings();

  return (
    <footer className="px-6 pb-8 lg:px-10">
      <div className="surface-panel mx-auto max-w-[var(--max-width)] overflow-hidden rounded-[2.5rem]">
        {/* Main columns */}
        <div className="grid gap-10 px-8 py-10 lg:grid-cols-[1.4fr_0.85fr_0.85fr_1fr] lg:px-12 lg:py-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="border-line relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border shadow-sm">
                <Image
                  src={runtimeSettings.media.brandMark}
                  alt={runtimeSettings.brand.logoAlt}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-ink font-serif text-xl leading-none tracking-[-0.04em]">
                  {runtimeSettings.brand.siteName}
                </p>
                <p className="text-ink-faint mt-0.5 text-[10px] tracking-[0.24em] uppercase">
                  <span className="lang-ar">الجلدية والتجميل الطبي</span>
                  <span className="lang-en">Dermatology &amp; Medical Aesthetics</span>
                </p>
              </div>
            </div>
            <p className="text-ink-soft mt-5 max-w-xs text-sm leading-7">
              {runtimeSettings.brand.tagline}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="border-line bg-canvas text-ink-soft rounded-full border px-3 py-1 text-xs">
                <span className="lang-ar">الرياض</span><span className="lang-en">Riyadh</span>
              </span>
              <span className="border-line bg-canvas text-ink-soft rounded-full border px-3 py-1 text-xs">
                <span className="lang-ar">عناية جلدية</span><span className="lang-en">Skin Care</span>
              </span>
              <span className="border-line bg-canvas text-ink-soft rounded-full border px-3 py-1 text-xs">
                <span className="lang-ar">تجميل طبي</span><span className="lang-en">Medical Aesthetics</span>
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="eyebrow mb-5">
              <span className="lang-ar">استكشف</span>
              <span className="lang-en">Explore</span>
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              {[
                { labelAr: "الرئيسية", labelEn: "Home", href: "/" },
                { labelAr: "من نحن", labelEn: "About Us", href: "/about" },
                { labelAr: "الأطباء", labelEn: "Doctors", href: "/doctors" },
                { labelAr: "الأجهزة", labelEn: "Devices", href: "/devices" },
                { labelAr: "المعرض البصري", labelEn: "Gallery", href: "/gallery" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as Route}
                    className="group text-ink-soft hover:text-ink flex items-center gap-2 transition-colors"
                  >
                    <span className="bg-line group-hover:bg-gold h-px w-3 shrink-0 transition-all duration-300 group-hover:w-5" />
                    <span className="lang-ar">{link.labelAr}</span>
                    <span className="lang-en">{link.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="eyebrow mb-5">
              <span className="lang-ar">الخدمات</span>
              <span className="lang-en">Services</span>
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              {[
                { labelAr: "كل الخدمات", labelEn: "All Services", href: "/services" },
                { labelAr: "تجديد البشرة", labelEn: "Skin Rejuvenation", href: "/services/skin-rejuvenation" },
                { labelAr: "إزالة الشعر بالليزر", labelEn: "Laser Hair Removal", href: "/services/laser-hair-removal" },
                { labelAr: "تناغم الوجه بالحقن", labelEn: "Injectable Harmony", href: "/services/injectable-harmony" },
                { labelAr: "المجلة الطبية", labelEn: "Medical Journal", href: "/journal" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as Route}
                    className="group text-ink-soft hover:text-ink flex items-center gap-2 transition-colors"
                  >
                    <span className="bg-line group-hover:bg-gold h-px w-3 shrink-0 transition-all duration-300 group-hover:w-5" />
                    <span className="lang-ar">{link.labelAr}</span>
                    <span className="lang-en">{link.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="eyebrow mb-5">
              <span className="lang-ar">التواصل</span>
              <span className="lang-en">Contact</span>
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-ink-faint text-[10px] tracking-[0.2em] uppercase">
                  <span className="lang-ar">الهاتف</span><span className="lang-en">Phone</span>
                </p>
                <p
                  className="text-ink-soft mt-1 text-sm tabular-nums"
                  dir="ltr"
                >
                  {runtimeSettings.contact.phone}
                </p>
              </div>
              <div>
                <p className="text-ink-faint text-[10px] tracking-[0.2em] uppercase">
                  <span className="lang-ar">واتساب</span><span className="lang-en">WhatsApp</span>
                </p>
                <p
                  className="text-ink-soft mt-1 text-sm tabular-nums"
                  dir="ltr"
                >
                  {runtimeSettings.contact.whatsapp}
                </p>
              </div>
              <div>
                <p className="text-ink-faint text-[10px] tracking-[0.2em] uppercase">
                  <span className="lang-ar">البريد الإلكتروني</span><span className="lang-en">Email</span>
                </p>
                <p className="text-ink-soft mt-1 text-sm" dir="ltr">
                  {runtimeSettings.contact.email}
                </p>
              </div>
              <Link href="/contact" className="btn-primary mt-1 w-fit">
                <span className="lang-ar">احجزي استشارتك</span>
                <span className="lang-en">Book a Consultation</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-line flex flex-wrap items-center justify-between gap-4 border-t px-8 py-5 lg:px-12">
          <p className="text-ink-faint text-xs">
            <span dir="ltr">© 2026 Rejuvira Center.</span>
            {" "}<span className="lang-ar">جميع الحقوق محفوظة.</span>
            <span className="lang-en">All rights reserved.</span>
          </p>
          {/* Social icons — shown only when a link is set */}
          {(() => {
            const activeSocial = socialMeta.filter(
              (s) => !!runtimeSettings.social[s.key],
            );
            if (activeSocial.length === 0) return null;
            return (
              <div className="flex items-center gap-2">
                {activeSocial.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={runtimeSettings.social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="border-line bg-canvas text-ink-soft hover:text-ink hover:border-violet flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-200"
                    style={{ "--violet": "var(--color-violet)" } as React.CSSProperties}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            );
          })()}
          <p className="text-ink-faint text-xs">
            <span className="lang-ar">الرياض، المملكة العربية السعودية.</span>
            <span className="lang-en">Riyadh, Saudi Arabia.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
