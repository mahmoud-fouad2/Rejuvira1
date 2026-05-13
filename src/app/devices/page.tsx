import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getDevices } from "@/lib/content-repository";

export const metadata: Metadata = {
  title: "الأجهزة والتقنيات",
  description:
    "تقنيات طبية حديثة مختارة بعناية لدعم الخطة العلاجية وتحقيق نتائج أكثر دقة وأمانًا في Rejuvira Center.",
};

export default async function DevicesPage() {
  const devices = await getDevices();
  const [featuredDevice, ...otherDevices] = devices;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />

      <main className="section-shell flex flex-col gap-20 pt-8 pb-24">
        {/* ── PAGE HERO ──────────────────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch">
          <article className="surface-panel flex flex-col justify-between rounded-[2.75rem] p-8 lg:p-12">
            <div>
              <p className="eyebrow"><span className="lang-ar">الأجهزة والتقنيات</span><span className="lang-en">Devices &amp; Technology</span></p>
              <h1 className="balanced-text text-ink mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em] lg:text-6xl">
                <span className="lang-ar">أجهزة معتمدة تدعم الخطة العلاجية وتوضح الخيارات المتاحة لكل حالة.</span>
                <span className="lang-en">Certified devices that support treatment plans and clarify the right options for each case.</span>
              </h1>
              <p className="text-ink-soft mt-5 max-w-xl text-base leading-8">
                <span className="lang-ar">نختار الأجهزة التي تخدم الخطة العلاجية بوضوح، وتساعد على تقديم تجربة أكثر أمانًا وراحة ونتائج أكثر اتزانًا. كل جهاز حاضر هنا لسبب طبي واضح.</span>
                <span className="lang-en">We select devices that clearly serve the treatment plan, improve safety and comfort, and support balanced outcomes. Every device shown here has a clear medical purpose.</span>
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="border-line bg-surface rounded-[1.6rem] border px-5 py-4">
                <p className="text-ink-soft text-sm">أجهزة معتمدة</p>
                <p className="text-ink mt-2 font-serif text-3xl">
                  {devices.length}
                </p>
              </div>
              <div className="border-line bg-surface rounded-[1.6rem] border px-5 py-4">
                <p className="text-ink-soft text-sm">تقنيات نشطة</p>
                <p className="text-ink mt-2 font-serif text-3xl">
                  {devices.filter((d) => d.status === "PUBLISHED").length}
                </p>
              </div>
              <div className="border-line bg-surface rounded-[1.6rem] border px-5 py-4">
                <p className="text-ink-soft text-sm">شهادات دولية</p>
                <p className="text-ink mt-2 font-serif text-3xl">
                  {devices.reduce((sum, d) => sum + d.certifications.length, 0)}
                </p>
              </div>
            </div>
          </article>

          {featuredDevice ? (
            <article className="surface-panel overflow-hidden rounded-[2.75rem] p-4">
              <div className="grid h-full gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem]">
                  <Image
                    src={featuredDevice.imageUrl}
                    alt={featuredDevice.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 44vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5 rounded-[1.4rem] border border-white/30 bg-white/18 p-4 backdrop-blur-md">
                    <p className="eyebrow text-white/70"><span className="lang-ar">تركيز علاجي</span><span className="lang-en">Clinical Focus</span></p>
                    <p className="mt-1.5 font-serif text-2xl leading-snug tracking-[-0.04em] text-white">
                      {featuredDevice.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-5 rounded-[2rem] bg-[linear-gradient(145deg,rgba(26,122,94,0.14),rgba(255,255,255,0.88))] p-6">
                  <div>
                    <p className="eyebrow"><span className="lang-ar">الجهاز المميز</span><span className="lang-en">Featured Device</span></p>
                    <h2 className="text-ink mt-4 font-serif text-4xl tracking-[-0.05em]">
                      {featuredDevice.name}
                    </h2>
                    <p className="text-ink-soft mt-4 text-sm leading-7">
                      {featuredDevice.excerpt}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {featuredDevice.certifications.slice(0, 3).map((cert) => (
                      <div
                        key={cert}
                        className="border-line bg-surface text-ink-soft rounded-full border px-3 py-1.5 text-xs"
                      >
                        {cert}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/contact"
                    className="bg-ink text-canvas inline-flex w-fit rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                  >
                    <span className="lang-ar">اطلب استشارة لهذه التقنية</span>
                    <span className="lang-en">Request a Consultation for This Technology</span>
                  </Link>
                </div>
              </div>
            </article>
          ) : null}
        </section>

        {/* ── WHY TECHNOLOGY ─────────────────────────────── */}
        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="surface-panel rounded-[2.4rem] p-7 lg:p-10">
            <p className="eyebrow"><span className="lang-ar">عن الأجهزة</span><span className="lang-en">About the Devices</span></p>
            <h2 className="balanced-text text-ink mt-4 font-serif text-5xl tracking-[-0.055em]">
              <span className="lang-ar">الجهاز ليس هدفًا بحد ذاته، بل أداة تخدم خطة علاجية مدروسة.</span>
              <span className="lang-en">A device is not the goal itself, but a tool that serves a well-designed treatment plan.</span>
            </h2>
            <p className="text-ink-soft mt-4 text-sm leading-8">
              نختار أجهزتنا بعناية طبية لا تسويقية: ما الذي يحقق نتائج أفضل،
              يقلل من وقت التعافي، ويوافق طبيعة بشرة المراجع وحالته الفعلية؟ هذا
              هو المعيار الذي يحكم كل اختيار داخل المركز.
            </p>
          </article>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                label: "دقة سريرية",
                desc: "أجهزة معتمدة بنتائج قابلة للقياس والتحقق",
              },
              {
                label: "أمان المراجع",
                desc: "تقنيات آمنة لأنواع مختلفة من البشرة والحالات",
              },
              {
                label: "سرعة التعافي",
                desc: "إجراءات أقل وقتًا مع نتائج تدريجية ومستدامة",
              },
              {
                label: "شمولية التغطية",
                desc: "تقنيات تغطي الوجه والجسم والبشرة معًا",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="surface-panel rounded-[2rem] p-6"
              >
                <span className="text-gold font-serif text-3xl">✦</span>
                <p className="text-ink mt-3 text-base font-semibold">
                  {item.label}
                </p>
                <p className="text-ink-soft mt-2 text-sm leading-6">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ALL DEVICES GRID ───────────────────────────── */}
        {otherDevices.length > 0 ? (
          <section>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">جميع الأجهزة</p>
                <h2 className="balanced-text text-ink mt-3 font-serif text-5xl tracking-[-0.055em]">
                  منظومة أجهزة معتمدة لدعم جودة الخطة العلاجية.
                </h2>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {otherDevices.map((device) => (
                <article
                  key={device.id}
                  className="surface-panel group overflow-hidden rounded-[2rem]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={device.imageUrl}
                      alt={device.name}
                      fill
                      sizes="(max-width: 1280px) 50vw, 30vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="font-serif text-2xl tracking-[-0.04em] text-white">
                        {device.name}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-ink-soft text-sm leading-7">
                      {device.excerpt}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {device.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="border-line bg-canvas text-ink-soft rounded-full border px-3 py-1 text-xs"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="surface-panel rounded-[2.75rem] p-8 lg:p-12">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div>
              <p className="eyebrow"><span className="lang-ar">الخطوة التالية</span><span className="lang-en">Next Step</span></p>
              <h2 className="balanced-text text-ink mt-4 font-serif text-5xl tracking-[-0.055em] lg:text-6xl">
                <span className="lang-ar">اعرف ما يناسب حالتك قبل اتخاذ أي قرار.</span>
                <span className="lang-en">Know what fits your case before making any decision.</span>
              </h2>
              <p className="text-ink-soft mt-4 max-w-xl text-base leading-8">
                <span className="lang-ar">تواصل مع الفريق المختص للحصول على مراجعة أولية تحدد التقنية والخدمة الأنسب لحالتك.</span>
                <span className="lang-en">Connect with the specialist team for an initial review that identifies the right technology and service for your case.</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-ink text-canvas rounded-full px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                <span className="lang-ar">احجز استشارة متخصصة</span>
                <span className="lang-en">Book a Specialist Consultation</span>
              </Link>
              <Link
                href="/services"
                className="border-line bg-surface text-ink hover:bg-canvas rounded-full border px-7 py-3.5 text-sm font-semibold transition-colors"
              >
                <span className="lang-ar">استعرض الخدمات</span>
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
