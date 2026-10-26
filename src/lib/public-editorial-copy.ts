/** Replace the verified internal design note in public landing-page text only.
 * Stored CMS HTML, form fields, attributes and executable integrations stay intact. */
export function publicEditorialCopy(html: string) {
  return html
    .split(
      /(<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<[^>]+>)/gi,
    )
    .map((part) =>
      part.startsWith("<")
        ? part
        : part.replaceAll(
            "إضافة صور المركز داخل الصفحة تساعد الزائر على تكوين انطباع أوضح عن المكان قبل الحجز.",
            "تعرّف على بيئة المركز قبل زيارتك، وتواصل معنا لمعرفة تفاصيل الموقع والحجز.",
          ),
    )
    .join("");
}
