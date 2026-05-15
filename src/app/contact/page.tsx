import type { Metadata } from "next";
import Image from "next/image";

import { GoogleMapsEmbed } from "@/components/contact/GoogleMapsEmbed";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SocialIconCluster } from "@/components/layout/SocialIconCluster";
import { ContactChannelGlyph } from "@/components/contact/ContactChannelGlyph";
import { ContactForm } from "@/components/forms/ContactForm";
import { getRuntimeSettings, getServices } from "@/lib/content-repository";
import { getPublicSiteKey } from "@/lib/recaptcha";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ page: "contact", path: "/contact" });
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function toSaudiWhatsappHref(value: string) {
  const digits = digitsOnly(value);
  const normalized = digits.startsWith("966")
    ? digits
    : digits.startsWith("0")
      ? `966${digits.slice(1)}`
      : `966${digits}`;
  return `https://wa.me/${normalized}`;
}

export default async function ContactPage() {
  const [services, runtimeSettings] = await Promise.all([
    getServices(),
    getRuntimeSettings(),
  ]);
  const whatsappDigits = digitsOnly(runtimeSettings.contact.whatsapp || runtimeSettings.contact.phone);
  const primaryDigits = digitsOnly(runtimeSettings.contact.phone);
  const secondaryDigits = digitsOnly(runtimeSettings.contact.phoneSecondary);
  const contactChannels = [
    {
      labelAr: "واتساب",
      labelEn: "WhatsApp",
      value: runtimeSettings.contact.whatsapp || runtimeSettings.contact.phone,
      hintAr: `زمن الرد المستهدف ${runtimeSettings.ops.sla}`,
      hintEn: `Target response time ${runtimeSettings.ops.sla}`,
      href: toSaudiWhatsappHref(runtimeSettings.contact.whatsapp || runtimeSettings.contact.phone),
      kind: "whatsapp" as const,
    },
    ...(primaryDigits && primaryDigits !== whatsappDigits ? [{
      labelAr: "الهاتف الرئيسي",
      labelEn: "Primary phone",
      value: runtimeSettings.contact.phone,
      hintAr: `خط الاستقبال — ${runtimeSettings.contact.hoursWeekdays}`,
      hintEn: `Reception line — ${runtimeSettings.contact.hoursWeekdaysEn}`,
      href: `tel:${primaryDigits}`,
      kind: "phone" as const,
    }] : []),
    ...(secondaryDigits && secondaryDigits !== primaryDigits && secondaryDigits !== whatsappDigits ? [{
      labelAr: "الرقم الموحد",
      labelEn: "Unified line",
      value: runtimeSettings.contact.phoneSecondary,
      hintAr: "خط موحد لخدمة العملاء",
      hintEn: "Unified customer line",
      href: `tel:${secondaryDigits}`,
      kind: "phone" as const,
    }] : []),
    {
      labelAr: "البريد الرسمي",
      labelEn: "Primary email",
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
                <span className="lang-ar">ابدئي من احتياجك، وسنوجّهك إلى الخدمة أو الطبيب الأنسب.</span>
                <span className="lang-en">Start from your need, and we will guide you to the right service or doctor.</span>
              </h1>
              <p className="text-ink-soft mt-5 max-w-xl text-lg leading-8">
                <span className="lang-ar">أرسلي بياناتك وسيتواصل معك الفريق لمساعدتك في اختيار الخدمة أو الطبيب المناسب، مع إجابات واضحة وخطوة تالية محددة بثقة وهدوء.</span>
                <span className="lang-en">Share your details and the team will help you choose the right service or physician, with clear answers and a defined next step.</span>
              </p>
            </div>

            {/* Contact channels */}
            <div className="mt-8">
              <p className="text-ink-faint text-[10px] tracking-[0.22em] uppercase">
                <span className="lang-ar">حساباتنا الاجتماعية</span>
                <span className="lang-en">Our social channels</span>
              </p>
              <div className="mt-3">
                <SocialIconCluster settings={runtimeSettings} size="md" />
              </div>
            </div>

            <div className="mt-10 grid gap-4">
              {contactChannels.map((ch) => (
                <a
                  key={ch.labelAr}
                  href={ch.href}
                  target={ch.kind === "whatsapp" ? "_blank" : undefined}
                  rel={ch.kind === "whatsapp" ? "noopener noreferrer" : undefined}
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
                </a>
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
                    <span className="lang-ar">منظم</span>
                    <span className="lang-en">Organized</span>
                  </p>
                  <p className="text-ink-soft mt-2 text-sm"><span className="lang-ar">رد واضح من الفريق</span><span className="lang-en">Clear team response</span></p>
                </div>
                <div className="surface-panel rounded-[2rem] p-6 shadow-sm">
                  <p className="text-ink-faint font-sans text-[10px] tracking-[0.24em] uppercase">
                    <span className="lang-ar">الاستشارة</span>
                    <span className="lang-en">Consultation</span>
                  </p>
                  <p className="text-ink-strong mt-4 font-serif text-4xl tracking-[-0.02em]">
                    <span className="lang-ar">مناسبة</span>
                    <span className="lang-en">Tailored</span>
                  </p>
                  <p className="text-ink-soft mt-2 text-sm"><span className="lang-ar">توجيه حسب الحالة</span><span className="lang-en">Case-based guidance</span></p>
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
            <p className="eyebrow"><span className="lang-ar">أرسلي طلبك</span><span className="lang-en">Send Your Request</span></p>
            <h2 className="text-ink mt-3 font-serif text-4xl tracking-[-0.05em]">
              <span className="lang-ar">نموذج التواصل</span>
              <span className="lang-en">Contact Form</span>
            </h2>
            <p className="text-ink-soft mt-3 text-sm">
              <span className="lang-ar">يصل الطلب مباشرة إلى الفريق المختص ليتم مراجعته والرد عليه بصورة منظمة.</span>
              <span className="lang-en">Your request is sent directly to the relevant team for structured review and response.</span>
            </p>
            <div className="mt-7">
              <ContactForm
                services={services}
                recaptchaSiteKey={getPublicSiteKey()}
              />
            </div>
          </article>
        </section>

        {/* ── INTERACTIVE MAP ───────────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <article className="surface-panel rounded-[2.5rem] p-6 shadow-sm lg:p-8">
            <p className="eyebrow">
              <span className="lang-ar">الموقع على الخريطة</span>
              <span className="lang-en">Find us on the map</span>
            </p>
            <h2 className="text-ink mt-3 font-serif text-3xl tracking-[-0.04em] lg:text-4xl">
              <span className="lang-ar">موقعنا في الرياض</span>
              <span className="lang-en">Our location in Riyadh</span>
            </h2>
            <p className="text-ink-soft mt-3 text-sm leading-7">
              <span className="lang-ar">
                خريطة محدّثة لمكان المركز يمكنك من خلالها التحقق من الوصول قبل الزيارة.
              </span>
              <span className="lang-en">
                Live map of our location so you can plan your visit with confidence.
              </span>
            </p>
            <div className="mt-6">
              <GoogleMapsEmbed
                src={runtimeSettings.contact.mapsEmbedUrl}
                shape={runtimeSettings.contact.mapsShape}
                title="Rejuvira Center — موقع المركز"
              />
            </div>
          </article>
          <article className="surface-panel rounded-[2.5rem] p-6 shadow-sm lg:p-8">
            <p className="eyebrow">
              <span className="lang-ar">العنوان وساعات العمل</span>
              <span className="lang-en">Address &amp; Hours</span>
            </p>
            <div className="mt-6 grid gap-4">
              <div className="border-line bg-surface rounded-[1.6rem] border px-5 py-4">
                <p className="text-ink-faint text-[10px] tracking-[0.22em] uppercase">
                  <span className="lang-ar">العنوان</span>
                  <span className="lang-en">Address</span>
                </p>
                <p className="text-ink mt-2 text-base font-semibold">
                  <span className="lang-ar">
                    {runtimeSettings.contact.addressAr}
                  </span>
                  <span className="lang-en">
                    {runtimeSettings.contact.addressEn}
                  </span>
                </p>
              </div>
              <div className="border-line bg-surface rounded-[1.6rem] border px-5 py-4">
                <p className="text-ink-faint text-[10px] tracking-[0.22em] uppercase">
                  <span className="lang-ar">أيام العمل</span>
                  <span className="lang-en">Working days</span>
                </p>
                <p className="text-ink mt-2 text-base font-semibold">
                  <span className="lang-ar">السبت — الخميس</span>
                  <span className="lang-en">Saturday — Thursday</span>
                </p>
              </div>
              <div className="border-line bg-surface rounded-[1.6rem] border px-5 py-4">
                <p className="text-ink-faint text-[10px] tracking-[0.22em] uppercase">
                  <span className="lang-ar">ساعات العمل</span>
                  <span className="lang-en">Working hours</span>
                </p>
                <p className="text-ink mt-2 text-base font-semibold">
                  <span className="lang-ar">{runtimeSettings.contact.hoursWeekdays}</span>
                  <span className="lang-en">{runtimeSettings.contact.hoursWeekdaysEn}</span>
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="surface-panel rounded-[2.7rem] p-6 shadow-sm lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <p className="eyebrow">
                <span className="lang-ar">أسئلة شائعة</span>
                <span className="lang-en">Frequently Asked Questions</span>
              </p>
              <h2 className="text-ink mt-3 font-serif text-4xl leading-tight tracking-[-0.04em]">
                <span className="lang-ar">إجابات مختصرة تساعدك قبل التواصل.</span>
                <span className="lang-en">Clear answers before you contact us.</span>
              </h2>
              <p className="text-ink-soft mt-4 text-sm leading-7">
                <span className="lang-ar">
                  اخترنا الأسئلة الأكثر ارتباطًا بالحجز والوصول والمتابعة حتى تكون الخطوة التالية واضحة.
                </span>
                <span className="lang-en">
                  We grouped the most useful booking, access, and follow-up answers in one focused section.
                </span>
              </p>
            </div>
            <div className="grid gap-3">
              {runtimeSettings.contact.faqs.slice(0, 5).map((faq, index) => (
                <details
                  key={faq.questionAr}
                  open={index === 0}
                  className="group border-line bg-surface/80 rounded-[1.6rem] border px-5 py-4 shadow-sm transition-all duration-300 open:border-purple-mid/35 open:bg-white/80 open:shadow-[0_18px_45px_oklch(24%_0.08_285/0.08)] dark:open:bg-white/8"
                >
                  <summary className="text-ink-strong flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold marker:hidden">
                    <span>
                      <span className="lang-ar">{faq.questionAr}</span>
                      <span className="lang-en">{faq.questionEn}</span>
                    </span>
                    <span className="bg-purple-soft/70 text-purple-strong grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform duration-300 group-open:rotate-180">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="text-ink-soft mt-3 max-w-2xl text-sm leading-7">
                    <span className="lang-ar">{faq.answerAr}</span>
                    <span className="lang-en">{faq.answerEn}</span>
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
