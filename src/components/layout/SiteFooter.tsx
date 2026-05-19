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
  const S = 20;
  if (kind === "instagram") {
    return (
      <svg viewBox="0 0 24 24" width={S} height={S} aria-hidden>
        <defs>
          <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad)" />
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" strokeWidth="1.6" />
        <circle cx="17.5" cy="6.5" r="1.1" fill="#fff" />
      </svg>
    );
  }
  if (kind === "twitter") {
    return (
      <svg viewBox="0 0 24 24" width={S} height={S} aria-hidden>
        <rect width="24" height="24" rx="5.5" fill="#000" />
        <path
          d="M13.545 10.239 18.44 4.5h-1.17l-4.25 4.957L9.38 4.5H5.25l5.13 7.473L5.25 18.5h1.17l4.486-5.232 3.584 5.232H18.75zM7.5 5.5h1.91l7.07 10.03H14.57z"
          fill="#fff"
        />
      </svg>
    );
  }
  if (kind === "youtube") {
    return (
      <svg viewBox="0 0 24 24" width={S} height={S} aria-hidden>
        <rect width="24" height="24" rx="5.5" fill="#FF0000" />
        <path d="m10 15.5 5-3.5-5-3.5v7z" fill="#fff" />
      </svg>
    );
  }
  if (kind === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" width={S} height={S} aria-hidden>
        <rect width="24" height="24" rx="5.5" fill="#0077B5" />
        <path
          d="M7 9.5h2v8H7v-8zm1-2.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM10.5 9.5H12v1.1c.4-.7 1.2-1.2 2.2-1.2 2 0 2.8 1.3 2.8 3.2v4.9H15v-4.5c0-.9-.3-1.7-1.3-1.7s-1.7.8-1.7 2v4.2h-1.5v-8z"
          fill="#fff"
        />
      </svg>
    );
  }
  if (kind === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" width={S} height={S} aria-hidden>
        <rect width="24" height="24" rx="5.5" fill="#010101" />
        <path
          d="M17 8.5a4 4 0 0 1-2.2-.7v5.4a3.8 3.8 0 1 1-3.1-3.74v2.1a1.7 1.7 0 1 0 1.1 1.6V4.5H15a2.5 2.5 0 0 0 2 2.45V8.5z"
          fill="#fff"
        />
        <path
          d="M16.8 7.1A4.05 4.05 0 0 1 14.85 4.5H15a2.5 2.5 0 0 0 2.45 2.45v.15z"
          fill="#69C9D0"
        />
      </svg>
    );
  }
  if (kind === "snapchat") {
    return (
      <svg viewBox="0 0 24 24" width={S} height={S} aria-hidden>
        <rect width="24" height="24" rx="5.5" fill="#FFFC00" />
        <path
          d="M12 4c-1.7 0-3.3.8-4 2.2-.4.8-.3 1.8-.3 2.7 0 .1-.1.2-.2.3-.3.1-.7 0-.9.2-.2.3 0 .6.3.7.4.1.7.3.6.7-.2.6-.8 1.1-1.2 1.6-.1.1.1.4.3.4.2 0 .3.1.3.3 0 .5-.6.8-.9.9-.3.1-.2.5.1.6.3.1 1.2.4 1.5 1.2.1.2.3.1.4 0 .4-.3.9-.3 1.3-.1.7.4 1.3.5 1.8.5s1.1-.1 1.8-.5c.4-.2.9-.2 1.3.1.1.1.3.2.4 0 .3-.8 1.2-1.1 1.5-1.2.3-.1.4-.5.1-.6-.3-.1-.9-.4-.9-.9 0-.2.1-.3.3-.3.2 0 .4-.3.3-.4-.4-.5-1-.9-1.2-1.6-.1-.4.2-.6.6-.7.3-.1.5-.4.3-.7-.2-.2-.6-.1-.9-.2-.1-.1-.2-.2-.2-.3 0-.9.1-1.9-.3-2.7C15.3 4.8 13.7 4 12 4z"
          fill="#000"
        />
      </svg>
    );
  }
  if (kind === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" width={S} height={S} aria-hidden>
        <rect width="24" height="24" rx="5.5" fill="#25D366" />
        <path
          d="M12 4.5a7.5 7.5 0 0 0-6.41 11.39L4.5 19.5l3.73-1.08A7.5 7.5 0 1 0 12 4.5zm4.44 10.6c-.19.53-.97 1-1.34 1.05-.35.05-.77.07-1.25-.08-.29-.09-.65-.22-1.12-.43-1.97-.85-3.25-2.85-3.35-2.98-.1-.13-.83-1.1-.83-2.1 0-1 .52-1.49.71-1.7.18-.2.4-.25.53-.25h.38c.12 0 .28-.04.44.34l.6 1.47c.06.13.1.27.02.43l-.22.42-.3.31c-.1.1-.22.2-.1.41.13.2.57.93 1.21 1.5.83.74 1.53.98 1.75 1.09.22.11.34.09.47-.06l.48-.57c.13-.17.26-.14.44-.08l1.36.64c.2.1.33.14.38.22.05.1 0 .5-.21 1.03z"
          fill="#fff"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={S} height={S} aria-hidden>
      <rect width="24" height="24" rx="5.5" fill="#6366f1" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="#fff" strokeWidth="1.6" />
      <path d="M2 12h3M19 12h3M12 2v3M12 19v3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
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
            <Link href="/contact" className="hover:text-[color:var(--rv-ink)]">
              <span className="lang-ar">تواصلي معنا</span>
              <span className="lang-en">Contact</span>
            </Link>
          </p>
          <p className="max-w-xl text-end text-pretty sm:text-start">
            <span className="lang-ar">
              ريجوفيرا مركز طبي متخصص. جميع الحقوق محفوظة.
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
