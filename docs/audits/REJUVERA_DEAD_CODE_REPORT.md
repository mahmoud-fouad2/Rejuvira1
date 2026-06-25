# REJUVERA — Dead Code Report

> تصنيف: **Confirmed dead** / **Probably unused (يتطلب تحقّق runtime)** / **Active** / **Legacy required**.
> لم يُحذف أي شيء. تحديث 2026-06-25: شُغِّل `npx knip@5` فعليًا (انظر القسم أدناه) + تحقّق grep يدوي.

## نتائج knip@5 (شُغّل 2026-06-25) [TEST]
الأمر: `npx --yes knip@5 --no-progress --reporter compact` (exit 1 = نتائج موجودة، لا خطأ).

### Probably unused — مرشّحات بـ 0 مراجع ثابتة (تحقّق ديناميكي/feature مطلوب قبل أي حذف)
تحقّقت من غياب المراجع بـ grep (0 مراجع غير-تعريفية في `src`)، لكن **لا أصنّفها Confirmed** قبل استبعاد dynamic imports / form actions / feature wiring:
| العنصر | ملف | ملاحظة تحقّق |
|---|---|---|
| `WebhookTestButton.tsx` (ملف كامل) | `src/components/admin/WebhookTestButton.tsx` | 0 مراجع؛ تأكّد ألا يُستورَد ديناميكيًا في WebhookEditor |
| `deleteCrmSubmissionAction`,`bulkCrmSubmissionsAction`,`setCrmStatusAction` | `src/app/admin/crm/actions.ts` | 0 مراجع؛ تحقّق من ربط واجهة CRM (form action) |
| `deleteCustomPageAction` | `src/app/admin/pages/actions.ts` | 0 مراجع؛ تحقّق من واجهة الصفحات |
| `executeIntegrationTool`,`interpolateTemplate`,`maskSecret` | `src/lib/integration-tools.ts` | 0 مراجع؛ ميزة integration-tools قد تكون غير مكتملة التوصيل — تحقّق من api routes |

### Unused exports = over-export فقط (ليست dead code)
`permissionMatrix` (مُستخدَم داخليًا في نفس الملف)، `SITEMAP_PATHS`/`absoluteUrl`، `getCoreServiceRank`/`isRhinoDevice`، `getRequestTracking`، `careerProxyCsp` — مُستخدَمة داخليًا أو قابلة لإزالة كلمة `export` فقط. **لا تُحذف**؛ مراجعة منخفضة الأولوية.

### Unused exported types (23) — informational
أنواع مُصدَّرة تُستخدَم داخليًا فقط (`content-repository.ts` وحده 25 نوعًا). لا أثر تشغيلي؛ تنظيف اختياري.

### Unlisted dependency
`postcss` يُستخدَم في `postcss.config.mjs` لكنه في `overrides` لا `devDependencies` (متاح transitively عبر tailwind). informational.

> **لا حذف في هذه الجولة.** كل ما سبق «Probably unused» يتطلب تحقّق dynamic/feature/DB قبل أي قرار.

## التبعيات الثقيلة — كلها مُستخدمة (Active)

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
