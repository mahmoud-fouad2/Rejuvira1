import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getRuntimeSettings } from "@/lib/content-repository";

export const revalidate = 600;

const LAST_UPDATED_AR = "آخر تحديث: 14 مايو 2026";
const LAST_UPDATED_EN = "Last updated: May 14, 2026";

const sections = [
  {
    id: "scope",
    ar: "نطاق هذه السياسة",
    en: "Scope of this policy",
  },
  {
    id: "data",
    ar: "البيانات التي نجمعها",
    en: "Data we collect",
  },
  {
    id: "purposes",
    ar: "أغراض المعالجة",
    en: "Purposes of processing",
  },
  {
    id: "legal-basis",
    ar: "الأساس النظامي والامتثال",
    en: "Legal basis & compliance (PDPL — KSA)",
  },
  {
    id: "retention",
    ar: "مدة الاحتفاظ",
    en: "Retention",
  },
  {
    id: "sharing",
    ar: "المعالجون والمزودون",
    en: "Processors & service providers",
  },
  {
    id: "cookies",
    ar: "ملفات الكوكيز",
    en: "Cookies",
  },
  {
    id: "rights",
    ar: "حقوقك",
    en: "Your rights",
  },
  {
    id: "security",
    ar: "إجراءات الأمان",
    en: "Security measures",
  },
  {
    id: "changes",
    ar: "تحديث السياسة",
    en: "Updates to this policy",
  },
  {
    id: "contact",
    ar: "التواصل بخصوص الخصوصية",
    en: "Contact for privacy requests",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getRuntimeSettings();
  const url = `https://${settings.contact.domain || "rejuveracenter.sa"}/privacy`;
  return {
    title: "سياسة الخصوصية | Privacy Policy",
    description:
      "سياسة الخصوصية لمركز ريجوفيرا تشرح كيف نجمع البيانات ونعالجها ونحميها، وحقوقك بموجب نظام حماية البيانات الشخصية في المملكة العربية السعودية.",
    alternates: { canonical: url },
    openGraph: {
      title: "سياسة الخصوصية — Rejuvira Center",
      description:
        "كيف يجمع مركز ريجوفيرا البيانات، ولماذا، ولكم من الوقت، والإطار النظامي الذي يحكم ذلك.",
      url,
      type: "article",
      locale: "ar_SA",
    },
    twitter: {
      card: "summary",
      title: "سياسة الخصوصية — Rejuvira Center",
      description: "بيانات الزائر، الكوكيز، ومزودو الخدمة المعتمدون.",
    },
  };
}

export default async function PrivacyPage() {
  const settings = await getRuntimeSettings();
  const primaryEmail = settings.contact.email;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />

      <main className="rv-legal-shell" lang="ar">
        <div className="rv-legal-grid">
          {/* TOC (sidebar on lg) */}
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

          {/* Article */}
          <article className="rv-legal-prose">
            <header>
              <p className="eyebrow text-ink-soft">
                <span className="lang-ar">المستندات النظامية</span>
                <span className="lang-en">Legal documents</span>
              </p>
              <h1>
                <span className="lang-ar">سياسة الخصوصية</span>
                <span className="lang-en">Privacy Policy</span>
              </h1>
              <p className="rv-legal-lead">
                <span className="lang-ar">
                  نلتزم في مركز {settings.brand.siteName} بحماية خصوصية الزائرين
                  والمراجعين، والامتثال لأنظمة حماية البيانات في المملكة العربية
                  السعودية، بما يضمن مسار رعاية واضح وآمن من أول تواصل حتى ما
                  بعد الزيارة.
                </span>
                <span className="lang-en">
                  At {settings.brand.siteName} we take the privacy of visitors
                  and patients seriously, and we comply with applicable
                  data-protection rules in the Kingdom of Saudi Arabia to keep
                  your care journey clear and safe — from the first inquiry
                  through follow-up.
                </span>
              </p>
            </header>

            <section id="scope">
              <h2>
                <span className="lang-ar">1) نطاق هذه السياسة</span>
                <span className="lang-en">1) Scope</span>
              </h2>
              <p>
                <span className="lang-ar">
                  تنطبق هذه السياسة على جميع البيانات الشخصية التي يتم جمعها أو
                  معالجتها عبر موقع{" "}
                  {settings.contact.domain || "rejuveracenter.sa"}، النماذج
                  الإلكترونية، قنوات الحجز، وأنظمة المتابعة السرّية التي يُدار
                  بها المركز بتشفير وفصل الصلاحيات.
                </span>
                <span className="lang-en">
                  This policy covers personal data gathered through{" "}
                  {settings.contact.domain || "rejuveracenter.sa"}, our digital
                  intake forms, booking channels, and the secure coordination
                  workflows our clinical team relies on.
                </span>
              </p>
            </section>

            <section id="data">
              <h2>
                <span className="lang-ar">2) البيانات التي نجمعها</span>
                <span className="lang-en">2) Data we collect</span>
              </h2>
              <ul>
                <li>
                  <span className="lang-ar">
                    بيانات الاتصال (الاسم، رقم الهاتف، البريد الإلكتروني) عند
                    تعبئة نموذج الحجز أو التواصل.
                  </span>
                  <span className="lang-en">
                    Contact details (name, phone, email) when you submit a
                    booking or contact form.
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    تفضيلات الخدمة، اللغة المفضلة، وملاحظات قصيرة تساعد الفريق
                    على التحضير للاستشارة.
                  </span>
                  <span className="lang-en">
                    Service preference, preferred language, and brief notes that
                    help us prepare the consultation.
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    بيانات تشغيلية أساسية (الجهاز، المتصفح، صفحات الزيارة)
                    لأغراض الأمان وتحسين تجربة الموقع.
                  </span>
                  <span className="lang-en">
                    Basic analytics (device, browser, visited pages) for
                    security and to improve the site experience.
                  </span>
                </li>
              </ul>
            </section>

            <section id="purposes">
              <h2>
                <span className="lang-ar">3) أغراض المعالجة</span>
                <span className="lang-en">3) Purposes of processing</span>
              </h2>
              <ul>
                <li>
                  <span className="lang-ar">
                    الرد على طلبات الحجز والاستشارات وتنظيم المتابعة المناسبة
                    لكل حالة.
                  </span>
                  <span className="lang-en">
                    Responding to booking and consultation requests and
                    organizing appropriate follow-up.
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    تحسين جودة الخدمة، قياس الأداء التشغيلي، وضمان زمن استجابة
                    مناسب.
                  </span>
                  <span className="lang-en">
                    Improving service quality, measuring operational
                    performance, and ensuring an appropriate response time.
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    الالتزام بالاشتراطات النظامية والصحية ذات العلاقة.
                  </span>
                  <span className="lang-en">
                    Meeting applicable regulatory and healthcare requirements.
                  </span>
                </li>
              </ul>
            </section>

            <section id="legal-basis">
              <h2>
                <span className="lang-ar">
                  4) الأساس النظامي والامتثال (PDPL)
                </span>
                <span className="lang-en">
                  4) Legal basis &amp; PDPL compliance
                </span>
              </h2>
              <p>
                <span className="lang-ar">
                  تعتمد المعالجة على الموافقة التي تمنحينها عند إرسال البيانات،
                  وعلى المصلحة المشروعة لإدارة العمليات وتقديم الرعاية، وذلك بما
                  لا يتعارض مع نظام حماية البيانات الشخصية في المملكة العربية
                  السعودية ولوائحه التنفيذية.
                </span>
                <span className="lang-en">
                  Processing is based on the consent you provide when submitting
                  your data, and on the legitimate interest of operating the
                  clinic and delivering care, in alignment with the Saudi
                  Personal Data Protection Law (PDPL) and its implementing
                  regulations.
                </span>
              </p>
            </section>

            <section id="retention">
              <h2>
                <span className="lang-ar">5) مدة الاحتفاظ</span>
                <span className="lang-en">5) Retention</span>
              </h2>
              <p>
                <span className="lang-ar">
                  نحتفظ ببيانات الحجز والمراسلات للمدة المنصوص عليها في
                  الاشتراطات الصحية والمحاسبية ذات العلاقة، وبما لا يتجاوز ما هو
                  ضروري لتحقيق الأغراض المذكورة في هذه السياسة. تُحذف البيانات
                  أو يتم إخفاء هويتها بعد انقضاء المدة.
                </span>
                <span className="lang-en">
                  Booking data and correspondence are retained for the periods
                  required by applicable healthcare and accounting rules, and no
                  longer than necessary for the purposes described above. Data
                  is then deleted or anonymized.
                </span>
              </p>
            </section>

            <section id="sharing">
              <h2>
                <span className="lang-ar">6) المعالجون والمزودون</span>
                <span className="lang-en">
                  6) Processors &amp; service providers
                </span>
              </h2>
              <p>
                <span className="lang-ar">
                  لا نبيع بياناتك ولا نشاركها لأغراض تسويقية مع أطراف ثالثة. قد
                  تتم الاستعانة بمزودين تشغيليين معتمدين لمعالجة أجزاء فنية من
                  الخدمة، بما في ذلك:
                </span>
                <span className="lang-en">
                  We do not sell your data and do not share it with third
                  parties for marketing. We may use approved operational
                  providers to deliver technical parts of the service,
                  including:
                </span>
              </p>
              <ul>
                <li>
                  <span className="lang-ar">
                    استضافة قاعدة البيانات عبر مزود سحابي معتمد (مثل Neon —
                    حماية تشفيرية وفصل منطقي للبيانات).
                  </span>
                  <span className="lang-en">
                    Database hosting via a reputable cloud provider (e.g. Neon —
                    encryption in transit and logical isolation).
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    تخزين الصور والمحتوى عبر مزود تخزين عام (مثل Cloudflare R2)
                    مع ضبط الصلاحيات.
                  </span>
                  <span className="lang-en">
                    Object storage for media via a public cloud provider (e.g.
                    Cloudflare R2) with appropriate access controls.
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    حماية النماذج من إساءة الاستخدام عبر خدمة reCAPTCHA من
                    Google.
                  </span>
                  <span className="lang-en">
                    Spam/bot protection on forms via Google reCAPTCHA.
                  </span>
                </li>
              </ul>
            </section>

            <section id="cookies">
              <h2>
                <span className="lang-ar">7) ملفات الكوكيز</span>
                <span className="lang-en">7) Cookies</span>
              </h2>
              <p>
                <span className="lang-ar">
                  نستخدم كوكيز أساسية لتشغيل الموقع (مثل تفضيل اللغة والثيم)،
                  وأخرى إحصائية مجمّعة لفهم استخدام الصفحات وتحسينها. يمكنك
                  التحكم في الكوكيز من إعدادات المتصفح.
                </span>
                <span className="lang-en">
                  We use essential cookies to operate the site (language/theme
                  preferences) and aggregated analytics cookies to understand
                  and improve usage. You can manage cookies from your browser
                  settings.
                </span>
              </p>
            </section>

            <section id="rights">
              <h2>
                <span className="lang-ar">8) حقوقك</span>
                <span className="lang-en">8) Your rights</span>
              </h2>
              <ul>
                <li>
                  <span className="lang-ar">
                    الوصول إلى بياناتك أو تصحيحها.
                  </span>
                  <span className="lang-en">Access or correct your data.</span>
                </li>
                <li>
                  <span className="lang-ar">
                    سحب الموافقة أو حذف البيانات وفق الإطار النظامي.
                  </span>
                  <span className="lang-en">
                    Withdraw consent or request deletion within the legal
                    framework.
                  </span>
                </li>
                <li>
                  <span className="lang-ar">
                    الاعتراض على معالجة معينة أو طلب نقل البيانات.
                  </span>
                  <span className="lang-en">
                    Object to specific processing or request portability.
                  </span>
                </li>
              </ul>
            </section>

            <section id="security">
              <h2>
                <span className="lang-ar">9) إجراءات الأمان</span>
                <span className="lang-en">9) Security measures</span>
              </h2>
              <p>
                <span className="lang-ar">
                  نطبق ضوابط فنية وإدارية لحماية البيانات تشمل التشفير أثناء
                  النقل، التحكم في الصلاحيات، وفصل بيانات التشغيل عن بيانات
                  الإدارة، مع مراجعة دورية للسجلات.
                </span>
                <span className="lang-en">
                  We apply technical and organizational measures including
                  encryption in transit, role-based access control, separation
                  of operational and admin data, and periodic log reviews.
                </span>
              </p>
            </section>

            <section id="changes">
              <h2>
                <span className="lang-ar">10) تحديث السياسة</span>
                <span className="lang-en">10) Updates to this policy</span>
              </h2>
              <p>
                <span className="lang-ar">
                  قد نقوم بتحديث هذه السياسة من وقت لآخر بما يتوافق مع تطور
                  الخدمة أو الاشتراطات النظامية. سيُحدَّث تاريخ المراجعة في أعلى
                  الصفحة.
                </span>
                <span className="lang-en">
                  We may update this policy as the service evolves or as rules
                  change. The revision date will be updated at the top of the
                  page.
                </span>
              </p>
            </section>

            <section id="contact">
              <h2>
                <span className="lang-ar">11) التواصل بخصوص الخصوصية</span>
                <span className="lang-en">
                  11) Contact for privacy requests
                </span>
              </h2>
              <p>
                <span className="lang-ar">
                  لأي استفسار أو طلب يتعلق بهذه السياسة، يمكنك مراسلتنا على{" "}
                  <a href={`mailto:${primaryEmail}`} dir="ltr">
                    {primaryEmail}
                  </a>
                  .
                </span>
                <span className="lang-en">
                  For any privacy inquiry, please email{" "}
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
