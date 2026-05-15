"use client";

import { useEffect } from "react";

// Most admin UI now ships bilingual <span class="lang-ar">/<span class="lang-en">.
// This bridge only handles a few legacy texts that still come from upstream
// components or user-generated labels we don't control. Keep it minimal.
const textMap: Record<string, string> = {
  "لوحة التحكم": "Admin",
  "إدارة المعرض — Rejuvira Admin": "Gallery management — Rejuvira Admin",
  "+ إضافة حالة جديدة": "+ Add a new case",
  "تعديل البيانات": "Edit details",
  "لا توجد حالات بعد.": "No cases yet.",
  "استخدم النموذج أعلاه لإضافة أول حالة.": "Use the form above to add your first case.",
  "حالة منشورة": "Published",
  حذف: "Delete",
  "هل أنت متأكد من الحذف؟": "Are you sure you want to delete?",
  "العنوان *": "Title *",
  "الرابط (slug) *": "Slug (URL key) *",
  "التصنيف *": "Category *",
  "الوصف *": "Description *",
  "صورة قبل": "Before image",
  "صورة بعد": "After image",
  "مسار الصورة *": "Image URL *",
  "النص البديل (alt) — لمحركات البحث *": "Alt text (SEO) *",
  "موضع المقارنة الافتراضي": "Default comparison position",
  "حفظ التعديلات": "Save changes",
  "إضافة صورة": "Add image",
  إلغاء: "Cancel",
  "جاري الحفظ...": "Saving...",
  "تم الحفظ بنجاح.": "Saved.",
  "تم الحذف.": "Deleted.",
};

const placeholderMap: Record<string, string> = {
  "مثال: علاج تصبغات الوجه": "Example: facial pigmentation treatment",
  "facial-pigmentation": "facial-pigmentation",
  "مثال: تجديد البشرة": "Example: skin renewal",
  "وصف مختصر للحالة والنتيجة...": "Short description of case and outcome...",
  "/media/gallery/before-1.jpg": "/media/gallery/before-1.jpg",
  "/media/gallery/after-1.jpg": "/media/gallery/after-1.jpg",
  "قبل علاج تصبغات الوجه - مريضة": "Before pigmentation treatment - patient",
  "بعد علاج تصبغات الوجه - نتيجة واضحة": "After pigmentation treatment - clear result",
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
    if (!parent) continue;
    if (parent.closest("script, style, textarea")) continue;
    // Skip elements that are already bilingual via lang-ar/lang-en spans.
    if (parent.classList.contains("lang-ar") || parent.classList.contains("lang-en")) continue;
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
  const elements = Array.from(
    root.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]"),
  );
  for (const element of elements) {
    for (const attr of ["placeholder", "aria-label", "title"] as const) {
      const value = element.getAttribute(attr);
      if (!value) continue;
      const dataKey = `adminOriginal${attr.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase())}`;
      const dataset = element.dataset as Record<string, string | undefined>;
      const original = dataset[dataKey] ?? value;
      if (!dataset[dataKey]) dataset[dataKey] = original;
      element.setAttribute(
        attr,
        lang === "en"
          ? (placeholderMap[original] ?? textMap[normalize(original)] ?? original)
          : original,
      );
    }
  }
}

export function AdminLanguageBridge() {
  useEffect(() => {
    const root = document.querySelector(".admin-shell");
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
    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang", "lang"],
    });

    return () => {
      observer.disconnect();
      htmlObserver.disconnect();
    };
  }, []);

  return null;
}
