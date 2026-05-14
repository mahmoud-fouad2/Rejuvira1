import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getRuntimeSettings } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

const LAST_UPDATED_AR = "آخر تحديث: 14 مايو 2026";
const LAST_UPDATED_EN = "Last updated: May 14, 2026";

const sections = [
  { id: "intro", ar: "مقدمة وقبول الشروط", en: "Introduction & acceptance" },
  { id: "services", ar: "وصف الخدمات", en: "Description of services" },
  { id: "booking", ar: "الحجز والإلغاء والمواعيد", en: "Booking, scheduling & cancellation" },
  { id: "medical", ar: "إخلاء طبي ومسؤولية الحالة", en: "Medical disclaimer" },
  { id: "ip", ar: "حقوق الملكية الفكرية", en: "Intellectual property" },
  { id: "use", ar: "الاستخدام المقبول للموقع", en: "Acceptable use" },
  { id: "third-party", ar: "محتوى الأطراف الثالثة", en: "Third-party content" },
  { id: "liability", ar: "حدود المسؤولية", en: "Limitation of liability" },
  { id: "governing", ar: "النظام الحاكم والاختصاص", en: "Governing law & jurisdiction" },
  { id: "changes", ar: "تعديل الشروط", en: "Changes to terms" },
  { id: "contact", ar: "التواصل بخصوص الشروط", en: "Contact regarding terms" },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getRuntimeSettings();
  const url = `https://${settings.contact.domain || "rejuveracenter.sa"}/terms`;
  return {
    title: "الشروط والأحكام | Terms & Conditions",
    description:
      "الشروط والأحكام الخاصة باستخدام موقع مركز ريجوفيرا وحجز الخدمات، بما في ذلك الإخلاء الطبي وحقوق الملكية الفكرية والنظام الحاكم.",
    alternates: { canonical: url },
    openGraph: {
      title: "الشروط والأحكام — Rejuvira Center",
      description:
        "الإطار التعاقدي لاستخدام الموقع وحجز الخدمات داخل مركز ريجوفيرا.",
      url,
      type: "article",
      locale: "ar_SA",
    },
    twitter: {
      card: "summary",
      title: "الشروط والأحكام — Rejuvira Center",
      description: "الإطار التعاقدي لاستخدام الموقع والخدمات.",
    },
  };
}

export default async function TermsPage() {
  const settings = await getRuntimeSettings();
  const primaryEmail = settings.contact.email;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />

      <main className="rv-legal-shell" lang="ar">
        <div className="rv-legal-grid">
          <aside className="rv-legal-toc" aria-label="فهرس الصفحة">
            <p className="rv-legal-toc-title">
              <span className="lang-ar">المحتويات</span>
              <span className="lang-en">Contents</span>
            </p>
            <ol>
              {sections.map((section, index) => (
                <li key={section.id}>
                  <Link href={`#${section.id}`}>
                    <span aria-hidden>{index + 1}. </span>
                    <span className="lang-ar">{section.ar}</span>
                    <span className="lang-en">{section.en}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </aside>

          <article className="rv-legal-prose">
            <header>
              <p className="eyebrow text-ink-soft">
                <span className="lang-ar">المستندات النظامية</span>
                <span className="lang-en">Legal documents</span>
              </p>
              <h1>
                <span className="lang-ar">الشروط والأحكام</span>
                <span className="lang-en">Terms &amp; Conditions</span>
              </h1>
              <p className="rv-legal-lead">
                <span className="lang-ar">
                  باستخدامك موقع {settings.brand.siteName} أو حجز خدمة عبره، تكونين قد وافقت
                  على الشروط الواردة أدناه. صيغت هذه الشروط بأسلوب واضح ومباشر يعكس الطابع
                  التشغيلي للمركز ويوضح ما يمكن توقعه قبل وبعد الزيارة.
                </span>
                <span className="lang-en">
                  By using the {settings.brand.siteName} site or booking a service through it,
                  you accept the terms below. They are written in a clear, direct tone that
                  reflects how the clinic actually operates.
                </span>
              </p>
            </header>

            <section id="intro">
              <h2>
                <span className="lang-ar">1) مقدمة وقبول الشروط</span>
                <span className="lang-en">1) Introduction &amp; acceptance</span>
              </h2>
              <p>
                <span className="lang-ar">
                  تحكم هذه الشروط استخدامك لجميع صفحات الموقع، النماذج، قنوات الحجز، والمحتوى
                  المقدم على{" "}
                  <span dir="ltr">{settings.contact.domain || "rejuveracenter.sa"}</span>. إذا
                  لم توافقي على أي جزء منها، يرجى عدم استخدام الموقع أو إرسال طلب حجز.
                </span>
                <span className="lang-en">
                  These terms govern your use of all pages, forms, booking channels, and
                  content provided on{" "}
                  <span dir="ltr">{settings.contact.domain || "rejuveracenter.sa"}</span>. If
                  you do not agree to any part of these terms, please refrain from using the
                  site or submitting a booking request.
                </span>
              </p>
            </section>

            <section id="services">
              <h2>
                <span className="lang-ar">2) وصف الخدمات</span>
                <span className="lang-en">2) Description of services</span>
              </h2>
              <p>
                <span className="lang-ar">
                  يقدم المركز خدمات في مجال الجلدية والتجميل الطبي بإشراف فريق طبي متخصص.
                  تُعرض الخدمات والأجهزة والأطباء على الموقع بصورة تعريفية فقط، ولا تشكّل وعدًا
                  بنتيجة معينة، إذ تخضع كل حالة لتقييم سريري مستقل قبل اعتماد أي خطة علاجية.
                </span>
                <span className="lang-en">
                  Rejuvira provides dermatology and aesthetic medical services under qualified
                  medical supervision. Information about services, devices, and physicians on
                  this site is presented for informational purposes only and does not
                  constitute a promise of a specific outcome; every case requires independent
                  clinical assessment before any treatment plan is adopted.
                </span>
              </p>
            </section>

            <section id="booking">
              <h2>
                <span className="lang-ar">3) الحجز والإلغاء والمواعيد</span>
                <span className="lang-en">3) Booking, scheduling &amp; cancellation</span>
              </h2>
              <ul>
                <li>
                  <span className="lang-ar">
                    إرسال نموذج الحجز لا يعدّ تأكيدًا للموعد، ويتم الرد عليه خلال الفترة
                    التشغيلية المعلنة.
                  </span>
                  <span className="lang-en">
                    Submitting a booking form does not confirm an appointment; we reply within
                    the published operating window.
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    يلتزم المراجع بدقة المعلومات المقدمة، وله الحق في إعادة الجدولة أو الإلغاء
                    وفق سياسة المركز المعلنة عند تأكيد الحجز.
                  </span>
                  <span className="lang-en">
                    You agree that information you submit is accurate, and you may reschedule
                    or cancel as per the clinic policy disclosed at booking confirmation.
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    قد يُطلب دفع مقدم لتأكيد المواعيد المتعلقة بإجراءات معينة، ويُوضّح ذلك قبل
                    الاعتماد.
                  </span>
                  <span className="lang-en">
                    Some appointments may require a deposit, which will be disclosed before
                    confirmation.
                  </span>
                </li>
              </ul>
            </section>

            <section id="medical">
              <h2>
                <span className="lang-ar">4) إخلاء طبي ومسؤولية الحالة</span>
                <span className="lang-en">4) Medical disclaimer</span>
              </h2>
              <p>
                <span className="lang-ar">
                  المحتوى المقدم على الموقع لأغراض تثقيفية، ولا يحلّ محل الاستشارة الطبية
                  المباشرة. القرارات العلاجية والتجميلية تخضع لتقييم سريري داخل المركز، وتُتخذ
                  بعد فهم الحالة وشرح الخيارات وحدودها.
                </span>
                <span className="lang-en">
                  Content on this site is provided for educational purposes and does not
                  replace direct medical consultation. Treatment and aesthetic decisions are
                  made after in-clinic clinical assessment and a clear explanation of options
                  and their limits.
                </span>
              </p>
            </section>

            <section id="ip">
              <h2>
                <span className="lang-ar">5) حقوق الملكية الفكرية</span>
                <span className="lang-en">5) Intellectual property</span>
              </h2>
              <p>
                <span className="lang-ar">
                  جميع العناصر المعروضة على الموقع — بما في ذلك النصوص، الصور، الفيديوهات،
                  العلامات، التصميم، والبنية التقنية — مملوكة للمركز أو لمن منح المركز ترخيصًا
                  باستخدامها. يُمنع النسخ أو إعادة النشر دون إذن خطي.
                </span>
                <span className="lang-en">
                  All materials on the site — including text, imagery, video, marks, design,
                  and technical structure — are owned by the clinic or licensed to it.
                  Reproduction or redistribution without written permission is prohibited.
                </span>
              </p>
            </section>

            <section id="use">
              <h2>
                <span className="lang-ar">6) الاستخدام المقبول للموقع</span>
                <span className="lang-en">6) Acceptable use</span>
              </h2>
              <ul>
                <li>
                  <span className="lang-ar">
                    استخدام الموقع لأغراض شخصية ومشروعة فقط.
                  </span>
                  <span className="lang-en">Use the site for personal, lawful purposes only.</span>
                </li>
                <li>
                  <span className="lang-ar">
                    عدم محاولة الوصول إلى مناطق محمية أو تنفيذ هجمات أو إساءة استخدام النماذج.
                  </span>
                  <span className="lang-en">
                    Do not attempt to access protected areas, conduct attacks, or abuse forms.
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    عدم انتحال شخصية الآخرين أو تقديم معلومات مضللة عمدًا.
                  </span>
                  <span className="lang-en">
                    Do not impersonate others or knowingly provide misleading information.
                  </span>
                </li>
              </ul>
            </section>

            <section id="third-party">
              <h2>
                <span className="lang-ar">7) محتوى الأطراف الثالثة</span>
                <span className="lang-en">7) Third-party content</span>
              </h2>
              <p>
                <span className="lang-ar">
                  قد يرتبط الموقع بمحتوى من أطراف ثالثة (مثل خرائط جوجل، حسابات التواصل
                  الاجتماعي، أو خدمات الدفع). لا يتحمل المركز مسؤولية محتوى هذه المنصات أو
                  سياساتها.
                </span>
                <span className="lang-en">
                  The site may link to third-party content (e.g. Google Maps, social accounts,
                  or payment services). The clinic is not responsible for those platforms or
                  their policies.
                </span>
              </p>
            </section>

            <section id="liability">
              <h2>
                <span className="lang-ar">8) حدود المسؤولية</span>
                <span className="lang-en">8) Limitation of liability</span>
              </h2>
              <p>
                <span className="lang-ar">
                  ضمن الحدود التي يجيزها النظام، لا يتحمل المركز المسؤولية عن الأضرار غير
                  المباشرة الناتجة عن استخدام الموقع أو الاعتماد على محتواه بمعزل عن الاستشارة
                  الطبية المباشرة. لا تخل هذه الفقرة بالحقوق المنصوص عليها في الأنظمة المعمول
                  بها في المملكة العربية السعودية.
                </span>
                <span className="lang-en">
                  To the extent permitted by law, the clinic is not liable for indirect
                  damages resulting from use of the site or reliance on its content outside of
                  direct medical consultation. This clause does not affect rights granted under
                  applicable laws of the Kingdom of Saudi Arabia.
                </span>
              </p>
            </section>

            <section id="governing">
              <h2>
                <span className="lang-ar">9) النظام الحاكم والاختصاص</span>
                <span className="lang-en">9) Governing law &amp; jurisdiction</span>
              </h2>
              <p>
                <span className="lang-ar">
                  تخضع هذه الشروط للأنظمة المعمول بها في المملكة العربية السعودية، وتختص
                  المحاكم السعودية بالنظر في أي نزاع ينشأ عنها.
                </span>
                <span className="lang-en">
                  These terms are governed by the laws of the Kingdom of Saudi Arabia, and any
                  dispute arising from them shall be subject to the jurisdiction of the Saudi
                  courts.
                </span>
              </p>
            </section>

            <section id="changes">
              <h2>
                <span className="lang-ar">10) تعديل الشروط</span>
                <span className="lang-en">10) Changes to terms</span>
              </h2>
              <p>
                <span className="lang-ar">
                  قد يتم تعديل هذه الشروط من وقت لآخر. يسري التعديل من تاريخ نشره على الموقع،
                  ويُنصح بمراجعتها بشكل دوري.
                </span>
                <span className="lang-en">
                  These terms may be updated from time to time. Changes take effect when
                  published on the site; we recommend reviewing them periodically.
                </span>
              </p>
            </section>

            <section id="contact">
              <h2>
                <span className="lang-ar">11) التواصل بخصوص الشروط</span>
                <span className="lang-en">11) Contact regarding terms</span>
              </h2>
              <p>
                <span className="lang-ar">
                  لأي استفسار يتعلق بهذه الشروط، يمكنك مراسلتنا على{" "}
                  <a href={`mailto:${primaryEmail}`} dir="ltr">
                    {primaryEmail}
                  </a>
                  .
                </span>
                <span className="lang-en">
                  For any inquiry regarding these terms, please email{" "}
                  <a href={`mailto:${primaryEmail}`} dir="ltr">
                    {primaryEmail}
                  </a>
                  .
                </span>
              </p>
            </section>

            <p className="rv-legal-meta">
              <span className="lang-ar">{LAST_UPDATED_AR}</span>
              <span className="lang-en">{LAST_UPDATED_EN}</span>
            </p>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
