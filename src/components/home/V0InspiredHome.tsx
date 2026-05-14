import { ContentStatus } from "@prisma/client";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type {
  DeviceRecord,
  DoctorRecord,
  GalleryRecord,
  RuntimeSettings,
  ServiceRecord,
} from "@/lib/content-repository";

import { V0DoctorQuotesSlider } from "@/components/home/V0DoctorQuotesSlider";
import { V0DoctorsCarousel } from "@/components/home/V0DoctorsCarousel";
import { V0GalleryBeforeAfterCard } from "@/components/home/V0GalleryBeforeAfterCard";
import { V0ServicesStrip } from "@/components/home/V0ServicesStrip";
import { TestimonialsSplitCarousel, type TestimonialItem } from "@/components/home/TestimonialsSplitCarousel";

type V0InspiredHomeProps = {
  settings: RuntimeSettings;
  services: ServiceRecord[];
  doctors: DoctorRecord[];
  devices: DeviceRecord[];
  galleryItems: GalleryRecord[];
};

const fallbackTestimonialsBi: readonly TestimonialItem[] = [
  {
    quoteAr: "تجربة راقية من أول تواصل، والخطة كانت واضحة والنتيجة طبيعية جدًا.",
    quoteEn: "Refined bedside manner from hello — the roadmap made sense and the outcome still looks like me.",
    authorAr: "نورة",
    authorEn: "Noura",
  },
  {
    quoteAr: "أكثر ما أعجبني هو هدوء الشرح وعدم الاستعجال في اتخاذ القرار.",
    quoteEn: "They never rushed consent; explanations stayed calm even when questions piled up.",
    authorAr: "سارة",
    authorEn: "Sarah",
  },
  {
    quoteAr: "المكان منظم، والحجز والمتابعة بعد الجلسة كانا على مستوى عالٍ.",
    quoteEn: "Surgical cleanliness, painless scheduling, and proactive check-ins afterward.",
    authorAr: "ريم",
    authorEn: "Reem",
  },
  {
    quoteAr: "كل خطوة كانت مفهومة قبل البدء، وهذا منحني ثقة حقيقية.",
    quoteEn: "Every modality was unpacked before we touched settings — restored my trust instantly.",
    authorAr: "جود",
    authorEn: "Jood",
  },
  {
    quoteAr: "شرحٌ هادئ بلا ضغط، وتقييم مبني على معطيات الحالة فقط.",
    quoteEn: "Zero pressure theatrics — decisions tracked directly to anatomical truths.",
    authorAr: "هند",
    authorEn: "Hind",
  },
  {
    quoteAr: "قراءة الحالة بدقة قبل أي إجراء، وهذا ما يفرق هنا.",
    quoteEn: "They benchmarked physiology before prescribing devices — rare and appreciated.",
    authorAr: "لمى",
    authorEn: "Lama",
  },
  {
    quoteAr: "تفاصيل المتابعة بعد الجلسة جعلت التجربة أكثر اطمئنانًا.",
    quoteEn: "Post-op texts were clinician-written, not marketing bots.",
    authorAr: "أمل",
    authorEn: "Amal",
  },
  {
    quoteAr: "استقبال منظم، وفريق يعرف ما يقول قبل أن يقول.",
    quoteEn: "Front-of-house choreography matched medical rigor backstage.",
    authorAr: "غادة",
    authorEn: "Ghada",
  },
] as const;

const fallbackTrustItems = [
  {
    badgeAr: "و",
    badgeEn: "M",
    titleAr: "وزارة الصحة",
    titleEn: "Licensed oversight",
    bodyAr: "تشغيل طبي منظم ومتوافق مع الاشتراطات المعتمدة.",
    bodyEn: "Day-to-day operations aligned with published MOH frameworks.",
  },
  {
    badgeAr: "ب",
    badgeEn: "P",
    titleAr: "بروتوكولات معتمدة",
    titleEn: "Peer-reviewed pathways",
    bodyAr: "تقنيات عالمية ضمن تقييم دقيق للحالة.",
    bodyEn: "Global platforms deployed only after candidacy clears medical review.",
  },
  {
    badgeAr: "خ",
    badgeEn: "P",
    titleAr: "خصوصية سريرية",
    titleEn: "Clinical privacy",
    bodyAr: "رحلة علاجية هادئة وسرية في كل خطوة.",
    bodyEn: "Discreet choreography from intake through after-photos.",
  },
] as const;

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 12H5" strokeLinecap="round" />
      <path d="m12 19-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
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
}: V0InspiredHomeProps) {
  const publishedServices = services.filter((service) => service.status === ContentStatus.PUBLISHED);
  const publishedDoctors = doctors.filter((doctor) => doctor.status === ContentStatus.PUBLISHED);
  const publishedDevices = devices.filter((device) => device.status === ContentStatus.PUBLISHED);
  const serviceSource = publishedServices.length > 0 ? publishedServices : services;
  const doctorSource = publishedDoctors.length > 0 ? publishedDoctors : doctors;
  const deviceSource = publishedDevices.length > 0 ? publishedDevices : devices;
  const featuredServices = serviceSource.slice(0, 6);
  const featuredDoctors = doctorSource.slice(0, 8);
  const featuredDevices = deviceSource.slice(0, 6);
  const gallerySource = galleryItems.filter(
    (item) => item.beforeImageUrl.trim().length > 0 && item.afterImageUrl.trim().length > 0,
  );
  const featuredGallery = (gallerySource.length > 0 ? gallerySource : galleryItems)
    .filter((item) => item.beforeImageUrl.trim().length > 0 && item.afterImageUrl.trim().length > 0)
    .slice(0, 4);
  const heroImage =
    settings.media.homeHero ||
    featuredServices[0]?.coverImageUrl ||
    "/media/curated/service-skin-rejuvenation.jpg";

  const doctorQuotes = doctorSource.filter(
    (d) => d.status === ContentStatus.PUBLISHED && d.summary.trim().length > 0,
  );

  const trustItems = fallbackTrustItems;
  const hp = settings.homepage;

  return (
    <main className="rv-v0-home" dir="rtl">
      <section className="rv-v0-hero">
        <div className="rv-v0-dots" />
        <div className="rv-v0-hero-inner">
          <div className="rv-v0-hero-copy">
            <span className="rv-v0-pill rv-v0-pill-live">
              <span />
              <span className="lang-ar">{hp.heroPillLabel}</span>
              <span className="lang-en">{hp.heroPillLabelEn}</span>
              <SparkIcon />
            </span>
            <h1>
              <span className="lang-ar">
                {hp.heroTitle}
                <strong>{` ${hp.heroTitleAccent}`}</strong>
              </span>
              <span className="lang-en">
                {hp.heroTitleEn}
                <strong>{` ${hp.heroTitleAccentEn}`}</strong>
              </span>
            </h1>
            <p>
              <span className="lang-ar">{hp.heroDescription}</span>
              <span className="lang-en">{hp.heroDescriptionEn}</span>
            </p>
            <div className="rv-v0-hero-chips">
              {(
                [
                  {
                    ar: "أطباء واستشاريون معتمدون",
                    en: "Board-aware physicians & injectors",
                  },
                  { ar: "خطة علاجية مفهومة", en: "Readable treatment choreography" },
                  { ar: "متابعة واضحة عبر الفريق", en: "Warm handoffs across the podium" },
                ] as const
              ).map((item) => (
                <span key={item.ar}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                    <path d="m4 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="lang-ar">{item.ar}</span>
                  <span className="lang-en">{item.en}</span>
                </span>
              ))}
            </div>
            <div className="rv-v0-hero-actions">
              <Link href="/contact" className="rv-v0-primary focus-visible:ring-2 focus-visible:ring-[color:white] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(74,36,118,0.35)]">
                <span className="lang-ar">{hp.heroCtaPrimary}</span>
                <span className="lang-en">{hp.heroCtaPrimaryEn}</span>
                <ArrowIcon className="h-5 w-5" />
              </Link>
              <Link href="/gallery" className="rv-v0-secondary focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2">
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
            <div className="rv-v0-hero-card">
              <Image
                src={heroImage}
                alt={settings.brand.logoAlt}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover"
              />
            </div>
            <div className="rv-v0-float rv-v0-float-top">
              <b>500+</b>
              <span className="lang-ar">حجوزات هذا الشهر</span>
              <span className="lang-en">Bookings this month</span>
              <div>
                <i>أ</i>
                <i>س</i>
                <i>م</i>
              </div>
            </div>
            <div className="rv-v0-float rv-v0-moh">
              <span className="lang-ar">
                معتمد
                <br />
              </span>
              <span className="lang-en">
                Credentialed
                <br />
              </span>
              MOH
            </div>
            <div className="rv-v0-float rv-v0-rating">
              <b>4.9</b>
              <span className="lang-ar">تقييم المراجعين</span>
              <span className="lang-en">Review score</span>
              <small>★★★★★</small>
            </div>
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
              <span className="lang-ar">خدمات طبية بتجربة أوضح</span>
              <span className="lang-en">Medical programs with quieter storytelling</span>
            </>
          }
          lead={
            <>
              <span className="lang-ar">
                كل خدمة تُصف بنفس الأولويات السريرية المعتمدة داخل المركز، مع تناسق بين الصفحة والعيادة.
              </span>
              <span className="lang-en">
                Editorial order mirrors clinic triage priorities so expectation matches bedside reality.
              </span>
            </>
          }
        />
        <div className="rv-v0-services-grid">
          {featuredServices.map((service) => (
            <Link key={service.id} href={(`/services/${service.slug}`) as Route} className="rv-v0-service-card">
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
      </section>

      <section className="rv-v0-section rv-v0-trust-section">
        <SectionTitle
          eyebrow={
            <>
              <span className="lang-ar">{hp.trustEyebrow}</span>
              <span className="lang-en">{hp.trustEyebrowEn}</span>
            </>
          }
          title={
            <>
              <span className="lang-ar">{hp.trustTitle}</span>
              <span className="lang-en">{hp.trustTitleEn}</span>
            </>
          }
          lead={
            <>
              <span className="lang-ar">{hp.trustDescription}</span>
              <span className="lang-en">{hp.trustDescriptionEn}</span>
            </>
          }
        />
        <div className="rv-v0-trust-grid">
          {trustItems.map((card) => (
            <article key={card.titleAr} className="rv-v0-trust-card">
              <span>
                <span className="lang-ar">{card.badgeAr}</span>
                <span className="lang-en">{card.badgeEn}</span>
              </span>
              <h3>
                <span className="lang-ar">{card.titleAr}</span>
                <span className="lang-en">{card.titleEn}</span>
              </h3>
              <p>
                <span className="lang-ar">{card.bodyAr}</span>
                <span className="lang-en">{card.bodyEn}</span>
              </p>
            </article>
          ))}
          <article className="rv-v0-trust-card">
            <span>
              <span className="lang-ar">م</span>
              <span className="lang-en">C</span>
            </span>
            <h3>
              <span className="lang-ar">متابعة واضحة</span>
              <span className="lang-en">Operational clarity</span>
            </h3>
            <p>
              <span className="lang-ar">{`زمن الاستجابة المتوقع ${settings.ops.sla}`}</span>
              <span className="lang-en">{`Target response window ${settings.ops.sla}`}</span>
            </p>
          </article>
        </div>
        <div className="rv-v0-partners">
          {["Allergan", "Galderma", "Merz", "Candela", "Lumenis", "Cynosure"].map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
        <div className="rv-v0-wide-stats">
          <div>
            <b>98%</b>
            <span className="lang-ar">رضا</span>
            <span className="lang-en">Satisfaction</span>
          </div>
          <div>
            <b>15,000+</b>
            <span className="lang-ar">عميلة</span>
            <span className="lang-en">Guests served</span>
          </div>
          <div>
            <b>50+</b>
            <span className="lang-ar">تقنية</span>
            <span className="lang-en">Modalities</span>
          </div>
          <div>
            <b>25+</b>
            <span className="lang-ar">طبيبة وطبيب</span>
            <span className="lang-en">Clinicians</span>
          </div>
          <div>
            <b>10+</b>
            <span className="lang-ar">سنوات</span>
            <span className="lang-en">Years</span>
          </div>
        </div>
      </section>

      <V0DoctorsCarousel doctors={featuredDoctors} />

      <section className="rv-v0-section">
        <SectionTitle
          eyebrow={
            <>
              <span className="lang-ar">أجهزتنا المتطورة</span>
              <span className="lang-en">Precision hardware</span>
            </>
          }
          title={
            <>
              <span className="lang-ar">تقنيات حديثة ضمن خطة مناسبة</span>
              <span className="lang-en">Modern energy platforms, responsibly slotted into plans</span>
            </>
          }
          lead={
            <>
              <span className="lang-ar">
                تعرض هذه البطاقات الأجهزة المعتمدة داخل المركز مع شهاداتها لمساعدتك على فهم دور كل تقنية قبل الالتزام.
              </span>
              <span className="lang-en">
                Credentials stay visible beside every platform so curiosity never outpaces evidence.
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
              <span className="lang-ar">{hp.galleryTitle}</span>
              <span className="lang-en">{hp.galleryTitleEn}</span>
            </>
          }
          lead={
            <>
              <span className="lang-ar">{hp.galleryDescription}</span>
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
              <span className="lang-ar">ماذا تقول عميلاتنا</span>
              <span className="lang-en">What guests remember</span>
            </>
          }
          title={
            <>
              <span className="lang-ar">تجارب حقيقية بلغة أوضح</span>
              <span className="lang-en">Plain-language testimonials</span>
            </>
          }
          lead={
            <>
              <span className="lang-ar">إشارات مختصرة عن التنسيق قبل الجلسة، أثناءها، وبعدها.</span>
              <span className="lang-en">Micro-stories anchored to pre-, intra-, and post-visit choreography.</span>
            </>
          }
        />
        <div className="rv-v0-testimonials">
          {fallbackTestimonialsBi.slice(0, 4).map((row) => (
            <article key={row.authorAr} className="rv-v0-testimonial">
              <b>”</b>
              <div className="rv-v0-stars" aria-hidden>
                ★★★★★
              </div>
              <p>
                <span className="lang-ar">{row.quoteAr}</span>
                <span className="lang-en">{row.quoteEn}</span>
              </p>
              <strong>
                <span className="lang-ar">{row.authorAr}</span>
                <span className="lang-en">{row.authorEn}</span>
              </strong>
            </article>
          ))}
        </div>

        <TestimonialsSplitCarousel items={fallbackTestimonialsBi} perRow={6} />
        <div className="rv-v0-wide-stats rv-v0-review-stats">
          <div>
            <b>4.9</b>
            <span className="lang-ar">تقييم</span>
            <span className="lang-en">Score</span>
          </div>
          <div>
            <b>15,000+</b>
            <span className="lang-ar">عميلة</span>
            <span className="lang-en">Guests</span>
          </div>
          <div>
            <b>98%</b>
            <span className="lang-ar">رضا</span>
            <span className="lang-en">Relief</span>
          </div>
          <div>
            <b>5,000+</b>
            <span className="lang-ar">استشارة</span>
            <span className="lang-en">Consults</span>
          </div>
        </div>
      </section>

      {doctorQuotes.length > 0 ? (
        <V0DoctorQuotesSlider homepage={settings.homepage} doctors={doctorQuotes} />
      ) : null}

      <V0ServicesStrip
        services={featuredServices.length > 0 ? featuredServices : serviceSource}
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
