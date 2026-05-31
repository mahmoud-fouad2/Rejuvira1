"use client";

import { useActionState } from "react";

import {
  saveSettingsAction,
  type SettingsActionState,
} from "@/app/admin/settings/actions";
import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  ABOUT_PROFILE_DEFAULTS,
  ABOUT_SECTION_DEFAULTS,
} from "@/lib/about-content";
import type { SettingsGroup } from "@/lib/content-repository";

const initialState: SettingsActionState = {
  status: "idle",
  message: "",
};

const defaultAddressAr =
  "Al Takhassousi, Ar Rahmaniyyah, التخصصي, طريق الملك عبدالله";
const defaultAddressEn =
  "Al Takhassousi, Ar Rahmaniyyah, Al Takhassousi, King Abdullah Road, Riyadh";

const defaultContactFaqs = [
  {
    questionAr: "هل يجب حجز موعد مسبق؟",
    answerAr:
      "نعم، يفضّل حجز موعد مسبق لتقليل الانتظار وضمان توفر الطبيب أو الخدمة المناسبة في الوقت المطلوب.",
    questionEn: "Should I book an appointment in advance?",
    answerEn:
      "Yes. Booking ahead helps reduce waiting time and ensures the right physician or service is available.",
  },
  {
    questionAr: "ما هي أوقات العمل؟",
    answerAr:
      "يعمل المركز من السبت إلى الخميس من الساعة 2:00 مساءً إلى 10:00 مساءً.",
    questionEn: "What are the working hours?",
    answerEn:
      "The center is open Saturday to Thursday from 2:00 PM to 10:00 PM.",
  },
  {
    questionAr: "هل تتوفر متابعة بعد العلاج؟",
    answerAr:
      "نعم، يتم ترتيب المتابعة حسب خطة العلاج وتوصية الطبيب لضمان وضوح التعليمات بعد الزيارة.",
    questionEn: "Is follow-up available after treatment?",
    answerEn:
      "Yes. Follow-up is arranged according to the treatment plan and the physician's recommendation.",
  },
  {
    questionAr: "كيف أصل إلى موقع المركز؟",
    answerAr:
      "يمكنك استخدام الخريطة في صفحة التواصل أو فتح الموقع عبر خرائط Google، والعنوان موضح بصيغة مناسبة لمحركات البحث.",
    questionEn: "How can I reach the center?",
    answerEn:
      "You can use the map on the contact page or open the location in Google Maps. The address is listed clearly for navigation.",
  },
  {
    questionAr: "ما طرق الدفع المتاحة؟",
    answerAr:
      "تتوفر وسائل دفع متعددة تشمل البطاقات البنكية وبعض حلول الدفع الإلكتروني، ويمكن التأكد من التفاصيل عند الحجز.",
    questionEn: "What payment methods are available?",
    answerEn:
      "Multiple payment methods are available, including bank cards and selected digital payment options.",
  },
] as const;

function getFieldValue(
  groups: readonly SettingsGroup[],
  groupKey: string,
  fieldKey: string,
) {
  return (
    groups
      .find((group) => group.key === groupKey)
      ?.fields.find((field) => field.key === fieldKey)?.value ?? ""
  );
}

const homepageFieldGroups = [
  [
    ["heroPillLabel", "شارة الهيرو العلوية"],
    ["heroTitleAccent", "العبارة المميزة في الهيرو"],
  ],
  [["heroTitle", "عنوان الهيرو"]],
  [["heroDescription", "وصف الهيرو"]],
  [
    ["heroCtaPrimary", "زر الهيرو الأساسي"],
    ["heroCtaSecondary", "زر الهيرو الثانوي"],
  ],
  [
    ["trustEyebrow", "عنوان فرعي للثقة والاعتمادات"],
    ["trustTitle", "عنوان الثقة والاعتمادات"],
  ],
  [["trustDescription", "وصف قسم الثقة والاعتمادات"]],
  [
    ["galleryEyebrow", "عنوان فرعي لقسم الصورة المتغيرة"],
    ["galleryTitle", "عنوان قسم الصورة المتغيرة"],
  ],
  [["galleryDescription", "وصف قسم الصورة المتغيرة"]],
  [
    ["galleryItem1Image", "صورة العنصر الأول"],
    ["galleryItem1Title", "عنوان العنصر الأول"],
  ],
  [["galleryItem1Description", "وصف العنصر الأول"]],
  [
    ["galleryItem2Image", "صورة العنصر الثاني"],
    ["galleryItem2Title", "عنوان العنصر الثاني"],
  ],
  [["galleryItem2Description", "وصف العنصر الثاني"]],
  [
    ["galleryItem3Image", "صورة العنصر الثالث"],
    ["galleryItem3Title", "عنوان العنصر الثالث"],
  ],
  [["galleryItem3Description", "وصف العنصر الثالث"]],
  [
    ["quotesEyebrow", "عنوان فرعي لقسم مقولات الأطباء"],
    ["quotesTitle", "عنوان قسم مقولات الأطباء"],
  ],
  [["quotesDescription", "وصف قسم مقولات الأطباء"]],
  [
    ["testimonial1AuthorAr", "اسم العميل الأول"],
    ["testimonial1AuthorEn", "Testimonial 1 author"],
  ],
  [["testimonial1QuoteAr", "تعليق العميل الأول بالعربية"]],
  [["testimonial1QuoteEn", "Testimonial 1 quote in English"]],
  [["testimonial1Avatar", "صورة العميل الأول"]],
  [
    ["testimonial2AuthorAr", "اسم العميل الثاني"],
    ["testimonial2AuthorEn", "Testimonial 2 author"],
  ],
  [["testimonial2QuoteAr", "تعليق العميل الثاني بالعربية"]],
  [["testimonial2QuoteEn", "Testimonial 2 quote in English"]],
  [["testimonial2Avatar", "صورة العميل الثاني"]],
  [
    ["testimonial3AuthorAr", "اسم العميل الثالث"],
    ["testimonial3AuthorEn", "Testimonial 3 author"],
  ],
  [["testimonial3QuoteAr", "تعليق العميل الثالث بالعربية"]],
  [["testimonial3QuoteEn", "Testimonial 3 quote in English"]],
  [["testimonial3Avatar", "صورة العميل الثالث"]],
  [
    ["stripEyebrow", "عنوان فرعي لشريط تصفح الخدمات"],
    ["stripTitle", "عنوان شريط تصفح الخدمات"],
  ],
  [["stripDescription", "وصف شريط تصفح الخدمات"]],
] as const;

export function SettingsForm({ groups }: { groups: readonly SettingsGroup[] }) {
  const [state, formAction, isPending] = useActionState(
    saveSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="admin-settings-form grid gap-4">
      <div className="admin-form-section">
        <p className="text-ink font-semibold">قنوات التواصل الرسمية</p>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          الأرقام والبريد والعنوان المستخدم في الهيدر والفوتر وصفحة التواصل.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="phone"
          defaultValue={getFieldValue(groups, "contact", "phone")}
          placeholder="الرقم الرئيسي (مثال: 0114999959)"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
          dir="ltr"
        />
        <input
          name="phoneSecondary"
          defaultValue={getFieldValue(groups, "contact", "phoneSecondary")}
          placeholder="الرقم الموحد (مثال: 9200 17403)"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
          dir="ltr"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="email"
          type="email"
          defaultValue={getFieldValue(groups, "contact", "email")}
          placeholder="البريد الرسمي (info@rejuvera.sa)"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
          dir="ltr"
        />
        <input
          name="emailSecondary"
          type="email"
          defaultValue={getFieldValue(groups, "contact", "emailSecondary")}
          placeholder="البريد البديل (info@rejuvera.sa)"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
          dir="ltr"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="domain"
          defaultValue={getFieldValue(groups, "contact", "domain")}
          placeholder="النطاق الرسمي (rejuvera.sa)"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
          dir="ltr"
        />
        <input
          name="whatsapp"
          defaultValue={getFieldValue(groups, "contact", "whatsapp")}
          placeholder="رقم واتساب (يفضل الرقم الرئيسي)"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
          dir="ltr"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="addressAr"
          defaultValue={
            getFieldValue(groups, "contact", "addressAr") || defaultAddressAr
          }
          placeholder="العنوان بالعربية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="addressEn"
          defaultValue={
            getFieldValue(groups, "contact", "addressEn") || defaultAddressEn
          }
          placeholder="Address in English"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
          dir="ltr"
        />
      </div>
      {/* working hours block - subagent #3 */}
      <div className="admin-form-section">
        <p className="text-ink font-semibold">ساعات العمل / Working Hours</p>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          صياغة عربية وإنجليزية تظهر في الفوتر وصفحة التواصل.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="hoursWeekdays"
          defaultValue={getFieldValue(groups, "contact", "hoursWeekdays")}
          placeholder="السبت — الخميس · 2:00 م — 10:00 م"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="hoursWeekend"
          defaultValue={getFieldValue(groups, "contact", "hoursWeekend")}
          placeholder="اتركه فارغًا إن لم ترغب بعرض يوم مغلق"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="hoursWeekdaysEn"
          defaultValue={getFieldValue(groups, "contact", "hoursWeekdaysEn")}
          placeholder="Sat – Thu · 2:00 PM – 10:00 PM"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
          dir="ltr"
        />
        <input
          name="hoursWeekendEn"
          defaultValue={getFieldValue(groups, "contact", "hoursWeekendEn")}
          placeholder="Leave blank to hide closed-day text"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          dir="ltr"
        />
      </div>
      <div className="admin-form-section">
        <p className="text-ink font-semibold">
          الأسئلة الشائعة في صفحة التواصل
        </p>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          تظهر خمسة أسئلة فقط في صفحة التواصل بصياغة مختصرة ومنظمة.
        </p>
      </div>
      {defaultContactFaqs.map((faq, offset) => {
        const index = offset + 1;
        return (
          <div
            key={index}
            className="grid gap-3 rounded-[1.35rem] border border-[color:var(--rv-line)] p-3 md:grid-cols-2"
          >
            <input
              name={`faq${index}QuestionAr`}
              defaultValue={
                getFieldValue(groups, "contact", `faq${index}QuestionAr`) ||
                faq.questionAr
              }
              placeholder={`السؤال ${index} بالعربية`}
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
              required
            />
            <input
              name={`faq${index}QuestionEn`}
              defaultValue={
                getFieldValue(groups, "contact", `faq${index}QuestionEn`) ||
                faq.questionEn
              }
              placeholder={`FAQ ${index} question in English`}
              className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
              required
              dir="ltr"
            />
            <textarea
              name={`faq${index}AnswerAr`}
              defaultValue={
                getFieldValue(groups, "contact", `faq${index}AnswerAr`) ||
                faq.answerAr
              }
              placeholder={`إجابة السؤال ${index}`}
              className="border-line bg-surface text-ink focus:border-gold min-h-24 rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
              required
            />
            <textarea
              name={`faq${index}AnswerEn`}
              defaultValue={
                getFieldValue(groups, "contact", `faq${index}AnswerEn`) ||
                faq.answerEn
              }
              placeholder={`FAQ ${index} answer in English`}
              className="border-line bg-surface text-ink focus:border-gold min-h-24 rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
              required
              dir="ltr"
            />
          </div>
        );
      })}
      <div className="admin-form-section">
        <p className="text-ink font-semibold">العلامة والرسائل</p>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          الاسم، الشعار، وصف SEO، وصور الصفحات الرئيسية.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="siteName"
          defaultValue={getFieldValue(groups, "brand", "siteName")}
          placeholder="اسم العلامة الرئيسي"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="shortName"
          defaultValue={getFieldValue(groups, "brand", "shortName")}
          placeholder="الاسم المختصر"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-1">
        <input
          name="tagline"
          defaultValue={getFieldValue(groups, "brand", "tagline")}
          placeholder="العبارة التعريفية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="announcement"
          defaultValue={getFieldValue(groups, "brand", "announcement")}
          placeholder="شريط الإعلان"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="logoAlt"
          defaultValue={getFieldValue(groups, "brand", "logoAlt")}
          placeholder="النص البديل للشعار"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4">
        <textarea
          name="seoDescription"
          rows={3}
          defaultValue={getFieldValue(groups, "brand", "seoDescription")}
          placeholder="الوصف التعريفي لمحركات البحث"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="brandLogo"
          defaultValue={getFieldValue(groups, "media", "brandLogo")}
          placeholder="الشعار الرئيسي"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="brandMark"
          defaultValue={getFieldValue(groups, "media", "brandMark")}
          placeholder="أيقونة الهوية المربعة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="favicon"
          defaultValue={getFieldValue(groups, "media", "favicon")}
          placeholder="Favicon"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="appleIcon"
          defaultValue={getFieldValue(groups, "media", "appleIcon")}
          placeholder="Apple Touch Icon"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="ogImage"
          defaultValue={getFieldValue(groups, "media", "ogImage")}
          placeholder="صورة المشاركة الاجتماعية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="homeHero"
          defaultValue={getFieldValue(groups, "media", "homeHero")}
          placeholder="صورة الصفحة الرئيسية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <input
          name="heroCard1"
          defaultValue={
            getFieldValue(groups, "media", "heroCard1") ||
            "/media/hero/rejuvira-hero-1.jpg"
          }
          placeholder="صورة الهيرو الأولى"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="heroCard2"
          defaultValue={
            getFieldValue(groups, "media", "heroCard2") ||
            "/media/hero/rejuvira-hero-2.jpg"
          }
          placeholder="صورة الهيرو الثانية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="heroCard3"
          defaultValue={
            getFieldValue(groups, "media", "heroCard3") ||
            "/media/hero/rejuvira-hero-3.jpg"
          }
          placeholder="صورة الهيرو الثالثة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="doctorsHero"
          defaultValue={getFieldValue(groups, "media", "doctorsHero")}
          placeholder="صورة قسم الأطباء"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="servicesHero"
          defaultValue={getFieldValue(groups, "media", "servicesHero")}
          placeholder="صورة قسم الخدمات"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="aboutHero"
          defaultValue={getFieldValue(groups, "media", "aboutHero")}
          placeholder="صورة صفحة من نحن"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="journalHero"
          defaultValue={getFieldValue(groups, "media", "journalHero")}
          placeholder="صورة المجلة الطبية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div id="about-settings" className="admin-form-section scroll-mt-24">
        <p className="text-ink font-semibold">محتوى صفحة من نحن</p>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          كلمة CEO، المدير العام، طاقم الدكاترة، وطاقم التمريض مع صور قابلة
          للرفع والتغيير.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="aboutEyebrowAr"
          defaultValue={
            getFieldValue(groups, "about", "eyebrowAr") ||
            ABOUT_SECTION_DEFAULTS.eyebrowAr
          }
          placeholder="عنوان فرعي لقسم من نحن"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <input
          name="aboutEyebrowEn"
          defaultValue={
            getFieldValue(groups, "about", "eyebrowEn") ||
            ABOUT_SECTION_DEFAULTS.eyebrowEn
          }
          placeholder="About section eyebrow"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          dir="ltr"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          name="aboutTitleAr"
          rows={2}
          defaultValue={
            getFieldValue(groups, "about", "titleAr") ||
            ABOUT_SECTION_DEFAULTS.titleAr
          }
          placeholder="عنوان قسم القيادة والفريق"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <textarea
          name="aboutTitleEn"
          rows={2}
          defaultValue={
            getFieldValue(groups, "about", "titleEn") ||
            ABOUT_SECTION_DEFAULTS.titleEn
          }
          placeholder="Leadership section title"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          dir="ltr"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          name="aboutDescriptionAr"
          rows={3}
          defaultValue={
            getFieldValue(groups, "about", "descriptionAr") ||
            ABOUT_SECTION_DEFAULTS.descriptionAr
          }
          placeholder="وصف القسم بالعربية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <textarea
          name="aboutDescriptionEn"
          rows={3}
          defaultValue={
            getFieldValue(groups, "about", "descriptionEn") ||
            ABOUT_SECTION_DEFAULTS.descriptionEn
          }
          placeholder="Section description in English"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          dir="ltr"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {ABOUT_PROFILE_DEFAULTS.map((profile) => (
          <section
            key={profile.key}
            className="grid gap-4 rounded-[1.35rem] border border-[color:var(--rv-line)] bg-white/55 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-ink font-semibold">{profile.labelAr}</p>
                <p className="text-ink-soft text-xs">{profile.labelEn}</p>
              </div>
              <label className="admin-input flex w-auto items-center gap-2 px-3 py-2">
                <input
                  type="hidden"
                  name={`${profile.key}Visible`}
                  value="false"
                />
                <input
                  type="checkbox"
                  name={`${profile.key}Visible`}
                  value="true"
                  defaultChecked={
                    getFieldValue(groups, "about", `${profile.key}Visible`) !==
                    "false"
                  }
                />
                <span className="text-xs">إظهار</span>
              </label>
            </div>
            <ImagePicker
              name={`${profile.key}ImageUrl`}
              defaultValue={
                getFieldValue(groups, "about", `${profile.key}ImageUrl`) ||
                profile.imageUrl
              }
              namespace="media/uploads"
              label="الصورة"
              aspect={4 / 3}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name={`${profile.key}NameAr`}
                defaultValue={
                  getFieldValue(groups, "about", `${profile.key}NameAr`) ||
                  profile.nameAr
                }
                placeholder="الاسم بالعربية"
                className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
              />
              <input
                name={`${profile.key}NameEn`}
                defaultValue={
                  getFieldValue(groups, "about", `${profile.key}NameEn`) ||
                  profile.nameEn
                }
                placeholder="Name in English"
                className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
                dir="ltr"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name={`${profile.key}TitleAr`}
                defaultValue={
                  getFieldValue(groups, "about", `${profile.key}TitleAr`) ||
                  profile.titleAr
                }
                placeholder="المسمى أو العنوان بالعربية"
                className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
              />
              <input
                name={`${profile.key}TitleEn`}
                defaultValue={
                  getFieldValue(groups, "about", `${profile.key}TitleEn`) ||
                  profile.titleEn
                }
                placeholder="Title in English"
                className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
                dir="ltr"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <textarea
                name={`${profile.key}DescriptionAr`}
                rows={4}
                defaultValue={
                  getFieldValue(
                    groups,
                    "about",
                    `${profile.key}DescriptionAr`,
                  ) || profile.descriptionAr
                }
                placeholder="النص بالعربية"
                className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
              />
              <textarea
                name={`${profile.key}DescriptionEn`}
                rows={4}
                defaultValue={
                  getFieldValue(
                    groups,
                    "about",
                    `${profile.key}DescriptionEn`,
                  ) || profile.descriptionEn
                }
                placeholder="Description in English"
                className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
                dir="ltr"
              />
            </div>
          </section>
        ))}
      </div>
      <div className="admin-form-section">
        <p className="text-ink font-semibold">الصفحة الرئيسية</p>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          نصوص وصور الهيرو والأقسام الرئيسية في الصفحة الأولى.
        </p>
      </div>
      {homepageFieldGroups.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid gap-4 ${row.length > 1 ? "md:grid-cols-2" : ""}`}
        >
          {row.map(([fieldKey, placeholder]) => {
            const isDescription = fieldKey
              .toLowerCase()
              .includes("description");
            const isTitle = fieldKey.toLowerCase().includes("title");

            if (isDescription || fieldKey === "heroDescription") {
              return (
                <textarea
                  key={fieldKey}
                  name={fieldKey}
                  rows={fieldKey === "heroDescription" ? 4 : 3}
                  defaultValue={getFieldValue(groups, "homepage", fieldKey)}
                  placeholder={placeholder}
                  className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
                  required
                />
              );
            }

            return (
              <input
                key={fieldKey}
                name={fieldKey}
                defaultValue={getFieldValue(groups, "homepage", fieldKey)}
                placeholder={placeholder}
                className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
                required={
                  isTitle ||
                  fieldKey.toLowerCase().includes("image") ||
                  fieldKey.toLowerCase().includes("eyebrow")
                }
              />
            );
          })}
        </div>
      ))}
      <div className="admin-form-section">
        <p className="text-ink font-semibold">قنوات التواصل الاجتماعي</p>
        <p className="text-ink-soft mt-2 text-sm leading-7">
          الروابط التي تظهر في تذييل الصفحة. اتركها فارغة لإخفاء الأيقونة.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="socialInstagram"
          defaultValue={getFieldValue(groups, "social", "instagram")}
          placeholder="Instagram — رابط الحساب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <input
          name="socialTwitter"
          defaultValue={getFieldValue(groups, "social", "twitter")}
          placeholder="Twitter / X — رابط الحساب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="socialSnapchat"
          defaultValue={getFieldValue(groups, "social", "snapchat")}
          placeholder="Snapchat — رابط الحساب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <input
          name="socialTiktok"
          defaultValue={getFieldValue(groups, "social", "tiktok")}
          placeholder="TikTok — رابط الحساب"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="socialYoutube"
          defaultValue={getFieldValue(groups, "social", "youtube")}
          placeholder="YouTube — رابط القناة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
        <input
          name="socialLinkedin"
          defaultValue={getFieldValue(groups, "social", "linkedin")}
          placeholder="LinkedIn — رابط الصفحة"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        />
      </div>
      {state.message ? (
        <p
          className={`text-sm ${state.status === "success" ? "text-emerald" : "text-burgundy"}`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.15rem] px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </form>
  );
}
