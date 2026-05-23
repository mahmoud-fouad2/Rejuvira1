import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { getGalleryItems } from "@/lib/content-repository";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ page: "gallery", path: "/gallery" });
}

const moodImages = [
  "/media/reference/legacy/13.png",
  "/media/reference/legacy/18.png",
  "/media/reference/legacy/88985959.webp",
  "/media/curated/service-laser-hair-removal.jpg",
];

export default async function GalleryPage() {
  const items = await getGalleryItems();
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />

      <main className="section-shell flex flex-col gap-16 pt-8 pb-32 md:gap-24">
        {/* ── HERO ─────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <div className="surface-panel rounded-[2rem] p-6 md:rounded-[2.5rem] md:p-10 lg:p-12">
            <p className="eyebrow">
              <span className="lang-ar">معرض النتائج</span>
              <span className="lang-en">Results Gallery</span>
            </p>
            <h1 className="balanced-text text-ink mt-4 font-serif text-3xl leading-[1.15] tracking-[-0.02em] md:text-5xl lg:text-6xl">
              <span className="lang-ar">
                نتائج حقيقية تعكس الدقة والاهتمام بكل تفصيلة.
              </span>
              <span className="lang-en">
                Real results reflecting precision and attention to every detail.
              </span>
            </h1>
            <p className="text-ink-soft mt-4 max-w-2xl text-sm leading-7 md:text-base md:leading-8">
              <span className="lang-ar">
                مقارنات قبل وبعد تُظهر النتيجة الفعلية دون مبالغة، لأن الثقة
                تُبنى بالوضوح لا بالإبهار.
              </span>
              <span className="lang-en">
                Before and after comparisons show real results without
                exaggeration, because trust is built on clarity, not spectacle.
              </span>
            </p>

            {/* Stats row */}
            <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
              <div className="surface-panel rounded-[1.2rem] p-4 md:rounded-[1.5rem] md:p-5">
                <p className="eyebrow text-[10px] md:text-xs">
                  <span className="lang-ar">حالات موثقة</span>
                  <span className="lang-en">Cases</span>
                </p>
                <p className="text-ink mt-2 font-serif text-xl md:text-3xl">
                  {items.length}+
                </p>
              </div>
              <div className="surface-panel rounded-[1.2rem] p-4 md:rounded-[1.5rem] md:p-5">
                <p className="eyebrow text-[10px] md:text-xs">
                  <span className="lang-ar">أقسام العناية</span>
                  <span className="lang-en">Categories</span>
                </p>
                <p className="text-ink mt-2 font-serif text-xl md:text-3xl">
                  {categories.length}
                </p>
              </div>
              <div className="surface-panel rounded-[1.2rem] p-4 md:rounded-[1.5rem] md:p-5">
                <p className="eyebrow text-[10px] md:text-xs">
                  <span className="lang-ar">نسبة الرضا</span>
                  <span className="lang-en">Satisfaction</span>
                </p>
                <p className="text-ink mt-2 font-serif text-xl md:text-3xl">
                  97%
                </p>
              </div>
            </div>
          </div>

          {/* Mood images — contained grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {moodImages.map((src, i) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl md:rounded-2xl"
              >
                <Image
                  src={src}
                  alt={`معرض ريجوفيرا ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── BEFORE / AFTER GRID ──────────────────────── */}
        <section>
          <div className="mb-8">
            <p className="eyebrow">
              <span className="lang-ar">مقارنات قبل وبعد</span>
              <span className="lang-en">Before &amp; After Comparisons</span>
            </p>
            <h2 className="balanced-text text-ink mt-3 font-serif text-2xl tracking-[-0.03em] md:text-4xl lg:text-5xl">
              <span className="lang-ar">
                وضوح النتيجة هو أقوى دليل على جودة العناية.
              </span>
              <span className="lang-en">
                The clarity of results is the strongest proof of care quality.
              </span>
            </h2>
          </div>
          <GalleryGrid items={items} />
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section className="surface-panel grid gap-6 overflow-hidden rounded-[2rem] p-6 md:grid-cols-2 md:rounded-[2.5rem] md:p-0">
          <div className="flex flex-col justify-center md:p-10 lg:p-12">
            <p className="eyebrow">
              <span className="lang-ar">نتيجتك القادمة</span>
              <span className="lang-en">Your Next Result</span>
            </p>
            <h2 className="balanced-text text-ink mt-4 font-serif text-2xl tracking-[-0.03em] md:text-4xl">
              <span className="lang-ar">
                ابدئي بخطة واضحة وشاهدي الفرق بنفسك.
              </span>
              <span className="lang-en">
                Start with a clear plan and see the difference yourself.
              </span>
            </h2>
            <p className="text-ink-soft mt-4 text-sm leading-7">
              <span className="lang-ar">
                كل نتيجة مرتبطة بخدمة وخطة علاجية محددة. ابدئي من الاستشارة
                لمعرفة ما يناسب حالتك.
              </span>
              <span className="lang-en">
                Every result is connected to a service and treatment plan. Start
                with a consultation to find what fits you.
              </span>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="bg-ink text-canvas rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                <span className="lang-ar">احجزي استشارتك</span>
                <span className="lang-en">Book Consultation</span>
              </Link>
              <Link
                href="/services"
                className="border-line bg-surface text-ink hover:bg-canvas rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
              >
                <span className="lang-ar">استعرضي الخدمات</span>
                <span className="lang-en">Browse Services</span>
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl md:aspect-auto md:min-h-[20rem] md:rounded-none">
            <Image
              src="/media/curated/device-laser-platform.webp"
              alt="Rejuvera Center"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
