/** Whole sentences of stored CMS copy that read as paperwork, in public text only. */
const COPY_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  [
    "إضافة صور المركز داخل الصفحة تساعد الزائر على تكوين انطباع أوضح عن المكان قبل الحجز.",
    "تعرّف على بيئة المركز قبل زيارتك، وتواصل معنا لمعرفة تفاصيل الموقع والحجز.",
  ],
  [
    "إرسال الطلب لا يثبت الموعد تلقائيًا؛ يتواصل فريق ريجوفيرا لتأكيد الموعد وفق التوفر.",
    "سيتواصل معك فريق ريجوفيرا لتنسيق الموعد الأنسب لك.",
  ],
  [
    "إرسال الطلب لا يثبت الموعد تلقائيًا؛ يؤكده الفريق بعد التواصل.",
    "سيتواصل معك فريق ريجوفيرا لتنسيق الموعد الأنسب لك.",
  ],
  ["إرسال الطلب لا يعني تأكيد الموعد أو ملاءمة أي إجراء. ", ""],
  ["؛ وصف أفضل أو أحسن وحده لا يحدد الطبيب المناسب.", "."],
  ["العنوان وساعات العمل", "العنوان وطرق التواصل"],
];

/** Foreign health-information sites: an ad landing keeps visitors on the clinic's pages. */
const REFERENCE_HOSTS =
  "(?:[a-z0-9-]+\\.)*(?:plasticsurgery\\.org|mayoclinic\\.org|nhs\\.uk|niddk\\.nih\\.gov|nih\\.gov|cancer\\.gov|aad\\.org|cdc\\.gov|who\\.int|webmd\\.com|healthline\\.com|ncbi\\.nlm\\.nih\\.gov)";
const REFERENCE_ANCHOR = new RegExp(
  `<a\\b[^>]*\\bhref=["']https?://${REFERENCE_HOSTS}[/"'?#][^>]*>`,
  "i",
);

/** Drops "reading list" paragraphs and any remaining anchors that lead to those sites. */
export function stripExternalReferenceLinks(html: string) {
  return html
    .split(
      /(<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>)/gi,
    )
    .map((part) => {
      if (/^<(?:script|style)\b/i.test(part)) return part;
      return part
        .replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, (paragraph) =>
          REFERENCE_ANCHOR.test(paragraph) ? "" : paragraph,
        )
        .replace(
          new RegExp(`${REFERENCE_ANCHOR.source}[\\s\\S]*?</a>`, "gi"),
          "",
        );
    })
    .join("");
}

/** Public landing-page copy only. Replaces stored paperwork-style sentences and removes
 * foreign reference links. Stored CMS HTML, form fields, attributes and executable
 * integrations stay intact; the replacements touch text nodes only. */
export function publicEditorialCopy(html: string) {
  const replaced = html
    .split(
      /(<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<[^>]+>)/gi,
    )
    .map((part) =>
      part.startsWith("<")
        ? part
        : COPY_REPLACEMENTS.reduce(
            (text, [from, to]) => text.replaceAll(from, to),
            part,
          ),
    )
    .join("");
  return stripExternalReferenceLinks(replaced);
}
