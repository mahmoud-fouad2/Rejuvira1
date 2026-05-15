import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getRuntimeSettings } from "@/lib/content-repository";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ page: "about", path: "/about" });
}

const coreValues = [
  {
    eyebrow: "الوضوح",
    eyebrowEn: "Clarity",
    title: "وضوح لا غموض",
    titleEn: "Clarity without confusion",
    description:
      "كل استشارة تبدأ بفهم حقيقي للحالة. لا وعود مبالغ فيها، لا مصطلحات تربك الزائر، فقط معلومة دقيقة ومسار واضح.",
    descriptionEn:
      "Every consultation begins with real understanding. No inflated promises, no confusing jargon, only precise information and a clear path.",
  },
  {
    eyebrow: "الثقة",
    eyebrowEn: "Trust",
    title: "ثقة مكتسبة يوماً بيوم",
    titleEn: "Trust earned every day",
    description:
      "الثقة هنا مبنية على شرح واضح، توقعات واقعية، ومتابعة مستمرة بعد الإجراء عند الحاجة.",
    descriptionEn:
      "Trust is built on clear explanation, realistic expectations, and follow-up when needed.",
  },
  {
    eyebrow: "التنظيم",
    eyebrowEn: "Organization",
    title: "تنظيم في كل خطوة",
    titleEn: "Organized at every step",
    description:
      "من طريقة عرض الخدمة إلى التواصل بعد الحجز، كل عنصر مصمم ليكون مباشرًا وسهل الفهم.",
    descriptionEn:
      "From service presentation to post-booking contact, every element is designed to be direct and easy to understand.",
  },
  {
    eyebrow: "النتائج",
    eyebrowEn: "Results",
    title: "نتائج طبيعية ومستدامة",
    titleEn: "Natural, lasting results",
    description:
      "لا نؤمن بالحلول السريعة التي تطغى على الملامح. غايتنا تحسين خفيف، متزن، يُحافظ على شخصيتك الجمالية.",
    descriptionEn:
      "We focus on balanced enhancement that respects your natural features and aesthetic identity.",
  },
] as const;

const milestones = [
  { year: "2018", label: "تأسيس المركز بأول عيادة متخصصة في الرياض", labelEn: "Center founded with the first specialized clinic in Riyadh" },
  { year: "2020", label: "توسع الفريق الطبي وإضافة خدمات الليزر المتقدمة", labelEn: "Medical team expanded and advanced laser services added" },
  {
    year: "2022",
    label: "إطلاق قسم الاستشارات الإلكترونية ومتابعة ما بعد الجلسة",
    labelEn: "Digital consultations and post-session follow-up launched",
  },
  { year: "2024", label: "إعادة تصميم التجربة الكاملة وإطلاق الهوية الجديدة", labelEn: "Full experience redesigned and new identity launched" },
] as const;

export default async function AboutPage() {
  const runtimeSettings = await getRuntimeSettings();

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-28 px-6 pt-16 pb-32 lg:px-10">
        {/* ════════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft"><span className="lang-ar">من نحن</span><span className="lang-en">About Us</span></p>
            <h1 className="balanced-text text-ink-strong mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em] lg:text-6xl">
              <span className="lang-ar">مركز طبي متكامل يقدّم خدمات التجميل الطبي، العناية بالبشرة، والجسم — بمنهج واضح ومبني على التشخيص الدقيق.</span>
              <span className="lang-en">A full-service medical aesthetic center offering cosmetic treatments, skin care, and body care — built on precise diagnosis and personalized planning.</span>
            </h1>
            <p className="text-ink-soft mt-6 text-lg leading-8">
              <span className="lang-ar">يشرح الفريق الطبي الخدمة والإجراء ويحدد الخطة المناسبة قبل البدء، حتى يكون قرارك مبنياً على معلومة واضحة لا على انطباع أولي.</span>
              <span className="lang-en">The center focuses on explaining the service, the procedure, and the right plan for each case before starting, so decisions are based on clarity rather than impulse.</span>
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium"><span className="lang-ar">خبرة طبية</span><span className="lang-en">Medical expertise</span></p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  <span className="lang-ar">تشخيص أدق وخطط أكثر ملاءمة لكل حالة</span>
                  <span className="lang-en">Sharper diagnosis and better-fit plans for each case</span>
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium"><span className="lang-ar">عرض منظم</span><span className="lang-en">Organized presentation</span></p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  <span className="lang-ar">معلومات أوضح تقلل التردد قبل الاستشارة</span>
                  <span className="lang-en">Clearer information before consultation</span>
                </p>
              </div>
            </div>
          </article>
          <div className="surface-panel relative min-h-[38rem] overflow-hidden rounded-[2.5rem] shadow-sm">
            <Image
              src={runtimeSettings.media.aboutHero}
              alt="Rejuvira Center Aesthetic"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
              priority
            />
            <div className="from-ink-strong/40 absolute inset-0 bg-gradient-to-t to-transparent mix-blend-multiply" />
          </div>
        </section>

        {/* ════════════════════════════════════════
            VISION + MISSION
        ════════════════════════════════════════ */}
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 lg:p-12">
            <p className="eyebrow text-ink-soft"><span className="lang-ar">الرؤية</span><span className="lang-en">Vision</span></p>
            <h2 className="balanced-text text-ink-strong mt-4 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
              <span className="lang-ar">رؤيتنا: تقديم رعاية واضحة تقود إلى قرار علاجي أدق.</span>
              <span className="lang-en">Our vision: clear care that leads to better treatment decisions.</span>
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              <span className="lang-ar">نسعى إلى أن يكون المركز وجهة موثوقة لخدمات التجميل الطبي والعناية بالبشرة والجسم، مع محتوى يشرح الخيارات بوضوح دون مبالغة.</span>
              <span className="lang-en">We aim to be a trusted destination for medical aesthetics, skin care, and body care with clear explanations and no overstatement.</span>
            </p>
          </article>
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 lg:p-12">
            <p className="eyebrow text-ink-soft"><span className="lang-ar">الرسالة</span><span className="lang-en">Mission</span></p>
            <h2 className="balanced-text text-ink-strong mt-4 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
              <span className="lang-ar">مهمتنا: رعاية حقيقية لا تكتفي بالمظهر.</span>
              <span className="lang-en">Our mission: real care beyond appearance.</span>
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              <span className="lang-ar">تقديم خطط علاجية مدروسة تأخذ بعين الاعتبار طبيعة كل حالة، والاستمرار في المتابعة حتى نكون شركاء حقيقيين في رحلة الاهتمام بالبشرة والمظهر العام.</span>
              <span className="lang-en">We provide thoughtful treatment plans tailored to each case and continue follow-up as a true partner in skin and aesthetic care.</span>
            </p>
          </article>
        </section>

        {/* ════════════════════════════════════════
            CORE VALUES
        ════════════════════════════════════════ */}
        <section>
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow"><span className="lang-ar">القيم الأساسية</span><span className="lang-en">Core Values</span></p>
            <h2 className="balanced-text text-ink-strong mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              <span className="lang-ar">قيم تبني ثقة مستدامة مع كل مراجع.</span>
              <span className="lang-en">Values that build lasting trust with every patient.</span>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {coreValues.map((value) => (
              <article
                key={value.eyebrow}
                className="surface-panel rounded-[2rem] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(74,36,118,0.1)]"
              >
                <p className="eyebrow"><span className="lang-ar">{value.eyebrow}</span><span className="lang-en">{value.eyebrowEn}</span></p>
                <h3 className="text-ink-strong mt-5 font-serif text-2xl tracking-[-0.02em]">
                  <span className="lang-ar">{value.title}</span>
                  <span className="lang-en">{value.titleEn}</span>
                </h3>
                <p className="text-ink-soft mt-4 text-sm leading-8">
                  <span className="lang-ar">{value.description}</span>
                  <span className="lang-en">{value.descriptionEn}</span>
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            TIMELINE
        ════════════════════════════════════════ */}
        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="flex flex-col justify-center">
            <p className="eyebrow"><span className="lang-ar">مسيرة المركز</span><span className="lang-en">Our Journey</span></p>
            <h2 className="balanced-text text-ink-strong mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              <span className="lang-ar">محطات أسهمت في تشكيل هوية المركز.</span>
              <span className="lang-en">Milestones that shaped the center's identity.</span>
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              <span className="lang-ar">منذ الافتتاح الأول، كان التركيز دائمًا على بناء تجربة لا تنتهي عند الجلسة، بل تمتد إلى ما بعدها في كل اتصال ومتابعة.</span>
              <span className="lang-en">From day one, the focus has been on an experience that continues beyond the session through every follow-up.</span>
            </p>
          </div>
          <div className="space-y-4">
            {milestones.map((m) => (
              <div
                key={m.year}
                className="surface-panel flex items-start gap-6 rounded-[2rem] px-8 py-6 shadow-sm"
              >
                <span className="text-gold font-serif text-3xl tracking-[-0.02em]">
                  {m.year}
                </span>
                <p className="text-ink-strong text-base leading-8"><span className="lang-ar">{m.label}</span><span className="lang-en">{m.labelEn}</span></p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            TEAM INTRO
        ════════════════════════════════════════ */}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="surface-panel overflow-hidden rounded-[2.5rem] shadow-sm">
            <div className="relative h-80">
              <Image
                src="/media/curated/doctor-team.jpg"
                alt="إجراء مرتبط بالتخصصات الطبية"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
              <div className="from-ink-strong/60 absolute inset-0 bg-gradient-to-t to-transparent mix-blend-multiply" />
            </div>
            <div className="p-8 lg:p-10">
              <p className="eyebrow"><span className="lang-ar">الفريق الطبي</span><span className="lang-en">Medical Team</span></p>
              <h2 className="balanced-text text-ink-strong mt-4 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
                <span className="lang-ar">فريق طبي يؤمن بأن النتيجة الجيدة تبدأ بإنصات دقيق وتشخيص متزن.</span>
                <span className="lang-en">A medical team that believes strong results begin with careful listening and balanced diagnosis.</span>
              </h2>
              <p className="text-ink-soft mt-5 text-base leading-8">
                <span className="lang-ar">تعرض ملفات الأطباء التخصص، الخبرة، والخدمات المرتبطة بكل طبيب بصورة مختصرة تساعد على الاختيار الواعي.</span>
                <span className="lang-en">Doctor profiles present specialty, experience, and related services in a concise format that supports informed selection.</span>
              </p>
              <Link href="/doctors" className="btn-primary mt-8">
                <span className="lang-ar">تعرّف على الفريق الطبي</span>
                <span className="lang-en">Meet the Medical Team</span>
              </Link>
            </div>
          </article>
          <div className="surface-panel relative overflow-hidden rounded-[2.5rem] shadow-sm">
            <Image
              src={runtimeSettings.media.brandLogo}
              alt={runtimeSettings.brand.logoAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="bg-surface-strong object-contain p-10"
            />
            <div className="from-ink-strong/70 via-ink-strong/20 absolute inset-0 bg-gradient-to-t to-transparent mix-blend-multiply" />
            <div className="relative flex h-full flex-col justify-end p-8 lg:p-10">
              <p className="eyebrow text-white/80"><span className="lang-ar">هوية المركز</span><span className="lang-en">Brand Identity</span></p>
              <p className="mt-4 font-serif text-4xl leading-snug tracking-[-0.02em] text-white">
                <span className="lang-ar">هوية بصرية متسقة ترتبط فعليًا بالخدمة والعلامة وتجربة المراجع.</span>
                <span className="lang-en">A consistent visual identity tied directly to the service, the brand, and the patient journey.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            CTA
        ════════════════════════════════════════ */}
        <section className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-14">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow"><span className="lang-ar">ابدئي من هنا</span><span className="lang-en">Start Here</span></p>
              <h2 className="balanced-text text-ink-strong mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
                <span className="lang-ar">جاهزة للخطوة الأولى؟ نبدأ بمحادثة واضحة ومباشرة.</span>
                <span className="lang-en">Ready for the first step? We begin with a clear, direct conversation.</span>
              </h2>
              <p className="text-ink-soft mt-5 text-base leading-8">
                <span className="lang-ar">سواء كان المطلوب تجديد البشرة أو استشارة متخصصة، ستجد هنا مسارًا واضحًا يبدأ من الخدمة وينتهي بطلب الاستشارة.</span>
                <span className="lang-en">Whether you need skin rejuvenation or a specialist consultation, you will find a clear path from service discovery to consultation request.</span>
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:items-end">
              <Link href="/contact" className="btn-primary">
                <span className="lang-ar">احجزي استشارتك</span>
                <span className="lang-en">Book Your Consultation</span>
              </Link>
              <Link href="/services" className="btn-secondary">
                <span className="lang-ar">استعرضي الخدمات</span>
                <span className="lang-en">Browse Services</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
