# REJUVERA — Dead Code Report

> تصنيف: **Confirmed dead** / **Probably unused (يتطلب تحقّق runtime)** / **Active** / **Legacy required**.
> لم يُحذف أي شيء. لم تُشغَّل أدوات static analysis آلية بعد (تجنّب لمس `npm`)؛ النتائج من فحص grep + المراجع.

## Confirmed dead — لا شيء مؤكد حتى الآن
لم يُرصد ملف/تبعية ميتة **مؤكدة** خلال الفحص. التبعيات الثقيلة كلها مُستخدمة:

| تبعية | الاستخدام (دليل) | الحالة |
|---|---|---|
| `admin-lte` | `src/app/admin/layout.tsx:3` (CSS RTL) | Active |
| `react-easy-crop` | `src/components/admin/ImagePicker.tsx` | Active |
| `pdf-lib` + `@pdf-lib/fontkit` | `src/app/api/admin/crm/export/route.ts` | Active |
| `xlsx-export` (lib محلي) | `src/app/api/admin/crm/export/route.ts` | Active |
| `bcryptjs` | `src/auth.ts` | Active |
| `zod`, `@prisma/client`, `next-auth`, `tailwindcss` | عبر التطبيق | Active |

## Legacy required / مقصود (لا يُحذف)
- `src/app/blog/page.tsx` → `permanentRedirect("/journal")` — تحويل دائم مقصود (commit `3962fd5`).
- `sitemap2.xml` / `sitemap-index.xml` — ألياس legacy لخرائط الموقع (`seo-sitemaps.ts:15-22`)؛ مُعلَنة في robots. **redundant لكن نشطة** (راجع SEO-005)؛ تُقلَّص فقط بقرار + redirects.
- كتلة envVars المُعلَّقة لـ cron النسخ الاحتياطي في `render.yaml:86-96` — توثيق مقصود، تُترك.

## Probably unused — يتطلب تحقّق runtime/DB (لا حذف الآن)
هذه تحتاج إثباتًا قبل أي قرار:
- استيرادات/أدوات في `src/lib/` قد تُستدعى ديناميكيًا أو من seed scripts أو CMS (`reference-assets.ts`, `core-search.ts`, `about-content.ts`, `general-inquiry.ts`) — رُئيت مراجع لبعضها؛ يلزم مسح مراجع شامل قبل الجزم.
- مكوّنات admin/forms متعدّدة — استخدامها يعتمد على صفحات admin الديناميكية؛ يلزم تتبّع الاستيراد.
- أصول `public/media`, `public/assets` — تكرار/أيقونات قديمة محتملة؛ يلزم مطابقة مراجع الأصول مع الكود وDB (مسارات الصور تُخزَّن في DB أيضًا → خطر حذف أصل مُشار إليه من DB).

## طريقة التحقّق المقترحة (آمنة، لاحقًا)
1. `npx knip` أو `ts-prune` لاكتشاف exports غير المستخدمة (ثم تحقّق يدوي من dynamic imports/route conventions).
2. `npx depcheck` للتبعيات (ثم استثناء ما يُستخدم في scripts/CSS).
3. مطابقة أصول `public/` مع: مراجع الكود + قيم أعمدة الصور في DB (لا تُحذف أصول مُشار إليها من DB).
4. تصنيف كل نتيجة قبل الحذف؛ لا حذف من فئة «Probably unused» دون إثبات.

## خلاصة
لا توجد توصية حذف في هذه الجولة. الخطر الأكبر هو حذف أصل/مكوّن مُشار إليه ديناميكيًا أو من DB — لذا أي تنظيف يُؤجَّل لمرحلة مخصّصة بعد تشغيل الأدوات أعلاه والتحقّق اليدوي.
