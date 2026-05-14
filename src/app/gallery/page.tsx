import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getGalleryItems, getMediaSelections } from "@/lib/content-repository";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ page: "gallery", path: "/gallery" });
}

const localMoodImages = [
  "/media/curated/service-skin-rejuvenation.jpg",
  "/media/curated/service-prp.jpg",
  "/media/curated/service-laser-hair-removal.jpg",
  "/media/curated/device-emface.jpg",
  "/media/curated/device-laser-platform.png",
  "/media/curated/service-injectables.png",
];

export default async function GalleryPage() {
  const items = await getGalleryItems();
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />

      <main className="section-shell flex flex-col gap-20 pt-8 pb-24">
        {/* ── PAGE HERO ──────────────────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <article className="surface-panel flex flex-col justify-between rounded-[2.75rem] p-8 lg:p-12">
            <div>
              <p className="eyebrow">
                <span className="lang-ar">معرض النتائج</span>
                <span className="lang-en">Results Gallery</span>
              </p>
              <h1 className="balanced-text text-ink mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em] lg:text-6xl">
                <span className="lang-ar">نتائج حقيقية تعكس الدقة والاهتمام بكل تفصيلة.</span>
                <span className="lang-en">Real results reflecting precision and attention to every detail.</span>
              </h1>
              <p className="text-ink-soft mt-5 max-w-xl text-base leading-8">
                <span className="lang-ar">هذا القسم يجمع مرجعًا بصريًا صادقًا لما يمكن تحقيقه. مقارنات قبل وبعد تُظهر النتيجة الفعلية دون مبالغة، لأن الثقة تُبنى بالوضوح لا بالإبهار.</span>
                <span className="lang-en">This section gathers an honest visual reference for what can be achieved. Before and after comparisons show real results without exaggeration, because trust is built on clarity, not spectacle.</span>
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="border-line bg-surface rounded-[1.6rem] border px-5 py-4">
                <p className="text-ink-soft text-sm">
                  <span className="lang-ar">حالات موثقة</span><span className="lang-en">Documented Cases</span>
                </p>
                <p className="text-ink mt-2 font-serif text-3xl">
                  {items.length}+
                </p>
              </div>
              <div className="border-line bg-surface rounded-[1.6rem] border px-5 py-4">
                <p className="text-ink-soft text-sm">
                  <span className="lang-ar">أقسام العناية</span><span className="lang-en">Care Categories</span>
                </p>
                <p className="text-ink mt-2 font-serif text-3xl">
                  {categories.length}
                </p>
              </div>
              <div className="border-line bg-surface rounded-[1.6rem] border px-5 py-4">
                <p className="text-ink-soft text-sm">
                  <span className="lang-ar">نسبة الرضا</span><span className="lang-en">Satisfaction Rate</span>
                </p>
                <p className="text-ink mt-2 font-serif text-3xl">97%</p>
              </div>
            </div>
          </article>

          {/* Mood grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="surface-panel col-span-2 overflow-hidden rounded-[2.5rem]">
              <div className="relative m-3 h-48 overflow-hidden rounded-[2rem]">
                <Image
                  src={localMoodImages[0]!}
                  alt="مرجع بصري Rejuvira"
                  fill
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <p className="eyebrow text-white/70"><span className="lang-ar">الانطباع البصري</span><span className="lang-en">Visual Narrative</span></p>
                  <p className="font-serif text-2xl tracking-[-0.04em] text-white">
                    <span className="lang-ar">صور حقيقية مرتبطة بالخدمة والنتيجة</span>
                    <span className="lang-en">Real imagery tied to the service and the expected outcome</span>
                  </p>
                </div>
              </div>
            </div>
            {localMoodImages.slice(1, 5).map((src, i) => (
              <div
                key={src}
                className="surface-panel overflow-hidden rounded-[2rem]"
              >
                <div className="relative m-2.5 h-28 overflow-hidden rounded-[1.6rem]">
                  <Image
                    src={src}
                    alt={`مرجع بصري ${i + 2}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 22vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORIES FILTER STRIP ─────────────────────── */}
        {categories.length > 1 ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-ink-soft text-sm">
              <span className="lang-ar">التصفية:</span><span className="lang-en">Filter:</span>
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="border-line bg-surface text-ink-soft rounded-full border px-4 py-1.5 text-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        ) : null}

        {/* ── BEFORE / AFTER GRID ───────────────────────── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow">
              <span className="lang-ar">مقارنات قبل وبعد</span>
              <span className="lang-en">Before &amp; After Comparisons</span>
            </p>
            <h2 className="balanced-text text-ink mt-3 font-serif text-5xl tracking-[-0.055em]">
              <span className="lang-ar">وضوح النتيجة هو أقوى دليل على جودة العناية.</span>
              <span className="lang-en">The clarity of results is the strongest proof of care quality.</span>
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="surface-panel overflow-hidden rounded-[2.5rem]"
              >
                <div className="grid grid-cols-2 gap-3 p-4">
                  <div className="relative overflow-hidden rounded-[1.75rem]">
                    <div className="relative h-64">
                      <Image
                        src={item.beforeImageUrl}
                        alt={`${item.title} — قبل`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 24vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute right-3 bottom-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <span className="lang-ar">قبل</span><span className="lang-en">Before</span>
                      </span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-[1.75rem]">
                    <div className="relative h-64">
                      <Image
                        src={item.afterImageUrl}
                        alt={`${item.title} — بعد`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 24vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="bg-emerald/80 absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <span className="lang-ar">بعد</span><span className="lang-en">After</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="eyebrow">{item.category}</span>
                    <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,var(--line-subtle),transparent)]" />
                  </div>
                  <h3 className="text-ink mt-3 font-serif text-3xl tracking-[-0.04em]">
                    {item.title}
                  </h3>
                  <p className="text-ink-soft mt-2 text-sm leading-7">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="surface-panel rounded-[2.4rem] p-8 lg:p-10">
            <p className="eyebrow">نتيجتك القادمة</p>
            <h2 className="balanced-text text-ink mt-4 font-serif text-5xl tracking-[-0.055em]">
              ابدئي بخطة واضحة وشاهدي الفرق بنفسك.
            </h2>
            <p className="text-ink-soft mt-4 text-sm leading-8">
              كل نتيجة في هذا القسم مرتبطة بخدمة وخطة علاجية محددة. ابدئي من
              الاستشارة لمعرفة ما يناسب حالتك.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-ink text-canvas rounded-full px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                <span className="lang-ar">احجزي استشارتك الآن</span>
                <span className="lang-en">Book Your Consultation</span>
              </Link>
              <Link
                href="/services"
                className="border-line bg-surface text-ink hover:bg-canvas rounded-full border px-7 py-3.5 text-sm font-semibold transition-colors"
              >
                <span className="lang-ar">استعرضي الخدمات</span>
                <span className="lang-en">Browse Services</span>
              </Link>
            </div>
          </article>
          <div className="surface-panel overflow-hidden rounded-[2.4rem] p-4">
            <div className="relative h-full min-h-[18rem] overflow-hidden rounded-[2rem]">
              <Image
                src="/media/curated/device-emface.jpg"
                alt="Rejuvira Center"
                fill
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 rounded-[1.4rem] border border-white/30 bg-white/20 p-4 backdrop-blur-md">
                <p className="eyebrow text-white/70"><span className="lang-ar">جودة التجربة</span><span className="lang-en">Experience Quality</span></p>
                <p className="font-serif text-2xl leading-snug tracking-[-0.04em] text-white">
                  <span className="lang-ar">أجهزة وخطط علاجية معروضة بما يخدم فهم النتيجة المتوقعة.</span>
                  <span className="lang-en">Devices and treatment plans presented to clarify the expected result.</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
