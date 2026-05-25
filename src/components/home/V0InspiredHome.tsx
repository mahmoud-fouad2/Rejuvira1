import { ContentStatus } from "@/lib/prisma-enums";
import type { Route } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type {
  DeviceRecord,
  DoctorRecord,
  GalleryRecord,
  JournalPostRecord,
  RuntimeSettings,
  ServiceRecord,
} from "@/lib/content-repository";

import { V0GalleryBeforeAfterCard } from "@/components/home/V0GalleryBeforeAfterCard";
import { V0ServicesStrip } from "@/components/home/V0ServicesStrip";
import type { TestimonialItem } from "@/components/home/TestimonialsSplitCarousel";

const V0DoctorQuotesSlider = dynamic(
  () =>
    import("@/components/home/V0DoctorQuotesSlider").then(
      (m) => m.V0DoctorQuotesSlider,
    ),
);
const V0DoctorsCarousel = dynamic(
  () =>
    import("@/components/home/V0DoctorsCarousel").then(
      (m) => m.V0DoctorsCarousel,
    ),
);
const V0JournalCarousel = dynamic(
  () =>
    import("@/components/home/V0JournalCarousel").then(
      (m) => m.V0JournalCarousel,
    ),
);
const TestimonialsSplitCarousel = dynamic(
  () =>
    import("@/components/home/TestimonialsSplitCarousel").then(
      (m) => m.TestimonialsSplitCarousel,
    ),
);

type V0InspiredHomeProps = {
  settings: RuntimeSettings;
  services: ServiceRecord[];
  doctors: DoctorRecord[];
  devices: DeviceRecord[];
  galleryItems: GalleryRecord[];
  journalPosts: JournalPostRecord[];
};

const fallbackTestimonialsBi: readonly TestimonialItem[] = [
  {
    quoteAr:
      "شرح الطبيب الخطة بوضوح قبل البدء، وكانت المتابعة بعد الجلسة منظمة.",
    quoteEn:
      "A refined experience from the start — the plan was clear and the results look natural.",
    authorAr: "نورة",
    authorEn: "Noura",
  },
  {
    quoteAr: "الاستشارة كانت هادئة ومباشرة، ولم أشعر بضغط لاختيار إجراء معين.",
    quoteEn:
      "They never rushed the process; explanations were calm and thorough even with many questions.",
    authorAr: "سارة",
    authorEn: "Sarah",
  },
  {
    quoteAr:
      "الحجز واضح، والاستقبال منظم، والتعليمات بعد الزيارة وصلت في وقت مناسب.",
    quoteEn:
      "Well-organized facility, smooth booking, and consistent follow-up after sessions.",
    authorAr: "ريم",
    authorEn: "Reem",
  },
  {
    quoteAr: "أعجبني أن القرار بدأ بتقييم الحالة وليس باسم الجهاز أو العرض.",
    quoteEn:
      "Every step was explained before starting — that truly gave me confidence.",
    authorAr: "جود",
    authorEn: "Jood",
  },
  {
    quoteAr: "الخطة كانت واقعية، والنتيجة المطلوبة تم شرح حدودها قبل الإجراء.",
    quoteEn:
      "No pressure at all — decisions were based purely on my actual needs.",
    authorAr: "هند",
    authorEn: "Hind",
  },
  {
    quoteAr: "الفريق أجاب عن الأسئلة الأساسية بوضوح، وهذا جعل الزيارة أسهل.",
    quoteEn:
      "They assessed my skin thoroughly before recommending any treatment — that's rare.",
    authorAr: "لمى",
    authorEn: "Lama",
  },
  {
    quoteAr: "تفاصيل المتابعة بعد الجلسة جعلت التجربة أكثر اطمئنانًا.",
    quoteEn:
      "The follow-up messages were personal and professional, not automated.",
    authorAr: "أمل",
    authorEn: "Amal",
  },
  {
    quoteAr: "استقبال منظم، وفريق يعرف ما يقول قبل أن يقول.",
    quoteEn:
      "Organized reception and a team that knows exactly what they're doing.",
    authorAr: "غادة",
    authorEn: "Ghada",
  },
] as const;

const fallbackTrustItems = [
  {
    badgeAr: "و",
    badgeEn: "M",
    titleAr: "وزارة الصحة",
    titleEn: "MOH Licensed",
    bodyAr: "تشغيل طبي منظم ومتوافق مع الاشتراطات المعتمدة.",
    bodyEn: "Operations aligned with Ministry of Health standards.",
  },
  {
    badgeAr: "ب",
    badgeEn: "P",
    titleAr: "بروتوكولات معتمدة",
    titleEn: "Certified protocols",
    bodyAr: "تقنيات عالمية ضمن تقييم دقيق للحالة.",
    bodyEn:
      "International technologies used only after thorough case assessment.",
  },
  {
    badgeAr: "خ",
    badgeEn: "P",
    titleAr: "خصوصية سريرية",
    titleEn: "Complete privacy",
    bodyAr: "رحلة علاجية هادئة وسرية في كل خطوة.",
    bodyEn: "A private and comfortable experience at every step.",
  },
] as const;

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M19 12H5" strokeLinecap="round" />
      <path d="m12 19-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionTitle({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead: ReactNode;
}) {
  return (
    <div className="rv-v0-section-title">
      <span className="rv-v0-pill">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{lead}</p>
    </div>
  );
}

export function V0InspiredHome({
  settings,
  services,
  doctors,
  devices,
  galleryItems,
  journalPosts,
}: V0InspiredHomeProps) {
  const publishedServices = services.filter(
    (service) => service.status === ContentStatus.PUBLISHED,
  );
  const publishedDoctors = doctors.filter(
    (doctor) => doctor.status === ContentStatus.PUBLISHED,
  );
  const publishedDevices = devices.filter(
    (device) => device.status === ContentStatus.PUBLISHED,
  );
  const serviceSource =
    publishedServices.length > 0 ? publishedServices : services;
  const doctorSource = publishedDoctors.length > 0 ? publishedDoctors : doctors;
  const deviceSource = publishedDevices.length > 0 ? publishedDevices : devices;
  const featuredServices = serviceSource.slice(0, 6);
  const featuredDoctors = doctorSource;
  const featuredDevices = deviceSource.slice(0, 6);
  const gallerySource = galleryItems.filter(
    (item) =>
      item.beforeImageUrl.trim().length > 0 &&
      item.afterImageUrl.trim().length > 0,
  );
  const featuredGallery = (
    gallerySource.length > 0 ? gallerySource : galleryItems
  )
    .filter(
      (item) =>
        item.beforeImageUrl.trim().length > 0 &&
        item.afterImageUrl.trim().length > 0,
    )
    .slice(0, 4);
  const featuredJournal = journalPosts.slice(0, 8);
  const testimonialItems =
    settings.homepage.testimonials.length > 0
      ? settings.homepage.testimonials
      : fallbackTestimonialsBi;
  const heroCards = [
    settings.media.heroCard1,
    settings.media.heroCard2,
    settings.media.heroCard3,
  ].filter(
    (src, index, list): src is string =>
      Boolean(src) && list.indexOf(src) === index,
  );

  const doctorQuotes = doctorSource.filter(
    (d) => d.status === ContentStatus.PUBLISHED && d.summary.trim().length > 0,
  );

  const trustItems = fallbackTrustItems;
  const hp = settings.homepage;
  const isLegacyHeroTitle =
    hp.heroTitle.includes("خدمات جلدية") ||
    hp.heroTitle.includes("خيارات أوضح");
  const heroTitleAr = (
    isLegacyHeroTitle ? "اكتشفي جمالك" : hp.heroTitle
  ).replace("اكتشف جمالك", "اكتشفي جمالك");
  const heroTitleAccentAr = isLegacyHeroTitle
    ? "مع خبراء التجميل"
    : hp.heroTitleAccent;
  const heroTitleEn = hp.heroTitleEn.includes("Medical-grade")
    ? "Discover refined care"
    : hp.heroTitleEn;
  const heroTitleAccentEn =
    hp.heroTitleAccentEn.includes("clinician-led") ||
    hp.heroTitleAccentEn.includes("clear treatment")
      ? "at Rejuvera"
      : hp.heroTitleAccentEn;
  const heroDescriptionAr = hp.heroDescription.includes("يعرض الموقع")
    ? "نقدم لكِ أحدث التقنيات في الجراحات التجميلية والعناية بالبشرة، بأيدي نخبة من الأطباء المتخصصين وضمن خطة واضحة تناسب حالتكِ."
    : hp.heroDescription;
  const heroPillAr = "ريجوفيرا للتجميل الطبي";
  const heroPillEn = "Rejuvera Aesthetic Medical Center";

  return (
    <main className="rv-v0-home">
      <section className="rv-v0-hero">
        <div className="rv-v0-dots" />
        <div className="rv-v0-hero-inner">
          <div className="rv-v0-hero-copy">
            <span className="rv-v0-pill rv-v0-pill-live">
              <span />
              <span className="lang-ar">{heroPillAr}</span>
              <span className="lang-en">{heroPillEn}</span>
              <SparkIcon />
            </span>
            <h1>
              <span className="lang-ar">
                {heroTitleAr}
                <strong>{` ${heroTitleAccentAr}`}</strong>
              </span>
              <span className="lang-en">
                {heroTitleEn}
                <strong>{` ${heroTitleAccentEn}`}</strong>
              </span>
            </h1>
            <p>
              <span className="lang-ar">{heroDescriptionAr}</span>
              <span className="lang-en">{hp.heroDescriptionEn}</span>
            </p>
            <div className="rv-v0-hero-chips">
              {(
                [
                  {
                    ar: "أطباء معتمدون دوليًا",
                    en: "Certified physicians",
                  },
                  { ar: "أحدث الأجهزة والتقنيات", en: "Advanced technology" },
                  { ar: "نتائج مدروسة وطبيعية", en: "Natural-looking results" },
                ] as const
              ).map((item) => (
                <span key={item.ar}>
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    aria-hidden
                  >
                    <path
                      d="m4 12 5 5L20 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="lang-ar">{item.ar}</span>
                  <span className="lang-en">{item.en}</span>
                </span>
              ))}
            </div>
            <div className="rv-v0-hero-actions">
              <Link
                href="/contact"
                className="rv-v0-primary focus-visible:ring-2 focus-visible:ring-[color:white] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(74,36,118,0.35)]"
              >
                <span className="lang-ar">{hp.heroCtaPrimary}</span>
                <span className="lang-en">{hp.heroCtaPrimaryEn}</span>
                <ArrowIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/gallery"
                className="rv-v0-secondary focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
              >
                <span className="lang-ar">{hp.heroCtaSecondary}</span>
                <span className="lang-en">{hp.heroCtaSecondaryEn}</span>
                <span className="rv-v0-play" aria-hidden>
                  ▶
                </span>
              </Link>
            </div>
            <div className="rv-v0-stats">
              <div>
                <b>{serviceSource.length}+</b>
                <span className="lang-ar">خدمة مقترحة</span>
                <span className="lang-en">Curated pathways</span>
              </div>
              <div>
                <b>{doctorSource.length}+</b>
                <span className="lang-ar">طبيبة وطبيب</span>
                <span className="lang-en">Clinicians</span>
              </div>
              <div>
                <b>{deviceSource.length}+</b>
                <span className="lang-ar">أجهزة وتقنيات</span>
                <span className="lang-en">Devices</span>
              </div>
            </div>
          </div>

          <div className="rv-v0-hero-visual">
            <div className="rv-v0-orbit" />
            <div
              className="rv-v0-hero-card-stack"
              aria-label="Rejuvera visual highlights"
            >
              {heroCards.map((src, index) => (
                <div
                  key={src}
                  className={`rv-v0-hero-card rv-v0-hero-card-${index + 1}`}
                >
                  <Image
                    src={src}
                    alt={settings.brand.logoAlt}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "low"}
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes={
                      index === 0
                        ? "(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 42vw"
                        : "(max-width: 640px) 0px, (max-width: 1024px) 40vw, 24vw"
                    }
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rv-v0-hero-trust-strip" aria-label="Trust highlights">
          {trustItems.map((card) => (
            <div key={card.titleAr} className="rv-v0-hero-trust-chip">
              <span className="rv-v0-hero-trust-chip-badge" aria-hidden>
                <span className="lang-ar">{card.badgeAr}</span>
                <span className="lang-en">{card.badgeEn}</span>
              </span>
              <span className="rv-v0-hero-trust-chip-text">
                <span className="lang-ar">{card.titleAr}</span>
                <span className="lang-en">{card.titleEn}</span>
              </span>
            </div>
          ))}
          <div className="rv-v0-hero-trust-chip">
            <span className="rv-v0-hero-trust-chip-badge" aria-hidden>
              <span className="lang-ar">م</span>
              <span className="lang-en">R</span>
            </span>
            <span className="rv-v0-hero-trust-chip-text">
              <span className="lang-ar">{`استجابة فريق الاستقبال ${settings.ops.sla}`}</span>
              <span className="lang-en">
                Reception response target within 2 hours
              </span>
            </span>
          </div>
        </div>
      </section>

      <section className="rv-v0-section">
        <SectionTitle
          eyebrow={
            <>
              <span className="lang-ar">خدماتنا المميزة</span>
              <span className="lang-en">Highlighted services</span>
            </>
          }
          title={
            <>
              <span className="lang-ar">خدماتنا المتخصصة</span>
              <span className="lang-en">Our Specialized Services</span>
            </>
          }
          lead={
            <>
              <span className="lang-ar">
                كل خدمة تُصف بنفس الأولويات السريرية المعتمدة داخل المركز، مع
                تناسق بين الصفحة والعيادة.
              </span>
              <span className="lang-en">
                Each service is presented with the same clinical priorities used
                inside the center, ensuring consistency between the page and the
                clinic.
              </span>
            </>
          }
        />
        <div className="rv-v0-services-grid">
          {featuredServices.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}` as Route}
              className="rv-v0-service-card"
            >
              <div className="rv-v0-service-image">
                <Image
                  src={service.coverImageUrl}
                  alt={service.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
                <span>
                  <SparkIcon />
                </span>
              </div>
              <div className="rv-v0-service-body">
                <small>{service.category}</small>
                <h3>{service.name}</h3>
                <p>{service.excerpt}</p>
                <em>
                  <span className="lang-ar">اكتشفي التفاصيل</span>
                  <span className="lang-en">Explore details</span>
                </em>
              </div>
            </Link>
          ))}
        </div>
        <div className="rv-v0-center">
          <Link href="/services" className="rv-v0-light-link hover:underline">
            <span className="lang-ar">استعرضي جميع الخدمات</span>
            <span className="lang-en">Browse the full catalog</span>
          </Link>
        </div>
        <p className="rv-v0-partners-note">
          <span className="lang-ar">
            مواد حقن وتقنيات مستخدمة ضمن بروتوكولات المركز وتُدار حسب تقييم
            الطبيب المعالج لكل حالة.
          </span>
          <span className="lang-en">
            Injectables and device-based treatments are chosen within the
            center&apos;s protocols and tailored by the treating clinician.
          </span>
        </p>
      </section>

      <V0DoctorsCarousel doctors={featuredDoctors} />

      <section className="rv-v0-section">
        <SectionTitle
          eyebrow={
            <>
              <span className="lang-ar">أجهزتنا المتطورة</span>
              <span className="lang-en">Advanced Devices</span>
            </>
          }
          title={
            <>
              <span className="lang-ar">تقنيات حديثة ضمن خطة مناسبة</span>
              <span className="lang-en">
                State-of-the-art certified technology
              </span>
            </>
          }
          lead={
            <>
              <span className="lang-ar">
                تعرض هذه البطاقات الأجهزة المعتمدة داخل المركز مع شهاداتها
                لمساعدتك على فهم دور كل تقنية قبل الالتزام.
              </span>
              <span className="lang-en">
                Each device is shown with its certifications so you can
                understand its role before committing.
              </span>
            </>
          }
        />
        <div className="rv-v0-devices-grid">
          {featuredDevices.map((device) => (
            <Link key={device.id} href="/devices" className="rv-v0-device-card">
              <div>
                <small>
                  {device.certifications[0] ? (
                    device.certifications[0]
                  ) : (
                    <>
                      <span className="lang-ar">تقنية معتمدة</span>
                      <span className="lang-en">Credentialed modality</span>
                    </>
                  )}
                </small>
                <h3>{device.name}</h3>
                <p>{device.excerpt}</p>
              </div>
              <div className="rv-v0-device-image">
                <Image
                  src={device.imageUrl}
                  alt={device.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 28vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </div>
        <div className="rv-v0-center">
          <Link href="/devices" className="rv-v0-primary rv-v0-small-primary">
            <span className="lang-ar">استعرضي جميع الأجهزة</span>
            <span className="lang-en">View every device</span>
          </Link>
        </div>
      </section>

      <section className="rv-v0-section">
        <SectionTitle
          eyebrow={
            <>
              <span className="lang-ar">{hp.galleryEyebrow}</span>
              <span className="lang-en">{hp.galleryEyebrowEn}</span>
            </>
          }
          title={
            <>
              <span className="lang-ar">نتائج وخطوات واضحة بالصورة</span>
              <span className="lang-en">{hp.galleryTitleEn}</span>
            </>
          }
          lead={
            <>
              <span className="lang-ar">
                مقارنات قبل وبعد تعرض الخدمة في سياقها الصحيح، مع صورة أكبر
                وتفاصيل مختصرة تساعدك على فهم طبيعة النتيجة.
              </span>
              <span className="lang-en">{hp.galleryDescriptionEn}</span>
            </>
          }
        />
        <div className="rv-v0-gallery-grid">
          {featuredGallery.map((item) => (
            <V0GalleryBeforeAfterCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="rv-v0-section rv-v0-testimonials-section">
        <SectionTitle
          eyebrow={
            <>
              <span className="lang-ar">تجارب المراجعين</span>
              <span className="lang-en">Guest feedback</span>
            </>
          }
          title={
            <>
              <span className="lang-ar">انطباعات موثوقة من الزيارة</span>
              <span className="lang-en">Recent notes</span>
            </>
          }
          lead={
            <>
              <span className="lang-ar">
                آراء مختصرة تعكس وضوح الاستشارة، تنظيم الحجز، والاهتمام
                بالمتابعة بعد الزيارة.
              </span>
              <span className="lang-en">
                Short, clear impressions about consultation quality, booking
                flow, and follow-up care.
              </span>
            </>
          }
        />

        <TestimonialsSplitCarousel items={testimonialItems} perRow={6} />
      </section>

      {doctorQuotes.length > 0 ? (
        <V0DoctorQuotesSlider
          homepage={settings.homepage}
          doctors={doctorQuotes}
        />
      ) : null}

      {featuredJournal.length > 0 ? (
        <section className="rv-v0-section rv-v0-home-journal-section">
          <SectionTitle
            eyebrow={
              <>
                <span className="lang-ar">من المجلة الطبية</span>
                <span className="lang-en">From the journal</span>
              </>
            }
            title={
              <>
                <span className="lang-ar">قراءات قصيرة قبل قرارك</span>
                <span className="lang-en">Short reads before you decide</span>
              </>
            }
            lead={
              <>
                <span className="lang-ar">
                  مقالات مختارة من لوحة التحكم تظهر بترتيب متجدد، وتساعدك على
                  فهم الخدمات والتوقعات قبل الحجز.
                </span>
                <span className="lang-en">
                  Selected CMS articles rotate on refresh and help explain
                  services, expectations, and next steps.
                </span>
              </>
            }
          />
          <V0JournalCarousel
            posts={featuredJournal}
            fallbackImage={settings.media.journalHero}
          />
        </section>
      ) : null}

      <V0ServicesStrip
        services={
          featuredServices.length > 0 ? featuredServices : serviceSource
        }
        eyebrow={
          <>
            <span className="lang-ar">{hp.stripEyebrow}</span>
            <span className="lang-en">{hp.stripEyebrowEn}</span>
          </>
        }
        title={
          <>
            <span className="lang-ar">{hp.stripTitle}</span>
            <span className="lang-en">{hp.stripTitleEn}</span>
          </>
        }
        description={
          <>
            <span className="lang-ar">{hp.stripDescription}</span>
            <span className="lang-en">{hp.stripDescriptionEn}</span>
          </>
        }
      />
    </main>
  );
}
