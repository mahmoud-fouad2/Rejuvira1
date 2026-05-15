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
    title: "وضوح لا غموض",
    description:
      "كل استشارة تبدأ بفهم حقيقي للحالة. لا وعود مبالغ فيها، لا مصطلحات تربك الزائر، فقط معلومة دقيقة ومسار واضح.",
  },
  {
    eyebrow: "الثقة",
    title: "ثقة مكتسبة يوماً بيوم",
    description:
      "الثقة هنا مبنية على شرح واضح، توقعات واقعية، ومتابعة مستمرة بعد الإجراء عند الحاجة.",
  },
  {
    eyebrow: "التنظيم",
    title: "تنظيم في كل خطوة",
    description:
      "من طريقة عرض الخدمة إلى التواصل بعد الحجز، كل عنصر مصمم ليكون مباشرًا وسهل الفهم.",
  },
  {
    eyebrow: "النتائج",
    title: "نتائج طبيعية ومستدامة",
    description:
      "لا نؤمن بالحلول السريعة التي تطغى على الملامح. غايتنا تحسين خفيف، متزن، يُحافظ على شخصيتك الجمالية.",
  },
] as const;

const milestones = [
  { year: "2018", label: "تأسيس المركز بأول عيادة متخصصة في الرياض" },
  { year: "2020", label: "توسع الفريق الطبي وإضافة خدمات الليزر المتقدمة" },
  {
    year: "2022",
    label: "إطلاق قسم الاستشارات الإلكترونية ومتابعة ما بعد الجلسة",
  },
  { year: "2024", label: "إعادة تصميم التجربة الكاملة وإطلاق الهوية الجديدة" },
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
              <span className="lang-ar">مركز يقدّم الرعاية الجلدية والتجميلية بمنهج واضح، منظم، ومبني على التشخيص.</span>
              <span className="lang-en">A center delivering dermatology and medical aesthetics through a clear, organized, diagnosis-led approach.</span>
            </h1>
            <p className="text-ink-soft mt-6 text-lg leading-8">
              <span className="lang-ar">يركّز المركز على شرح الخدمة والإجراء وتحديد الخطة الأنسب لكل حالة قبل البدء، بحيث يُبنى القرار على فهم واضح لا على انطباع سريع.</span>
              <span className="lang-en">The center focuses on explaining the service, the procedure, and the right plan for each case before starting, so decisions are based on clarity rather than impulse.</span>
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">خبرة طبية</p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  تشخيص أدق وخطط أكثر ملاءمة لكل حالة
                </p>
              </div>
              <div className="surface-panel rounded-[1.8rem] p-6 shadow-sm">
                <p className="text-ink-soft text-sm font-medium">عرض منظم</p>
                <p className="text-ink-strong mt-2 font-serif text-lg tracking-[-0.01em]">
                  معلومات أوضح تقلل التردد قبل الاستشارة
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
            <p className="eyebrow text-ink-soft">الرؤية</p>
            <h2 className="balanced-text text-ink-strong mt-4 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
              رؤيتنا: تقديم رعاية واضحة تقود إلى قرار علاجي أدق.
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              نسعى إلى أن يكون المركز مرجعًا واضحًا للخدمات الجلدية والتجميلية
              غير الجراحية، مع محتوى يشرح الخيارات المتاحة دون مبالغة.
            </p>
          </article>
          <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 lg:p-12">
            <p className="eyebrow text-ink-soft">الرسالة</p>
            <h2 className="balanced-text text-ink-strong mt-4 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
              مهمتنا: رعاية حقيقية لا تكتفي بالمظهر.
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              تقديم خطط علاجية مدروسة تأخذ بعين الاعتبار طبيعة كل حالة،
              والاستمرار في المتابعة حتى نكون شركاء حقيقيين في رحلة الاهتمام
              بالبشرة والمظهر العام.
            </p>
          </article>
        </section>

        {/* ════════════════════════════════════════
            CORE VALUES
        ════════════════════════════════════════ */}
        <section>
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow">القيم الأساسية</p>
            <h2 className="balanced-text text-ink-strong mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              قيم تبني ثقة مستدامة مع كل مراجع.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {coreValues.map((value) => (
              <article
                key={value.eyebrow}
                className="surface-panel rounded-[2rem] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(74,36,118,0.1)]"
              >
                <p className="eyebrow">{value.eyebrow}</p>
                <h3 className="text-ink-strong mt-5 font-serif text-2xl tracking-[-0.02em]">
                  {value.title}
                </h3>
                <p className="text-ink-soft mt-4 text-sm leading-8">
                  {value.description}
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
            <p className="eyebrow">مسيرة المركز</p>
            <h2 className="balanced-text text-ink-strong mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              محطات أسهمت في تشكيل هوية المركز.
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              منذ الافتتاح الأول، كان التركيز دائمًا على بناء تجربة لا تنتهي عند
              الجلسة، بل تمتد إلى ما بعدها في كل اتصال ومتابعة.
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
                <p className="text-ink-strong text-base leading-8">{m.label}</p>
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
                src="/media/curated/service-prp.jpg"
                alt="إجراء مرتبط بالتخصصات الطبية"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
              <div className="from-ink-strong/60 absolute inset-0 bg-gradient-to-t to-transparent mix-blend-multiply" />
            </div>
            <div className="p-8 lg:p-10">
              <p className="eyebrow">الفريق الطبي</p>
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
