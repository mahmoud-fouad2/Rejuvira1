import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { BookingModal } from "@/components/layout/BookingModal";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { normalizeSocialUrl } from "@/components/layout/SocialIconCluster";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { getRuntimeSettings, getServices } from "@/lib/content-repository";
import { getPublicSiteKey } from "@/lib/recaptcha";

const quickLinks = [
  { href: "/", labelAr: "الرئيسية", labelEn: "Home" },
  { href: "/services", labelAr: "الخدمات", labelEn: "Services" },
  { href: "/doctors", labelAr: "أطباؤنا", labelEn: "Doctors" },
  { href: "/devices", labelAr: "أجهزتنا", labelEn: "Devices" },
  { href: "/gallery", labelAr: "معرض الصور", labelEn: "Gallery" },
  { href: "/journal", labelAr: "المجلة الطبية", labelEn: "Journal" },
  { href: "/career", labelAr: "التوظيف", labelEn: "Careers" },
  { href: "/contact", labelAr: "تواصلي معنا", labelEn: "Contact" },
] as const;

// Trust badges curated for KSA medical aesthetics context. Each badge keeps a
// constrained box and uses next/image with explicit width/height (no `fill`).
const trustBadges = [
  {
    src: "/media/trust/moh.svg",
    alt: "وزارة الصحة السعودية - Ministry of Health KSA",
  },
  {
    src: "/media/trust/saudi-health-council.svg",
    alt: "الهيئة السعودية للتخصصات الصحية - Saudi Health Council",
  },
  {
    src: "/media/trust/cbahi.svg",
    alt: "اعتماد المركز السعودي لاعتماد المنشآت الصحية - CBAHI",
  },
  {
    src: "/media/trust/iso-9001.svg",
    alt: "شهادة ISO 9001 لإدارة الجودة - ISO 9001 quality certified",
  },
] as const;

// Payment methods commonly accepted by Saudi aesthetic clinics. AMEX removed
// per local prevalence.
const paymentMethods = [
  { src: "/media/payments/mada.svg", alt: "مدى - Mada" },
  { src: "/media/payments/visa.svg", alt: "Visa" },
  { src: "/media/payments/mastercard.svg", alt: "Mastercard" },
  { src: "/media/payments/apple-pay.svg", alt: "Apple Pay" },
  { src: "/media/payments/stc-pay.svg", alt: "STC Pay" },
  { src: "/media/payments/tabby.svg", alt: "Tabby — اقسطها" },
  { src: "/media/payments/tamara.svg", alt: "Tamara — قسّمها" },
] as const;

const serviceNameEnBySlug: Record<string, string> = {
  "dermatology-consultation": "Dermatology consultation",
  "skin-rejuvenation": "Skin rejuvenation",
  "laser-hair-removal": "Laser hair removal",
  "injectables-harmony": "Injectables and facial harmony",
  "body-contouring": "Body contouring",
  "cosmetic-surgery-consultation": "Aesthetic surgery consultation",
  "skin-tightening": "Skin tightening",
  "prp-hair-skin": "PRP for hair and skin",
};

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.51 2.52a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.56-1.08a2 2 0 0 1 2.11-.45c.82.21 1.66.39 2.52.51A2 2 0 0 1 22 16.92z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m22 6-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="10"
        r="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function socialIcon(kind: string) {
  if (kind === "instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden
      >
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="5"
          ry="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "twitter") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (kind === "youtube") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden
      >
        <path
          d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "linkedin") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  if (kind === "tiktok") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    );
  }
  if (kind === "snapchat") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12.02 2c2.84-.04 5.46 1.85 6.13 4.6.2.86.13 1.85.08 2.74-.03.6-.07 1.16 0 1.41.06.21.34.34.7.49.32.13.71.29.95.6.18.23.21.55.07.83-.27.55-1.18.91-2.06 1.13-.07.02-.16.04-.21.18-.06.18.06.45.18.71.28.6.96 1.27 2.36 1.5.27.04.46.27.46.55 0 .07-.02.14-.04.21-.2.46-1.06.79-2.61 1.01-.05.07-.1.27-.13.4-.04.18-.08.35-.15.55-.07.21-.27.45-.65.45h-.01c-.18 0-.39-.04-.62-.08-.27-.05-.6-.11-.99-.11-.23 0-.46.02-.71.06-.5.08-.93.4-1.43.76-.71.51-1.51 1.1-2.74 1.1-.04 0-.07 0-.11-.01h-.07c-1.21 0-2.01-.59-2.71-1.1-.5-.36-.93-.68-1.43-.76-.25-.04-.49-.06-.71-.06-.4 0-.72.07-.99.12-.23.04-.43.08-.62.08-.46 0-.66-.27-.72-.46-.07-.2-.11-.38-.15-.55-.03-.13-.08-.34-.13-.4-1.55-.22-2.4-.55-2.61-1.02-.03-.07-.04-.14-.04-.21 0-.27.19-.51.46-.55 1.4-.22 2.08-.9 2.36-1.5.12-.26.24-.53.18-.71-.05-.14-.13-.16-.21-.18-.86-.21-1.79-.58-2.06-1.13-.14-.28-.11-.6.07-.83.24-.31.63-.47.95-.6.36-.15.65-.28.7-.49.07-.25.03-.81 0-1.41-.05-.89-.12-1.88.08-2.74.66-2.71 3.21-4.6 6.09-4.6h.05Z" />
      </svg>
    );
  }
  if (kind === "whatsapp") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="19"
        height="19"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12.04 2a9.87 9.87 0 0 0-8.43 15.04L2.45 21.3a.55.55 0 0 0 .67.67l4.38-1.15A9.89 9.89 0 1 0 12.04 2Zm0 1.8a8.09 8.09 0 1 1-3.98 15.14.9.9 0 0 0-.68-.08l-2.76.72.73-2.67a.9.9 0 0 0-.1-.72A8.08 8.08 0 0 1 12.04 3.8Zm-3.4 4.18c-.18 0-.46.07-.7.34-.24.26-.92.9-.92 2.2 0 1.3.94 2.55 1.07 2.73.13.18 1.84 2.95 4.56 4.02 2.26.9 2.72.72 3.2.68.5-.04 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.06-.12-.25-.18-.52-.32-.27-.13-1.6-.78-1.84-.87-.25-.09-.43-.13-.61.14-.18.27-.7.87-.86 1.05-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.33-.8-.71-1.33-1.58-1.49-1.85-.15-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.6-1.45-.83-1.99-.22-.52-.44-.45-.61-.46h-.52Z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 12h20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function toSaudiWhatsappDigits(value: string) {
  const digits = sanitizeDigits(value);
  if (!digits) return "";
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  return `966${digits}`;
}

export async function SiteFooter() {
  const [runtimeSettings, services] = await Promise.all([
    getRuntimeSettings(),
    getServices(),
  ]);

  const primaryPhone = runtimeSettings.contact.phone;
  const secondaryPhone = runtimeSettings.contact.phoneSecondary;
  const primaryEmail = runtimeSettings.contact.email;

  const telPrimary = `tel:${sanitizeDigits(primaryPhone)}`;
  const telSecondary = secondaryPhone
    ? `tel:${sanitizeDigits(secondaryPhone)}`
    : null;
  const waDigits = toSaudiWhatsappDigits(
    runtimeSettings.contact.whatsapp || primaryPhone,
  );
  const waHref = waDigits ? `https://wa.me/${waDigits}` : null;

  const visibility = runtimeSettings.socialVisibility;
  const socialRows = [
    {
      kind: "whatsapp" as const,
      url: runtimeSettings.social.whatsappBusiness || waHref || "",
      label: "WhatsApp",
    },
    {
      kind: "instagram" as const,
      url: runtimeSettings.social.instagram,
      label: "Instagram",
    },
    {
      kind: "twitter" as const,
      url: runtimeSettings.social.twitter,
      label: "X",
    },
    {
      kind: "youtube" as const,
      url: runtimeSettings.social.youtube,
      label: "YouTube",
    },
    {
      kind: "linkedin" as const,
      url: runtimeSettings.social.linkedin,
      label: "LinkedIn",
    },
    {
      kind: "tiktok" as const,
      url: runtimeSettings.social.tiktok,
      label: "TikTok",
    },
    {
      kind: "snapchat" as const,
      url: runtimeSettings.social.snapchat,
      label: "Snapchat",
    },
  ].filter((row) => {
    if (!row.url.trim().length) return false;
    if (row.kind === "whatsapp") {
      return visibility.whatsappBusiness !== false;
    }
    return visibility[row.kind] !== false;
  });

  return (
    <footer className="rv-v0-footer rv-v0-footer-shell relative px-4 pt-2 pb-10 sm:px-6 lg:px-8">
      <div className="rv-v0-footer-top-accent" aria-hidden />

      <div className="mx-auto max-w-[var(--max-width)] overflow-hidden rounded-[2rem] border border-[color:var(--rv-line)] bg-[color:var(--rv-card)] shadow-[var(--rv-shadow-soft)]">
        <div className="grid gap-10 px-6 py-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.85fr_0.85fr_1.1fr] lg:px-10">
          {/* Brand + tagline + socials */}
          <div>
            <Link
              href="/"
              className="inline-block"
              aria-label="Rejuvera Center"
            >
              <BrandLogo
                alt={runtimeSettings.brand.logoAlt}
                width={564}
                height={564}
                variant="footer"
                className="rv-v0-footer-logo"
                sizes="120px"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-8 text-[color:var(--rv-muted)]">
              <span className="lang-ar">
                مركز طبي تجميلي متكامل في الرياض، يجمع بين الخبرة الطبية،
                التقنيات الحديثة، وخطة واضحة تناسب كل حالة.
              </span>
              <span className="lang-en">
                Rejuvera Center — a full-service medical aesthetic center in
                Riyadh, offering advanced dermatology, cosmetic treatments, and
                body care.
              </span>
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { ar: "مركز طبي مرخص", en: "Licensed medical center" },
                {
                  ar: "تقنيات مختارة بعناية",
                  en: "Curated medical technology",
                },
                {
                  ar: "تنسيق واضح للمواعيد",
                  en: "Clear appointment coordination",
                },
              ].map((item) => (
                <span key={item.ar} className="rv-v0-mini-chip">
                  <span className="lang-ar">{item.ar}</span>
                  <span className="lang-en">{item.en}</span>
                </span>
              ))}
            </div>
            {socialRows.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {socialRows.map((row) => (
                  <a
                    key={row.kind}
                    href={normalizeSocialUrl(row.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rv-v0-footer-social-btn"
                    data-social={row.kind}
                    aria-label={row.label}
                  >
                    {socialIcon(row.kind)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="rv-v0-footer-title">
              <span className="lang-ar">روابط مهمة</span>
              <span className="lang-en">Quick links</span>
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={`${link.href}-${link.labelAr}`}>
                  <Link
                    href={link.href as Route}
                    className="rv-v0-footer-link rv-v0-footer-link-row"
                  >
                    <span className="rv-v0-footer-link-dot" aria-hidden />
                    <span className="lang-ar">{link.labelAr}</span>
                    <span className="lang-en">{link.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="rv-v0-footer-title">
              <span className="lang-ar">خدماتنا</span>
              <span className="lang-en">Services</span>
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}` as Route}
                    className="rv-v0-footer-link rv-v0-footer-link-row"
                  >
                    <span className="rv-v0-footer-link-dot" aria-hidden />
                    <span className="lang-ar">{service.name}</span>
                    <span className="lang-en">
                      {serviceNameEnBySlug[service.slug] ?? "Service details"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="rv-v0-footer-title">
              <span className="lang-ar">تواصلي معنا</span>
              <span className="lang-en">Contact</span>
            </h3>
            <ul className="rv-v0-footer-contact-list mt-5 space-y-3 text-sm">
              <li>
                <a href={telPrimary} className="rv-v0-footer-contact-row">
                  <span className="rv-v0-footer-contact-icon">
                    <PhoneIcon />
                  </span>
                  <span dir="ltr" className="rv-v0-footer-contact-text">
                    {primaryPhone}
                  </span>
                </a>
              </li>
              {telSecondary ? (
                <li>
                  <a href={telSecondary} className="rv-v0-footer-contact-row">
                    <span className="rv-v0-footer-contact-icon">
                      <PhoneIcon />
                    </span>
                    <span dir="ltr" className="rv-v0-footer-contact-text">
                      {secondaryPhone}
                    </span>
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  href={`mailto:${primaryEmail}`}
                  className="rv-v0-footer-contact-row"
                >
                  <span className="rv-v0-footer-contact-icon">
                    <MailIcon />
                  </span>
                  <span dir="ltr" className="rv-v0-footer-contact-text">
                    {primaryEmail}
                  </span>
                </a>
              </li>
              {waHref ? (
                <li>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rv-v0-footer-contact-row"
                  >
                    <span className="rv-v0-footer-contact-icon">
                      <WhatsAppGlyph />
                    </span>
                    <span dir="ltr" className="rv-v0-footer-contact-text">
                      {runtimeSettings.contact.whatsapp}
                    </span>
                  </a>
                </li>
              ) : null}
              <li className="rv-v0-footer-contact-row is-static">
                <span className="rv-v0-footer-contact-icon">
                  <MapPinIcon />
                </span>
                <span className="rv-v0-footer-contact-text">
                  <span className="lang-ar">
                    الرياض، المملكة العربية السعودية
                  </span>
                  <span className="lang-en">Riyadh, Saudi Arabia</span>
                </span>
              </li>
              {/* hours block - subagent #3 */}
              <li className="rv-v0-footer-contact-row is-static rv-v0-footer-hours">
                <span className="rv-v0-footer-contact-icon">
                  <ClockIcon />
                </span>
                <span className="rv-v0-footer-contact-text">
                  <span className="lang-ar rv-v0-footer-hours-lines">
                    <strong>ساعات العمل</strong>
                    <span>
                      <span>السبت إلى الخميس</span>
                      <time>2:00 م - 10:00 م</time>
                    </span>
                  </span>
                  <span className="lang-en rv-v0-footer-hours-lines">
                    <strong>Working hours</strong>
                    <span>
                      <span>Saturday to Thursday</span>
                      <time>2:00 PM - 10:00 PM</time>
                    </span>
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rv-v0-footer-mobile-book">
          <BookingModal
            services={services}
            recaptchaSiteKey={getPublicSiteKey()}
            compactLabel
            buttonClassName="rv-v0-footer-mobile-book-btn"
            labelAr="احجزي معنا الآن"
            labelEn="Book with us now"
            source="Mobile footer booking"
          />
        </div>

        {/* Trust + payments combined sub-row — sized & aligned cleanly. */}
        <div className="rv-v0-footer-strips border-t border-[color:var(--rv-line)] px-6 py-7 lg:px-10">
          <div className="rv-v0-footer-strip-block">
            <p className="rv-v0-strip-eyebrow">
              <span className="lang-ar">اعتمادات ومعايير</span>
              <span className="lang-en">Trust &amp; Compliance</span>
            </p>
            <ul className="rv-v0-trust-strip" aria-label="Trust badges">
              {trustBadges.map((badge) => (
                <li key={badge.src} className="rv-v0-trust-badge">
                  <Image
                    src={badge.src}
                    alt={badge.alt}
                    width={120}
                    height={48}
                    className="rv-v0-trust-badge-img"
                    unoptimized
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="rv-v0-footer-strip-block">
            <p className="rv-v0-strip-eyebrow">
              <span className="lang-ar">طرق الدفع المدعومة</span>
              <span className="lang-en">Accepted Payments</span>
            </p>
            <ul className="rv-v0-pay-strip" aria-label="Payment methods">
              {paymentMethods.map((method) => (
                <li key={method.src} className="rv-v0-pay-card">
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={120}
                    height={48}
                    className="rv-v0-pay-img"
                    style={{ width: "auto", height: "100%" }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--rv-line)] px-6 py-5 text-xs text-[color:var(--rv-muted)] lg:px-10">
          <p dir="ltr">
            © {new Date().getFullYear()} {runtimeSettings.brand.siteName} ·{" "}
            {runtimeSettings.contact.domain}
          </p>
          <p className="flex flex-wrap items-center gap-3">
            <Link href="/privacy" className="hover:text-[color:var(--rv-ink)]">
              <span className="lang-ar">سياسة الخصوصية</span>
              <span className="lang-en">Privacy</span>
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="hover:text-[color:var(--rv-ink)]">
              <span className="lang-ar">الشروط والأحكام</span>
              <span className="lang-en">Terms</span>
            </Link>
            <span aria-hidden>·</span>
            <Link href="/career" className="hover:text-[color:var(--rv-ink)]">
              <span className="lang-ar">التوظيف</span>
              <span className="lang-en">Careers</span>
            </Link>
            <span aria-hidden>·</span>
            <Link href="/contact" className="hover:text-[color:var(--rv-ink)]">
              <span className="lang-ar">تواصلي معنا</span>
              <span className="lang-en">Contact</span>
            </Link>
          </p>
          <p className="max-w-xl text-end text-pretty sm:text-start">
            <span className="lang-ar">
              ريجوفيرا مركز طبي. جميع الحقوق محفوظة.
            </span>
            <span className="lang-en">
              Rejuvera Center. All rights reserved.
            </span>
          </p>
        </div>
      </div>

      <ScrollToTopButton />
    </footer>
  );
}
