"use client";

import { useEffect } from "react";

const textMap: Record<string, string> = {
  "لوحة الإدارة": "Admin Panel",
  "إدارة Rejuvira": "Rejuvira Admin",
  "لا توجد تنبيهات حرجة": "No critical alerts",
  "زيارة الموقع": "View Site",
  الموقع: "Site",
  الصور: "Media",
  "جلسة نشطة": "Active session",
  "لوحة تشغيل واضحة للمحتوى والطلبات والصور": "A clear command center for content, leads, and media",
  "ابدأ من الطلبات، أو حدّث محتوى الموقع، أو ارفع الصور من الميديا بدون البحث داخل صفحات طويلة.": "Start with leads, update site content, or upload media without digging through long pages.",
  "طلبات ومتابعة": "Leads and follow-up",
  "محتوى الموقع": "Website content",
  "صور وهوية": "Media and brand",
  الأطباء: "Doctors",
  الخدمات: "Services",
  الطلبات: "CRM",
  الأجهزة: "Devices",
  "إدارة القسم ←": "Manage section",
  "مسار الطلبات": "Lead pipeline",
  "فتح CRM": "Open CRM",
  جديد: "New",
  "تم التواصل": "Contacted",
  متابعة: "Follow-up",
  محجوز: "Booked",
  مغلق: "Closed",
  "مناطق العمل": "Work areas",
  المحتوى: "Content",
  "الأطباء، الخدمات، الأجهزة، المجلة": "Doctors, services, devices, journal",
  "الميديا والمعرض وصور الصفحات": "Media, gallery, page images",
  "CRM، السجلات، الصيانة، المستخدمون": "CRM, logs, maintenance, users",
  "الصفحات الأكثر زيارة": "Top pages",
  "مصادر الزيارات": "Traffic sources",
  "اختصارات الإدارة": "Admin shortcuts",
  "فتح القسم": "Open section",
  الرئيسية: "Dashboard",
  المعرض: "Gallery",
  المجلة: "Journal",
  الميديا: "Media",
  السجلات: "Logs",
  الصيانة: "Maintenance",
  المستخدمون: "Users",
  الإعدادات: "Settings",
  "نظرة عامة": "Overview",
  العمليات: "Operations",
  "إعدادات الموقع": "Site settings",
  "نقطة واحدة لتحديث بيانات التواصل، الهوية، صور الصفحات، SEO، التكاملات، وروابط السوشيال.": "One place to update contact data, brand, page images, SEO, integrations, and social links.",
  "تحرير الإعدادات": "Edit settings",
  "الحفظ ينعكس مباشرة على الواجهة العامة.": "Saved changes apply directly to the public site.",
  "أين أعدل الصور؟": "Where do I edit images?",
  "ارفع صورة من صفحة الميديا، ثم استخدم الرابط في حقول الصور داخل هذا النموذج.": "Upload an image from Media, then use its URL in this form's image fields.",
  "فتح الميديا": "Open Media",
  "أقسام النموذج": "Form sections",
  "قنوات التواصل الرسمية": "Official contact channels",
  "الأرقام والبريد والعنوان المستخدم في الهيدر والفوتر وصفحة التواصل.": "Phone, email, and address used in the header, footer, and contact page.",
  "ساعات العمل / Working Hours": "Working hours",
  "صياغة عربية وإنجليزية تظهر في الفوتر وصفحة التواصل.": "Arabic and English wording shown in the footer and contact page.",
  "الأسئلة الشائعة في صفحة التواصل": "Contact page FAQs",
  "تظهر خمسة أسئلة فقط في صفحة التواصل بصياغة مختصرة ومنظمة.": "Five concise FAQs are shown on the contact page.",
  "العلامة والرسائل": "Brand and messaging",
  "الاسم، الشعار، وصف SEO، وصور الصفحات الرئيسية.": "Name, logo, SEO description, and key page images.",
  "الصفحة الرئيسية": "Homepage",
  "نصوص وصور الهيرو والأقسام الرئيسية في الصفحة الأولى.": "Hero and main homepage section copy and images.",
  "قنوات التواصل الاجتماعي": "Social channels",
  "الروابط التي تظهر في تذييل الصفحة. اتركها فارغة لإخفاء الأيقونة.": "Links shown in the footer. Leave blank to hide an icon.",
  "حفظ الإعدادات": "Save settings",
  "جاري الحفظ...": "Saving...",
  "الصور والأصول": "Media and assets",
  "ارفع صورة جديدة، ثم انسخ الرابط لاستخدامه في الإعدادات أو صفحات الأطباء والخدمات والمعرض.": "Upload a new image, then copy its URL for settings, doctors, services, or gallery pages.",
  "رفع صورة جديدة": "Upload a new image",
  "بعد الرفع سيظهر الرابط في الحقل. انسخه وضعه في إعدادات الصور أو نموذج الطبيب/الخدمة/المعرض.": "After upload, the URL appears in the field. Copy it into the relevant settings or editor form.",
  "تعديل وحذف الصور": "Edit and delete images",
  "صور الصفحات": "Page images",
  "الإعدادات ← حقول الصور": "Settings -> image fields",
  "إضافة / تعديل / حذف": "Add / edit / delete",
  "صور الأطباء": "Doctor images",
  "داخل نموذج الطبيب": "Inside the doctor form",
  "الموضع الحالي": "Current slot",
  "الشعار الرئيسي": "Main logo",
  "أيقونة الهوية": "Brand mark",
  "صورة المشاركة الاجتماعية": "Social sharing image",
  "قسم الأطباء": "Doctors section",
  "قسم الخدمات": "Services section",
  "من نحن": "About",
  "المجلة الطبية": "Medical journal",
  "عدد الملفات:": "Files:",
  "التصنيفات:": "Categories:",
  "رفع ملف إلى R2": "Upload to R2",
  "جارٍ الرفع...": "Uploading...",
  معاينة: "Preview",
};

const placeholderMap: Record<string, string> = {
  "الرقم الرئيسي (مثال: 0114999959)": "Primary phone (example: 0114999959)",
  "الرقم الموحد (مثال: 9200 17403)": "Unified phone (example: 9200 17403)",
  "البريد الرسمي (info@rejuveracenter.sa)": "Official email (info@rejuveracenter.sa)",
  "البريد البديل (info@rejuveracenter.sa)": "Secondary email (info@rejuveracenter.sa)",
  "النطاق الرسمي (rejuveracenter.sa)": "Official domain (rejuveracenter.sa)",
  "رقم واتساب (يفضل الرقم الرئيسي)": "WhatsApp number (prefer primary phone)",
  "العنوان بالعربية": "Address in Arabic",
  "الشعار الرئيسي": "Main logo",
  "أيقونة الهوية المربعة": "Square brand mark",
  "صورة المشاركة الاجتماعية": "Social sharing image",
  "صورة الصفحة الرئيسية": "Homepage image",
  "صورة الهيرو الأولى": "Hero image 1",
  "صورة الهيرو الثانية": "Hero image 2",
  "صورة الهيرو الثالثة": "Hero image 3",
  "صورة قسم الأطباء": "Doctors page image",
  "صورة قسم الخدمات": "Services page image",
  "صورة صفحة من نحن": "About page image",
  "صورة المجلة الطبية": "Journal page image",
  "اسم العلامة الرئيسي": "Main brand name",
  "الاسم المختصر": "Short name",
  "العبارة التعريفية": "Tagline",
  "شريط الإعلان": "Announcement bar",
  "النص البديل للشعار": "Logo alt text",
  "الوصف التعريفي لمحركات البحث": "SEO meta description",
  "سيظهر رابط الصورة هنا بعد الرفع": "The image URL will appear here after upload",
};

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function translateTextNodes(root: ParentNode, lang: "ar" | "en") {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, textarea")) continue;
    const original = parent.dataset.adminOriginalText ?? node.textContent ?? "";
    const trimmed = normalize(original);
    if (!trimmed) continue;
    if (!parent.dataset.adminOriginalText) parent.dataset.adminOriginalText = original;

    if (lang === "en") {
      const translated = textMap[trimmed];
      if (translated) node.textContent = original.replace(trimmed, translated);
    } else {
      node.textContent = parent.dataset.adminOriginalText;
    }
  }
}

function translateAttributes(root: ParentNode, lang: "ar" | "en") {
  const elements = Array.from(root.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]"));
  for (const element of elements) {
    for (const attr of ["placeholder", "aria-label", "title"] as const) {
      const value = element.getAttribute(attr);
      if (!value) continue;
      const dataKey = `adminOriginal${attr.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase())}`;
      const dataset = element.dataset as Record<string, string | undefined>;
      const original = dataset[dataKey] ?? value;
      if (!dataset[dataKey]) dataset[dataKey] = original;
      element.setAttribute(attr, lang === "en" ? placeholderMap[original] ?? textMap[normalize(original)] ?? original : original);
    }
  }
}

export function AdminLanguageBridge() {
  useEffect(() => {
    const root = document.querySelector(".admin-app");
    if (!root) return;

    const apply = () => {
      const lang = document.documentElement.dataset.lang === "en" ? "en" : "ar";
      translateTextNodes(root, lang);
      translateAttributes(root, lang);
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true });

    const htmlObserver = new MutationObserver(apply);
    htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang", "lang"] });

    return () => {
      observer.disconnect();
      htmlObserver.disconnect();
    };
  }, []);

  return null;
}
