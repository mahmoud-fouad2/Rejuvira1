"use client";

import { useEffect } from "react";

// Most admin UI ships bilingual <span class="lang-ar">/<span class="lang-en">.
// This bridge only translates a tiny set of legacy strings that come from
// upstream Arabic-only components / user-generated content. It is intentionally
// minimal — every text node is fingerprinted in a per-node WeakMap so we never
// concatenate sibling text nodes (the previous bug caused options like
// "الكل / All" to render as "الكلالكلالكل" because three text nodes shared a
// single parent dataset entry).

const textMap: Record<string, string> = {
  "لوحة التحكم": "Admin",
  "إدارة المعرض — Rejuvera Admin": "Gallery management — Rejuvera Admin",
  "+ إضافة حالة جديدة": "+ Add a new case",
  "تعديل البيانات": "Edit details",
  "لا توجد حالات بعد.": "No cases yet.",
  "استخدم النموذج أعلاه لإضافة أول حالة.":
    "Use the form above to add your first case.",
  "حالة منشورة": "Published",
  حذف: "Delete",
  "هل أنت متأكد من الحذف؟": "Are you sure you want to delete?",
  "حفظ التعديلات": "Save changes",
  "إضافة صورة": "Add image",
  إلغاء: "Cancel",
  "جاري الحفظ...": "Saving...",
  "تم الحفظ بنجاح.": "Saved.",
  "تم الحذف.": "Deleted.",
};

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

// Per-text-node original storage. Solves the multi-text-node-per-parent bug.
const originalByNode = new WeakMap<Text, string>();

const SKIP_ANCESTOR = "script, style, textarea, select, option";

function translateTextNodes(root: ParentNode, lang: "ar" | "en") {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent) continue;
    if (parent.closest(SKIP_ANCESTOR)) continue;
    // Skip pre-bilingual spans entirely; they are managed by CSS.
    if (
      parent.classList.contains("lang-ar") ||
      parent.classList.contains("lang-en")
    )
      continue;

    const stored = originalByNode.get(node);
    const current = node.textContent ?? "";
    const original = stored ?? current;
    if (!stored) originalByNode.set(node, original);

    const trimmed = normalize(original);
    if (!trimmed) continue;

    const target =
      lang === "en"
        ? textMap[trimmed]
          ? original.replace(trimmed, textMap[trimmed]!)
          : original
        : original;

    if (node.textContent !== target) {
      node.textContent = target;
    }
  }
}

const placeholderMap: Record<string, string> = {
  "مثال: علاج تصبغات الوجه": "Example: facial pigmentation treatment",
  "مثال: تجديد البشرة": "Example: skin renewal",
  "وصف مختصر للحالة والنتيجة...": "Short description of case and outcome...",
  "قبل علاج تصبغات الوجه - مريضة": "Before pigmentation treatment - patient",
  "بعد علاج تصبغات الوجه - نتيجة واضحة":
    "After pigmentation treatment - clear result",
};

const originalAttrByElement = new WeakMap<
  HTMLElement,
  Partial<Record<"placeholder" | "aria-label" | "title", string>>
>();

function translateAttributes(root: ParentNode, lang: "ar" | "en") {
  const elements = Array.from(
    root.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]"),
  );
  for (const element of elements) {
    let bag = originalAttrByElement.get(element);
    if (!bag) {
      bag = {};
      originalAttrByElement.set(element, bag);
    }
    for (const attr of ["placeholder", "aria-label", "title"] as const) {
      const value = element.getAttribute(attr);
      if (value === null) continue;
      if (bag[attr] === undefined) bag[attr] = value;
      const original = bag[attr]!;
      const desired =
        lang === "en"
          ? (placeholderMap[original] ??
            textMap[normalize(original)] ??
            original)
          : original;
      if (value !== desired) element.setAttribute(attr, desired);
    }
  }
}

export function AdminLanguageBridge() {
  useEffect(() => {
    const root = document.querySelector(".admin-shell");
    if (!root) return;

    let scheduled = false;
    let muted = false;

    const apply = () => {
      const lang = document.documentElement.dataset.lang === "en" ? "en" : "ar";
      muted = true;
      translateTextNodes(root, lang);
      translateAttributes(root, lang);
      // Allow other mutations to settle before listening again.
      queueMicrotask(() => {
        muted = false;
      });
    };

    const schedule = () => {
      if (scheduled || muted) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        apply();
      });
    };

    apply();
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const htmlObserver = new MutationObserver(schedule);
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
