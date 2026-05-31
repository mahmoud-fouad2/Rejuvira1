import { ContentStatus } from "@/lib/prisma-enums";
import Link from "next/link";
import { cookies } from "next/headers";

import { SiteMegaMenu } from "@/components/navigation/SiteMegaMenu";
import {
  getDevices,
  getDoctors,
  getRuntimeSettings,
  getServices,
} from "@/lib/content-repository";
import { getPublicSiteKey } from "@/lib/recaptcha";

import { BookingModal } from "./BookingModal";
import { BrandLogo } from "./BrandLogo";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/", labelAr: "الرئيسية", labelEn: "Home" },
  { href: "/services", labelAr: "الخدمات", labelEn: "Services" },
  { href: "/doctors", labelAr: "أطباؤنا", labelEn: "Doctors" },
  { href: "/devices", labelAr: "أجهزتنا", labelEn: "Devices" },
  { href: "/gallery", labelAr: "معرض الصور", labelEn: "Gallery" },
  { href: "/journal", labelAr: "المجلة", labelEn: "Journal" },
  { href: "/about", labelAr: "من نحن", labelEn: "About" },
  { href: "/career", labelAr: "التوظيف", labelEn: "Careers" },
  { href: "/contact", labelAr: "تواصلي معنا", labelEn: "Contact" },
] as const;

function Icon({
  path,
  className = "h-4 w-4",
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return <Icon path="M4 7h16M4 12h16M4 17h16" className="h-5 w-5" />;
}

export async function SiteHeader() {
  const [runtimeSettings, services, doctors, devices, cookieStore] =
    await Promise.all([
      getRuntimeSettings(),
      getServices(),
      getDoctors(),
      getDevices(),
      cookies(),
    ]);

  const cookieLang = cookieStore.get("rejuvira-lang")?.value;
  const navLabel = cookieLang === "en" ? "Main navigation" : "التنقل الرئيسي";

  const publishedServices = services.filter(
    (service) => service.status === ContentStatus.PUBLISHED,
  );
  const publishedDoctors = doctors.filter(
    (doctor) => doctor.status === ContentStatus.PUBLISHED,
  );
  const publishedDevices = devices.filter(
    (device) => device.status === ContentStatus.PUBLISHED,
  );

  const primaryTel = `tel:${runtimeSettings.contact.phone.replace(/\D/g, "")}`;
  const secondaryTel = runtimeSettings.contact.phoneSecondary
    ? `tel:${runtimeSettings.contact.phoneSecondary.replace(/\D/g, "")}`
    : null;

  const linkByHref = Object.fromEntries(
    navLinks.map((l) => [l.href, l]),
  ) as Record<(typeof navLinks)[number]["href"], (typeof navLinks)[number]>;

  return (
    <header className="rv-v0-header sticky top-0 z-50">
      <div className="rv-v0-top-strip">
        <div className="rv-v0-top-inner mx-auto max-w-[var(--max-width)] px-4 sm:px-6 lg:px-8">
          <div className="rv-v0-top-contact" dir="ltr">
            <a href={`mailto:${runtimeSettings.contact.email}`}>
              <Icon path="M4 6h16v12H4zM4 7l8 6 8-6" />
              {runtimeSettings.contact.email}
            </a>
            <a href={primaryTel}>
              <Icon path="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.92.33 1.82.62 2.68a2 2 0 0 1-.45 2.11L8 9.79a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.86.29 1.76.5 2.68.62A2 2 0 0 1 22 16.92Z" />
              {runtimeSettings.contact.phone}
            </a>
            {secondaryTel ? (
              <a href={secondaryTel} className="rv-v0-top-contact-secondary">
                <Icon path="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.92.33 1.82.62 2.68a2 2 0 0 1-.45 2.11L8 9.79a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.86.29 1.76.5 2.68.62A2 2 0 0 1 22 16.92Z" />
                {runtimeSettings.contact.phoneSecondary}
              </a>
            ) : null}
          </div>
          <div className="rv-v0-top-location">
            <Icon path="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11ZM12 10.5h.01" />
            <span className="lang-ar">الرياض، المملكة العربية السعودية</span>
            <span className="lang-en">Riyadh, Saudi Arabia</span>
          </div>
        </div>
      </div>

      <div className="rv-v0-nav-shell">
        <div className="rv-v0-nav mx-auto max-w-[var(--max-width)] px-4 py-1.5 sm:px-6 lg:px-8">
          <details className="rv-mobile-details group">
            <summary className="rv-v0-menu-button flex h-11 w-11 cursor-pointer list-none items-center justify-center">
              <MenuIcon />
            </summary>
            <div className="rv-v0-mobile-menu p-3">
              <div className="grid gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rv-v0-mobile-link"
                  >
                    <span className="lang-ar">{link.labelAr}</span>
                    <span className="lang-en">{link.labelEn}</span>
                  </Link>
                ))}
              </div>
            </div>
          </details>

          <div className="rv-nav-brand-wrap">
            <Link
              href="/"
              className="rv-v0-brand"
              aria-label={runtimeSettings.brand.siteName}
            >
              <BrandLogo
                alt={runtimeSettings.brand.logoAlt}
                width={564}
                height={564}
                priority
                variant="header"
                className="rv-v0-logo"
                sizes="(max-width: 480px) 170px, (max-width: 768px) 200px, 180px"
              />
            </Link>
          </div>

          <nav className="rv-nav-menu" aria-label={navLabel}>
            <Link href="/" className="rv-v0-nav-link">
              <span className="lang-ar">{linkByHref["/"].labelAr}</span>
              <span className="lang-en">{linkByHref["/"].labelEn}</span>
            </Link>
            <SiteMegaMenu
              triggerLabel="استكشاف المركز"
              services={
                publishedServices.length > 0 ? publishedServices : services
              }
              doctors={publishedDoctors.length > 0 ? publishedDoctors : doctors}
              devices={publishedDevices.length > 0 ? publishedDevices : devices}
            />
            {(["/gallery", "/journal", "/about", "/career", "/contact"] as const).map(
              (href) => {
                const link = linkByHref[href];
                return (
                  <Link key={href} href={href} className="rv-v0-nav-link">
                    <span className="lang-ar">{link.labelAr}</span>
                    <span className="lang-en">{link.labelEn}</span>
                  </Link>
                );
              },
            )}
          </nav>

          <div className="rv-nav-actions">
            <BookingModal
              services={
                publishedServices.length > 0 ? publishedServices : services
              }
              recaptchaSiteKey={getPublicSiteKey()}
            />
            <ThemeToggle />
            <LanguageToggle />
          </div>

          <div className="rv-mobile-inline-actions">
            <BookingModal
              services={
                publishedServices.length > 0 ? publishedServices : services
              }
              recaptchaSiteKey={getPublicSiteKey()}
              compactLabel
            />
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
