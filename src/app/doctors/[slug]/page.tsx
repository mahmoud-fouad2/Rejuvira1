import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BookingModal } from "@/components/layout/BookingModal";
import { getPublicSiteKey } from "@/lib/recaptcha";
import {
  getDevices,
  getDoctorBySlug,
  getRuntimeSettings,
  getServices,
} from "@/lib/content-repository";
import { coreSearchKeywords } from "@/lib/core-search";
import { ContentStatus } from "@/lib/prisma-enums";
import { getSiteUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    return {
      title: "الطبيب غير موجود",
    };
  }

  const canonicalUrl = `${getSiteUrl()}/doctors/${doctor.slug}`;
  const isLoai = doctor.slug === "loai-alsalmi";
  const titleAr = isLoai
    ? "د. لؤي السالمي | شد الوجه والرقبة وجراحة التجميل بالرياض"
    : `${doctor.name} | ${doctor.specialty}`;
  const titleEn = isLoai
    ? "Dr. Loai Al-Salmi | Facelift, Neck Lift and Plastic Surgery Riyadh"
    : `${doctor.nameEn ?? doctor.name} | ${doctor.specialtyEn ?? doctor.specialty}`;
  const descriptionAr = isLoai
    ? "الملف الطبي لد. لؤي السالمي استشاري جراحة التجميل والترميم في ريجوفيرا بالرياض، مع خدمات شد الوجه والرقبة وعلاج الوذمة الشحمية والتخطيط الجراحي المتخصص."
    : doctor.summary;
  const descriptionEn = isLoai
    ? "Medical profile of Dr. Loai Al-Salmi, consultant plastic and reconstructive surgeon at Rejuvera Riyadh, with specialist assessment for facelift, neck lift, lipedema, and plastic surgery."
    : (doctor.summaryEn ?? doctor.summary);
  const title = `${titleAr} — ${titleEn}`;
  const description = `${descriptionAr} ${descriptionEn}`;

  return {
    title,
    description,
    keywords: [
      doctor.name,
      doctor.nameEn ?? "",
      doctor.specialty,
      doctor.specialtyEn ?? "",
      doctor.title,
      "ريجوفيرا",
      "Rejuvera",
      "طبيب تجميل الرياض",
      "Aesthetic doctor Riyadh",
      ...(isLoai ? coreSearchKeywords : []),
    ],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      locale: "ar_SA",
      alternateLocale: "en_US",
      images: [doctor.coverImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [doctor.coverImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ar: canonicalUrl,
        "ar-SA": canonicalUrl,
        en: `${canonicalUrl}?lang=en`,
        "en-US": `${canonicalUrl}?lang=en`,
        "x-default": canonicalUrl,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function PhoneGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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

function WhatsAppGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function StarGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="currentColor"
      aria-hidden
    >
      <path d="m12 2 3 6.91 7.1.62-5.4 4.72 1.66 7.05L12 17.77 5.64 21.3 7.3 14.25 1.9 9.53 9 8.91Z" />
    </svg>
  );
}

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [doctor, services, devices, runtimeSettings] = await Promise.all([
    getDoctorBySlug(slug),
    getServices(),
    getDevices(),
    getRuntimeSettings(),
  ]);

  if (!doctor) {
    notFound();
  }

  const doctorServiceSlugSet = new Set(doctor.serviceSlugs);
  const relatedServices = services.filter(
    (service) =>
      doctorServiceSlugSet.has(service.slug) ||
      service.doctorSlugs.includes(doctor.slug),
  );
  const relatedDeviceSlugs = new Set(
    relatedServices.flatMap((service) => service.deviceSlugs),
  );
  const relatedDevices = devices.filter(
    (device) =>
      device.status === ContentStatus.PUBLISHED &&
      relatedDeviceSlugs.has(device.slug),
  );

  const waDigits = (
    runtimeSettings.contact.whatsapp || runtimeSettings.contact.phone
  ).replace(/\D/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`أرغب في حجز استشارة مع ${doctor.name}`)}`
    : null;
  const telHref = `tel:${runtimeSettings.contact.phone.replace(/\D/g, "")}`;
  const doctorUrl = `${getSiteUrl()}/doctors/${doctor.slug}`;
  const doctorJsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${doctorUrl}#physician`,
    name: doctor.name,
    alternateName: doctor.nameEn,
    description: doctor.summary,
    image: doctor.photoUrl,
    medicalSpecialty: doctor.specialty,
    url: doctorUrl,
    availableLanguage: [...doctor.languages],
    telephone: runtimeSettings.contact.phone,
    email: runtimeSettings.contact.email,
    areaServed: {
      "@type": "City",
      name: "Riyadh",
    },
    knowsAbout: relatedServices.map(
      (service) => service.nameEn ?? service.name,
    ),
    inLanguage: ["ar", "en"],
    worksFor: {
      "@id": `${getSiteUrl()}#organization`,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${getSiteUrl()}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Doctors",
        item: `${getSiteUrl()}/doctors`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: doctor.name,
        item: doctorUrl,
      },
    ],
  };

  const sections: Array<{
    id: string;
    label: string;
    items: readonly string[];
  }> = [
    { id: "education", label: "التعليم والتأهيل", items: doctor.education },
    {
      id: "achievements",
      label: "الإنجازات والمحطات",
      items: doctor.achievements,
    },
    {
      id: "publications",
      label: "الاقتباسات والمنشورات",
      items: doctor.publications,
    },
  ];

  return (
    <div className="min-h-screen">
      <script
        id={`doctor-structured-data-${doctor.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(doctorJsonLd),
        }}
      />
      <script
        id={`doctor-breadcrumb-data-${doctor.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <SiteHeader />
      <main className="rv-doctor-profile mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-12 px-6 pt-14 pb-32 lg:gap-16 lg:px-10">
        {/* ── HERO BAND ──────────────────────────────────── */}
        <section className="rv-doctor-hero">
          <div className="rv-doctor-hero-photo">
            <Image
              src={doctor.photoUrl}
              alt={doctor.name}
              fill
              sizes="(max-width: 1024px) 100vw, 36rem"
              priority
              className="object-cover object-top"
            />
            {doctor.featured && doctor.slug === "loai-alsalmi" ? (
              <span className="rv-doctor-hero-badge">
                <StarGlyph />
                <span className="lang-ar">طبيب مميز</span>
                <span className="lang-en">Featured</span>
              </span>
            ) : null}
          </div>
          <div className="rv-doctor-hero-body">
            <p className="rv-doctor-hero-eyebrow">
              <span className="lang-ar">الملف الطبي</span>
              <span className="lang-en">Medical Profile</span>
            </p>
            <h1 className="rv-doctor-hero-name">
              <span className="lang-ar">{doctor.name}</span>
              <span className="lang-en">{doctor.nameEn ?? doctor.name}</span>
            </h1>
            <p className="rv-doctor-hero-title">
              <span className="lang-ar">{doctor.title}</span>
              <span className="lang-en">{doctor.titleEn ?? doctor.title}</span>
            </p>
            <div className="rv-doctor-hero-meta">
              <span className="rv-doctor-hero-pill is-specialty">
                <span className="lang-ar">{doctor.specialty}</span>
                <span className="lang-en">
                  {doctor.specialtyEn ?? doctor.specialty}
                </span>
              </span>
              <span className="rv-doctor-hero-pill is-exp">
                {doctor.yearsExperience}+{" "}
                <span className="lang-ar">سنة خبرة</span>
                <span className="lang-en">years experience</span>
              </span>
              {doctor.languages.length > 0 ? (
                <span className="rv-doctor-hero-pill is-langs">
                  {doctor.languages.join(" · ")}
                </span>
              ) : null}
            </div>
            <p className="rv-doctor-hero-summary">
              <span className="lang-ar">{doctor.summary}</span>
              <span className="lang-en">
                {doctor.summaryEn ?? doctor.summary}
              </span>
            </p>
            <div className="rv-doctor-hero-cta">
              <BookingModal
                services={services}
                recaptchaSiteKey={getPublicSiteKey()}
                buttonClassName="rv-doctor-cta-primary"
                labelAr="احجزي استشارة"
                labelEn="Book a consultation"
                source={`Doctor profile booking: ${doctor.name}`}
              />
              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rv-doctor-cta-whatsapp"
                >
                  <WhatsAppGlyph />
                  <span className="lang-ar">واتساب مباشر</span>
                  <span className="lang-en">WhatsApp now</span>
                </a>
              ) : null}
              <a href={telHref} className="rv-doctor-cta-call">
                <PhoneGlyph />
                <span dir="ltr">{runtimeSettings.contact.phone}</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── ABOUT / BIO ────────────────────────────────── */}
        <section className="rv-doctor-block" aria-labelledby="rv-doctor-bio">
          <header className="rv-doctor-block-head">
            <p className="rv-doctor-block-eyebrow">
              <span className="lang-ar">نبذة عن الطبيب</span>
              <span className="lang-en">About</span>
            </p>
            <h2 id="rv-doctor-bio">
              <span className="lang-ar">
                منهج عملي يبدأ من تشخيص واضح وخطة مناسبة.
              </span>
              <span className="lang-en">
                A clinical approach rooted in a clear diagnosis and a fitting
                plan.
              </span>
            </h2>
          </header>
          <div className="rv-doctor-block-body">
            <p className="rv-doctor-bio-text">{doctor.bio}</p>
          </div>
        </section>

        {/* ── STACKED SECTIONS ───────────────────────────── */}
        {sections.map((section) =>
          section.items.length > 0 ? (
            <section
              key={section.id}
              className="rv-doctor-block"
              aria-labelledby={`rv-doctor-${section.id}`}
            >
              <header className="rv-doctor-block-head">
                <p className="rv-doctor-block-eyebrow">{section.label}</p>
                <h2 id={`rv-doctor-${section.id}`}>{section.label}</h2>
              </header>
              <ul className="rv-doctor-list">
                {section.items.map((item) => (
                  <li key={item}>
                    <span className="rv-doctor-list-marker" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )}

        {/* ── RELATED SERVICES ───────────────────────────── */}
        {relatedServices.length > 0 ? (
          <section
            className="rv-doctor-block"
            aria-labelledby="rv-doctor-services"
          >
            <header className="rv-doctor-block-head">
              <p className="rv-doctor-block-eyebrow">
                <span className="lang-ar">الخدمات المرتبطة</span>
                <span className="lang-en">Related services</span>
              </p>
              <h2 id="rv-doctor-services">
                <span className="lang-ar">
                  خدمات يقدمها هذا الطبيب ضمن الخطة العلاجية.
                </span>
                <span className="lang-en">
                  Services this physician supports within the treatment plan.
                </span>
              </h2>
            </header>
            <div className="rv-doctor-cards-grid">
              {relatedServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}` as Route}
                  className="rv-doctor-relcard"
                >
                  <span className="rv-doctor-relcard-image">
                    <Image
                      src={service.coverImageUrl}
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 28vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </span>
                  <div className="rv-doctor-relcard-body">
                    <small>{service.category}</small>
                    <strong>{service.name}</strong>
                    <p>{service.excerpt}</p>
                    <span className="rv-doctor-relcard-cta">
                      <span className="lang-ar">تفاصيل الخدمة</span>
                      <span className="lang-en">Service details</span>
                      <span aria-hidden> ←</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── RELATED DEVICES ────────────────────────────── */}
        {relatedDevices.length > 0 ? (
          <section
            className="rv-doctor-block"
            aria-labelledby="rv-doctor-devices"
          >
            <header className="rv-doctor-block-head">
              <p className="rv-doctor-block-eyebrow">
                <span className="lang-ar">أجهزة مستخدمة</span>
                <span className="lang-en">Devices used</span>
              </p>
              <h2 id="rv-doctor-devices">
                <span className="lang-ar">
                  التقنيات المرتبطة بمسار العلاج لدى هذا الطبيب.
                </span>
                <span className="lang-en">
                  Technologies used along this physician&apos;s treatment plans.
                </span>
              </h2>
            </header>
            <div className="rv-doctor-cards-grid">
              {relatedDevices.map((device) => (
                <article
                  key={device.id}
                  className="rv-doctor-relcard is-device"
                >
                  <span className="rv-doctor-relcard-image">
                    <Image
                      src={device.imageUrl}
                      alt={device.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 28vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </span>
                  <div className="rv-doctor-relcard-body">
                    <small>{device.certifications[0] || "تقنية معتمدة"}</small>
                    <strong>{device.name}</strong>
                    <p>{device.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── CLOSING CTA ───────────────────────────────── */}
        <section className="rv-doctor-close">
          <div>
            <h2>
              <span className="lang-ar">
                احجزي وقتًا مناسبًا مع {doctor.name}
              </span>
              <span className="lang-en">Book a time with {doctor.name}</span>
            </h2>
            <p>
              <span className="lang-ar">
                سيستقبل فريق المركز طلبك بسرّية مهنية ثم يحدد معك أقرب موعد عملي
                وفق الأولويات الطبية لحالتك.
              </span>
              <span className="lang-en">
                Our team reviews your request and helps schedule a suitable
                consultation based on your needs.
              </span>
            </p>
          </div>
          <div className="rv-doctor-close-cta">
            <BookingModal
              services={services}
              recaptchaSiteKey={getPublicSiteKey()}
              buttonClassName="rv-doctor-cta-primary"
              labelAr="احجزي الاستشارة"
              labelEn="Request booking"
              source={`Doctor profile closing booking: ${doctor.name}`}
            />
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rv-doctor-cta-whatsapp"
              >
                <WhatsAppGlyph />
                <span className="lang-ar">واتساب</span>
                <span className="lang-en">WhatsApp</span>
              </a>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
