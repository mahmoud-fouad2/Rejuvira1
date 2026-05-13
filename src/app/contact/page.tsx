import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ContactChannelGlyph } from "@/components/contact/ContactChannelGlyph";
import { ContactForm } from "@/components/forms/ContactForm";
import { getRuntimeSettings, getServices } from "@/lib/content-repository";

export const metadata: Metadata = {
  title: "التواصل والحجز",
  description:
    "تواصل مع فريق Rejuvira Center واحجز استشارتك — رد سريع، خدمة مخصصة، وخطوة أولى واضحة نحو العناية التي تستحقينها.",
};

export default async function ContactPage() {
  const [services, runtimeSettings] = await Promise.all([
    getServices(),
    getRuntimeSettings(),
  ]);
  const contactChannels = [
    {
      labelAr: "واتساب",
      labelEn: "WhatsApp",
      value: runtimeSettings.contact.whatsapp,
      hintAr: `زمن الرد المستهدف ${runtimeSettings.ops.sla}`,
      hintEn: `Target response time ${runtimeSettings.ops.sla}`,
      href: `https://wa.me/${runtimeSettings.contact.whatsapp.replace(/\D/g, "")}`,
      kind: "whatsapp" as const,
    },
    {
      labelAr: "الهاتف",
      labelEn: "Phone",
      value: runtimeSettings.contact.phone,
      hintAr: "الأحد إلى الخميس",
      hintEn: "Sunday to Thursday",
      href: `tel:${runtimeSettings.contact.phone.replace(/\s+/g, "")}`,
      kind: "phone" as const,
    },
    {
      labelAr: "البريد",
      labelEn: "Email",
      value: runtimeSettings.contact.email,
      hintAr: "للتنسيق والاستفسارات العامة",
      hintEn: "For coordination and general inquiries",
      href: `mailto:${runtimeSettings.contact.email}`,
      kind: "email" as const,
    },
  ] as const;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-28 px-6 pt-16 pb-32 lg:px-10">
        {/* ── HERO ROW ───────────────────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          {/* Left: headline + info */}
          <article className="surface-panel flex flex-col justify-between rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <div>
              <p className="eyebrow text-ink-soft">
                <span className="lang-ar">التواصل والحجز</span>
                <span className="lang-en">Contact &amp; Booking</span>
              </p>
              <h1 className="balanced-text text-ink-strong mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em] lg:text-6xl">
                <span className="lang-ar">ابدأ من احتياجك، وسنوجّهك إلى الخدمة أو الطبيب الأنسب.</span>
                <span className="lang-en">Start from your need, and we will guide you to the right service or doctor.</span>
              </h1>
              <p className="text-ink-soft mt-5 max-w-xl text-lg leading-8">
                <span className="lang-ar">أرسل بياناتك وسيتواصل معك الفريق لمساعدتك في اختيار الخدمة أو الطبيب المناسب، مع إجابات واضحة وخطوة تالية محددة بثقة وهدوء.</span>
                <span className="lang-en">Share your details and the team will help you choose the right service or physician, with clear answers and a defined next step.</span>
              </p>
            </div>

            {/* Contact channels */}
            <div className="mt-10 grid gap-4">
              {contactChannels.map((ch) => (
                <Link
                  key={ch.labelAr}
                  href={ch.href}
                  className="group border-line bg-surface flex items-center justify-between rounded-[1.8rem] border px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-mid/25 hover:shadow-[0_20px_50px_oklch(22%_0.06_285/0.09)]"
                >
                  <div className="flex items-center gap-4">
                    <span className="bg-ink-strong flex h-12 w-12 items-center justify-center rounded-full shadow-md ring-1 ring-white/10">
                      <ContactChannelGlyph kind={ch.kind} />
                    </span>
                    <div>
                      <p
                        className="text-ink-strong text-base font-medium"
                        dir="ltr"
                      >
                        {ch.value}
                      </p>
                      <p className="text-ink-soft mt-1.5 text-xs">
                        <span className="lang-ar">{ch.hintAr}</span>
                        <span className="lang-en">{ch.hintEn}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-ink-soft group-hover:text-ink-strong text-[10px] font-semibold tracking-[0.24em] uppercase transition-colors">
                    <span className="lang-ar">{ch.labelAr}</span>
                    <span className="lang-en">{ch.labelEn}</span>
                  </span>
                </Link>
              ))}
            </div>
          </article>

          {/* Right: image composition */}
          <div className="surface-panel overflow-hidden rounded-[2.5rem] p-5 shadow-sm">
            <div className="grid h-full gap-5">
              <div className="relative min-h-[26rem] overflow-hidden rounded-[2rem]">
                <Image
                  src={runtimeSettings.media.doctorsHero}
                  alt="Rejuvira Center استقبال"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="relative z-0 object-cover"
                  priority
                />
                <div className="from-ink-strong/60 absolute inset-0 z-10 bg-gradient-to-t to-transparent mix-blend-multiply" />
                <div className="glass-card absolute inset-x-6 bottom-6 z-20 rounded-[1.8rem] border border-white/12 p-6 backdrop-blur-md">
                  <p className="font-sans text-[10px] tracking-[0.24em] text-white/80 uppercase">
                    <span className="lang-ar">تجربة الوصول</span>
                    <span className="lang-en">Arrival Experience</span>
                  </p>
                  <p className="mt-2 font-serif text-2xl leading-snug tracking-[-0.02em] text-white">
                    <span className="lang-ar">بيئة هادئة ومنظمة تبدأ فيها رحلتك بثقة.</span>
                    <span className="lang-en">A calm, organized environment where your journey begins with confidence.</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="surface-panel rounded-[2rem] p-6 shadow-sm">
                  <p className="text-ink-faint font-sans text-[10px] tracking-[0.24em] uppercase">
                    <span className="lang-ar">زمن الرد</span>
                    <span className="lang-en">Response Time</span>
                  </p>
                  <p className="text-ink-strong mt-4 font-serif text-4xl tracking-[-0.02em]">
                    <span className="lang-ar">سريع</span>
                    <span className="lang-en">Fast</span>
                  </p>
                  <p className="text-ink-soft mt-2 text-sm"><span className="lang-ar">في نفس اليوم</span><span className="lang-en">Same day</span></p>
                </div>
                <div className="surface-panel rounded-[2rem] p-6 shadow-sm">
                  <p className="text-ink-faint font-sans text-[10px] tracking-[0.24em] uppercase">
                    <span className="lang-ar">الاستشارة</span>
                    <span className="lang-en">Consultation</span>
                  </p>
                  <p className="text-ink-strong mt-4 font-serif text-4xl tracking-[-0.02em]">
                    <span className="lang-ar">أولية</span>
                    <span className="lang-en">Initial</span>
                  </p>
                  <p className="text-ink-soft mt-2 text-sm"><span className="lang-ar">تقييم أولي منظم</span><span className="lang-en">Structured first assessment</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT FORM SECTION ──────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft"><span className="lang-ar">لماذا المركز</span><span className="lang-en">Why Rejuvira</span></p>
            <h2 className="balanced-text text-ink-strong mt-5 font-serif text-4xl leading-[1.2] tracking-[-0.02em]">
              <span className="lang-ar">نجعل كل استفسار بداية واضحة نحو القرار المناسب.</span>
              <span className="lang-en">We turn every inquiry into a clear start toward the right decision.</span>
            </h2>
            <p className="text-ink-soft mt-5 text-base leading-8">
              <span className="lang-ar">فريقنا لا يكتفي بالرد، بل يقرأ حاجتك بدقة ويقترح الخيار الأنسب بهدوء ووضوح، من دون ضغط أو وعود غير واقعية.</span>
              <span className="lang-en">Our team does more than answer. We assess your need carefully and recommend the right option with clarity, without pressure or inflated promises.</span>
            </p>
            <div className="mt-10 grid gap-4">
              {[
                {
                  label: "استشارة مخصصة",
                  desc: "نختار لك الطبيب والخدمة المناسبَين لحالتك تحديدًا",
                },
                {
                  label: "وضوح كامل",
                  desc: "لا أسرار في التسعير أو التوقعات — كل شيء واضح من البداية",
                },
                {
                  label: "متابعة ما بعد الجلسة",
                  desc: "لا ننتهي عند انتهاء الجلسة، بل نتابع النتيجة معك",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-line bg-surface flex items-start gap-5 rounded-[1.8rem] border px-6 py-5 shadow-sm"
                >
                  <span className="text-ink-strong mt-1 font-serif text-xl">
                    ✦
                  </span>
                  <div>
                    <p className="text-ink-strong text-base font-medium">
                      {item.label}
                    </p>
                    <p className="text-ink-soft mt-2 text-sm leading-6">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow"><span className="lang-ar">أرسل طلبك</span><span className="lang-en">Send Your Request</span></p>
            <h2 className="text-ink mt-3 font-serif text-4xl tracking-[-0.05em]">
              <span className="lang-ar">نموذج التواصل</span>
              <span className="lang-en">Contact Form</span>
            </h2>
            <p className="text-ink-soft mt-3 text-sm">
              <span className="lang-ar">يصل الطلب مباشرة إلى الفريق المختص ليتم مراجعته والرد عليه بصورة منظمة.</span>
              <span className="lang-en">Your request is sent directly to the relevant team for structured review and response.</span>
            </p>
            <div className="mt-7">
              <ContactForm services={services} />
            </div>
          </article>
        </section>

        {/* ── LOCATION / WORKING HOURS ──────────────────── */}
        <section className="grid gap-5 lg:grid-cols-3">
          <article className="surface-panel col-span-1 overflow-hidden rounded-[2.4rem] p-6 lg:col-span-2">
            <p className="eyebrow"><span className="lang-ar">الموقع وساعات العمل</span><span className="lang-en">Location &amp; Hours</span></p>
            <h2 className="text-ink mt-4 font-serif text-4xl tracking-[-0.05em]">
              <span className="lang-ar">نحن في الرياض، ونستقبلك بتنظيم واهتمام.</span>
              <span className="lang-en">We are in Riyadh, ready to welcome you with care and organization.</span>
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: "الموقع", value: "الرياض، المملكة العربية السعودية" },
                { label: "أيام العمل", value: "الأحد — الخميس" },
                { label: "ساعات العمل", value: "10:00 ص — 9:00 م" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-line bg-surface rounded-[1.6rem] border px-5 py-4"
                >
                  <p className="text-ink-faint text-sm">{item.label}</p>
                  <p className="text-ink mt-2 text-base font-semibold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </article>
          <article className="surface-panel overflow-hidden rounded-[2.4rem]">
            <div className="relative h-full min-h-[16rem] overflow-hidden rounded-[2.4rem]">
              <Image
                src={runtimeSettings.media.doctorsHero}
                alt="Rejuvira Center"
                fill
                sizes="(max-width: 1024px) 100vw, 34vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <Link
                href={`https://wa.me/${runtimeSettings.contact.whatsapp.replace(/\D/g, "")}`}
                className="text-ink absolute inset-x-5 bottom-5 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                <span className="lang-ar">واتساب مباشر</span>
                <span className="lang-en">Direct WhatsApp</span>
              </Link>
            </div>
          </article>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
