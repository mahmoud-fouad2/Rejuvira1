import Image from "next/image";
import Link from "next/link";

import { getRuntimeSettings, getServices, getDoctors } from "@/lib/content-repository";
import { CinematicIntro } from "@/components/home/CinematicIntro";
import { HomeShowcaseDeck } from "@/components/home/HomeShowcaseDeck";
import { DoctorQuotesRail } from "@/components/home/DoctorQuotesRail";
import { GalleryNarrativeRotator } from "@/components/home/GalleryNarrativeRotator";

export default async function HomePage() {
  const settings = await getRuntimeSettings();
  const services = await getServices();
  const doctors = await getDoctors();

  const heroImage = settings.media.homeHero ?? "/media/curated/service-skin-rejuvenation.jpg";

  /* Build showcase slides from services */
  const showcaseSlides = services.slice(0, 4).map((s) => ({
    id: s.id,
    eyebrow: s.category,
    title: s.name,
    description: s.excerpt,
    image: s.coverImageUrl,
    href: `/services/${s.slug}`,
    cta: "تفاصيل الخدمة",
    meta: `${s.benefits.length} فوائد رئيسية`,
  }));

  /* Build doctor quote cards from doctors */
  const doctorQuoteCards = doctors.slice(0, 4).map((d) => ({
    id: d.id,
    name: d.name,
    title: d.title,
    quote: d.summary,
    photoUrl: d.photoUrl,
    yearsExperience: d.yearsExperience,
    slug: d.slug,
  }));

  const galleryItems = settings.homepage.galleryItems;
  const servicesImage = settings.media.servicesHero ?? "/media/curated/service-laser-hair-removal.jpg";
  const resultsImage = settings.media.aboutHero ?? "/media/curated/device-emface.jpg";

  return (
    <div className="min-h-screen bg-canvas text-ink-strong font-sans rtl">
      {/* Cinematic brand intro — controlled by runtime settings */}
      <CinematicIntro
        logoSrc={settings.media.brandLogo}
        logoAlt={settings.brand.logoAlt}
        brandName={settings.brand.siteName}
        skinTextureSrc={servicesImage}
        clientImageSrc={resultsImage}
      />

      <main className="section-shell animate-fade-in pt-6">
        {/* ═══════════════════════════════════════
            HERO SECTION — dynamic from CMS
        ═══════════════════════════════════════ */}
        <section className="relative min-h-[90vh] overflow-hidden rounded-[3rem] bg-ink-strong">
          <Image
            src={heroImage}
            alt={settings.brand.siteName}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(179,155,117,0.12),transparent_50%)]" />

          <div className="absolute inset-0 z-10 flex items-end lg:items-center">
            <div className="w-full px-6 py-12 lg:px-12 lg:py-16">
              <div className="max-w-2xl">
                <p className="animate-fade-in-up text-[0.68rem] uppercase tracking-[0.42em] text-gold-light/70">
                  {settings.brand.siteName}
                </p>
                <h1 className="animate-fade-in-up stagger-1 mt-6 font-serif text-5xl font-light leading-[0.98] tracking-[-0.03em] text-cream sm:text-6xl lg:text-7xl">
                  {settings.homepage.heroTitle}
                </h1>
                <p className="animate-fade-in-up stagger-2 mt-8 max-w-xl text-lg leading-9 text-beige/80">
                  {settings.homepage.heroDescription}
                </p>
                <div className="animate-fade-in-up stagger-3 mt-12 flex flex-wrap gap-4">
                  <Link href="/contact" className="btn-primary">
                    {settings.contact.phone ? "احجز استشارتك المجانية" : "تواصل معنا"}
                  </Link>
                  <Link href="#approach" className="btn-secondary">
                    اكتشفي المنهج
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 animate-float lg:block">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] tracking-[0.3em] text-white/40 uppercase">اسفل</span>
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="text-white/30">
                <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="2" fill="currentColor" className="animate-pulse" />
              </svg>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            STATS STRIP — dynamic from CMS data
        ═══════════════════════════════════════ */}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "خدمات متخصصة", value: services.length, icon: "✦" },
            { label: "أطباء معتمدون", value: doctors.length, icon: "◈" },
            { label: "نتائج موثقة", value: doctors.reduce((sum, d) => sum + d.yearsExperience, 0), icon: "◆", suffix: "+ سنة خبرة" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="surface-panel flex items-center gap-6 rounded-[2rem] p-6 lg:p-8 animate-fade-in-up"
              style={{ animationDelay: `${100 * i}ms` }}
            >
              <span className="font-serif text-3xl text-gold">{stat.icon}</span>
              <div>
                <p className="font-serif text-4xl font-semibold tracking-[-0.03em] text-ink">
                  {stat.value}
                  <span className="text-gold text-2xl">+</span>
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {stat.label}
                  {"suffix" in stat && <span className="block text-[10px] text-ink-faint">{(stat as any).suffix}</span>}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ═══════════════════════════════════════
            APPROACH — Brand narrative from CMS
        ═══════════════════════════════════════ */}
        <section id="approach" className="scroll-mt-28">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="surface-panel overflow-hidden rounded-[2.8rem] p-4">
              <div className="relative min-h-[28rem] overflow-hidden rounded-[2.4rem]">
                <Image
                  src={servicesImage}
                  alt="Rejuvira clinical services"
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>
            <div className="flex flex-col gap-6 p-4 lg:p-8">
              <p className="eyebrow">من المنهجية</p>
              <h2 className="balanced-text font-serif text-4xl font-light leading-tight sm:text-5xl text-ink">
                استجابة طبية لبناء نسخة أقوى وأكثر وعيًا من جمالك.
              </h2>
              <div className="h-px w-20 bg-gold" />
              <p className="text-lg leading-9 text-ink-soft">
                نهجنا يدمج بساطة الشكل مع انضباط الرعاية الطبية. كل خطوة تُخطط بعناية، وكل نتيجة تُراعى لتبدو مقاربة لذاتكِ الطبيعية.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            HOW IT WORKS — 3-step journey
        ═══════════════════════════════════════ */}
        <section>
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow">رحلة الاستشارة</p>
            <h2 className="balanced-text mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em] text-ink">
              من أول قراءة إلى أول استشارة بخطوات واضحة.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "استشارة أولى أكثر وضوحًا",
                desc: "تبدأ الرحلة بتقييم واضح للاحتياج والحالة، ثم تحديد الأولوية العلاجية المناسبة.",
                color: "var(--violet)",
              },
              {
                step: "02",
                title: "اختيار هادئ للخطة الأنسب",
                desc: "تُعرض الخيارات بصورة منظمة توضح الغرض من الخدمة، نطاقها، وما يمكن توقعه منها.",
                color: "var(--gold)",
              },
              {
                step: "03",
                title: "خطوة نهائية واضحة قبل الحجز",
                desc: "بعد فهم الخدمة المناسبة، يصبح الانتقال إلى طلب الاستشارة مباشرًا وواضحًا دون تشتت.",
                color: "var(--emerald)",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="surface-panel rounded-[2rem] p-8 animate-fade-in-up"
                style={{ animationDelay: `${150 * i}ms` }}
              >
                <span
                  className="font-serif text-5xl font-light tracking-[-0.05em]"
                  style={{ color: item.color }}
                >
                  {item.step}
                </span>
                <h3 className="mt-4 font-serif text-2xl leading-snug tracking-[-0.02em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-ink-soft">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SERVICES SHOWCASE DECK (dynamic from CMS)
        ═══════════════════════════════════════ */}
        {showcaseSlides.length > 0 && (
          <section>
            <div className="mb-8">
              <p className="eyebrow">الخدمات الرئيسية</p>
              <h2 className="balanced-text mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em] text-ink">
                خدمات طبية متقدمة تحت إشراف أطباء متخصصين.
              </h2>
            </div>
            <HomeShowcaseDeck slides={showcaseSlides} />
          </section>
        )}

        {/* ═══════════════════════════════════════
            DOCTORS QUOTES RAIL (dynamic from CMS)
        ═══════════════════════════════════════ */}
        {doctorQuoteCards.length > 0 && (
          <DoctorQuotesRail
            eyebrow="الفريق الطبي"
            title="أطباء متخصصون بخبرة موثقة"
            description="ملفات طبية واضحة تعرّف بالأطباء وخبراتهم ومجالات الرعاية المرتبطة بهم."
            doctors={doctorQuoteCards}
          />
        )}

        {/* ═══════════════════════════════════════
            GALLERY NARRATIVE (dynamic from CMS)
        ═══════════════════════════════════════ */}
        {galleryItems.length > 0 && (
          <GalleryNarrativeRotator
            eyebrow={settings.homepage.galleryEyebrow}
            title={settings.homepage.galleryTitle}
            description={settings.homepage.galleryDescription}
            items={galleryItems}
          />
        )}

        {/* ═══════════════════════════════════════
            EXPERIENCE SECTION
        ═══════════════════════════════════════ */}
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <p className="eyebrow">التجربة</p>
            <h2 className="balanced-text font-serif text-4xl font-light leading-tight sm:text-5xl text-ink">
              مساحة آمنة لنتائج هادئة وواضحة.
            </h2>
            <p className="text-lg leading-9 text-ink-soft">
              تجربة ريفيويرا ليست معدة للتفاخر، بل للتوازن. نقدم لكِ إجراءات دقيقة داخل بيئة فاخرة تبث الشعور بالراحة دون أن تفرض أي مبالغة.
            </p>
            <div className="surface-panel rounded-[2rem] p-8">
              <p className="eyebrow">النتائج</p>
              <p className="mt-4 text-2xl font-semibold leading-tight text-ink">
                خطوط أنعم، توازن أجمل، وإطلالة تبعث الشعور بالراحة.
              </p>
            </div>
          </div>
          <div className="surface-panel overflow-hidden rounded-[2.8rem] p-4">
            <div className="relative min-h-[28rem] overflow-hidden rounded-[2.4rem]">
              <Image
                src={resultsImage}
                alt="Rejuvira refined results"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CTA — Dark commitment from CMS data
        ═══════════════════════════════════════ */}
        <section className="surface-panel overflow-hidden rounded-[3rem] border-0 bg-ink-strong p-0">
          <div className="relative px-8 py-16 text-center lg:px-16 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(179,155,117,0.06),transparent_60%)]" />
            <div className="relative z-10 mx-auto max-w-3xl">
              <p className="text-[0.7rem] uppercase tracking-[0.42em] text-gold-light/60">
                التزامنا
              </p>
              <h2 className="mt-6 font-serif text-4xl font-light leading-tight text-cream sm:text-5xl">
                كل زيارة تبنى حول راحتك وثقتك.
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-beige/70">
                تفتح ريفيويرا الباب لتقنية طبية راقية، تُقدَّم بهدوء ومهنية، حتى يكون الشعور بسيطًا والجودة واضحة.
              </p>
              <Link
                href="/contact"
                className="btn-primary mt-12 inline-flex"
              >
                احجز استشارتك الآن
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
