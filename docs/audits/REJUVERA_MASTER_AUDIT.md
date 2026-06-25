# REJUVERA — Master Audit (تقرير الفحص الرئيسي)

- التاريخ: 2026-06-24
- الفرع: `main` @ `780e7d8`
- نطاق الوصول: الكود المحلي (قراءة) + تصفّح الموقع الحي `https://rejuvera.sa`.
- **بدون** وصول إلى: Google Search Console / GA4 / Google Ads / Render / Vercel / قاعدة البيانات / متغيرات البيئة الحقيقية.
- منهجية الأدلة: كل ملاحظة مرفقة بـ ملف:سطر، و/أو أمر مُنفّذ، و/أو HTTP response حي. ما لا يمكن التحقق منه مُوسوم صراحة.

> هذه الجولة **فحص + توثيق فقط**. لم يُعدّل أي ملف من كود الإنتاج. الملفات المُنشأة هي تقارير تحت `docs/audits/` فقط.

---

## 1. Executive Summary

### الحالة العامة
المشروع تطبيق **Next.js 16 / React 19 / TypeScript / Prisma (Postgres-Neon)** واحد، يُنشر على **Render** كـ standalone server (لا يوجد Express منفصل ولا Vercel كما ورد في الوصف الأولي — تصحيح موثّق: `package.json`, `next.config.ts:112`, `render.yaml`). الكود **ناضج ومنظَّم بدرجة جيدة**: حماية النماذج (honeypot + توقيت + reCAPTCHA + rate-limit + IP denylist)، RBAC للوحة الإدارة، CSP وHSTS وheaders أمنية، sitemaps وschema وrobots مُولّدة برمجيًا، وتتبّع تحويلات يُطلق على **النجاح الحقيقي** لا على النقر. الموقع الحي يستجيب 200 لكل الصفحات الرئيسية و404 حقيقي للمسارات غير الموجودة.

المخاطر الأساسية ليست في «كسر» وظيفي ظاهر، بل في: (أ) **الأداء/التوسّع** (الموقع كله `force-dynamic` + قراءة DB لكل طلب + حد اتصال DB = 1 + تعطيل تحسين الصور)، (ب) **تفاوت حماية مدخلات الـ leads** (صفحات الهبوط بلا reCAPTCHA)، (ج) **بنية ثنائية اللغة لا تُنتج فهرسة إنجليزية حقيقية** (hreflang إلى `?lang=en` يُلغي نفسه canonical-ًا)، (د) **منطق منع التكرار يُسقط استفسارات مشروعة متكررة لخدمات مختلفة**.

مستوى الثقة الإجمالي: **عالٍ** في نتائج الكود والموقع الحي (HTTP)، **منخفض/معدوم** في الأداء الميداني والترتيب والتتبّع المُفعّل فعليًا في الإنتاج (لا وصول للمنصات).

### أخطر 10 مشاكل (مرتّبة)
1. **PERF-001 (High):** الموقع بالكامل `force-dynamic` بلا static/ISR، مع قراءة `getRuntimeSettings()` من DB لكل طلب وحد اتصال DB = 1 → ضغط TTFB والتوسّع. `src/app/layout.tsx:22`, `render.yaml:27-28`.
2. **PERF-006 (Medium-High):** تحسين صور Next مُعطّل في الإنتاج (`IMAGE_UNOPTIMIZED=1`) رغم إعداد avif/webp → صور أثقل وLCP أعلى. `render.yaml:16-17` مقابل `next.config.ts:129-142`.
3. **SEO-001 (High):** hreflang الإنجليزي يشير إلى `?lang=en` لكن تلك الصفحة canonical-ها يعود للعربية، والإنجليزية مجرد تبديل CSS داخل نفس DOM → لا فهرسة إنجليزية فعلية. `src/lib/seo.ts:23,62` + رؤوس الصفحة الحية.
4. **BUG-001 (Medium):** منع التكرار يعتمد على الهاتف فقط ضمن نافذة زمنية (حتى 12 ساعة) → استفسار العميلة عن خدمة ثانية خلال النافذة يُحفظ كـ«مكرر» ويُقمع الـ webhook → ضياع lead حقيقي من الإشعارات. `src/lib/content-repository.ts:4591-4630`.
5. **SEC-001 / TRACK-004 (Medium):** `/api/leads` (صفحات الهبوط، مصدر الزيارات المدفوعة) **لا يتحقق من reCAPTCHA** بينما `/api/contact` يتحقق → سبام في CRM وتلويث بيانات التحويل. `src/app/api/leads/route.ts` (لا استيراد لـ recaptcha) مقابل `src/app/api/contact/route.ts:202`.
6. **SEC-002 (Medium):** `/api/analytics` نقطة POST عامة **بلا مصادقة وبلا rate-limit** تكتب صفًّا في DB لكل نداء → إغراق سجلات/DoS وحقن تحليلات. `src/app/api/analytics/route.ts:95-162`.
7. **PERF-002 (Medium):** `/api/analytics` يكتب في DB عند كل page view عام → DB على المسار الحرج لكل زيارة (إضافة لقراءة الإعدادات)، وتكرار مع GA4. `src/app/api/analytics/route.ts:139`.
8. **SEC-003 (Medium / غير مؤكد بيئيًا):** مسار «bootstrap login» قد يمنح جلسة `SUPER_ADMIN` في الذاكرة عند تعذّر DB، بمقارنة كلمة مرور نصية من متغير بيئة. `src/auth.ts:45-95` (خاصة 88-93). لم يُتحقق من تفعيله في الإنتاج (لا وصول للبيئة).
9. **PERF-003 (Medium):** سكربت حقول UTM يشغّل `MutationObserver` على كامل `document` (childList+subtree) ويعيد استعلام كل المدخلات عند كل تغيير DOM → أثر على INP. `src/app/layout.tsx:286`.
10. **DUP-001 / ARCH-001 (Medium):** منطق قراءة payload وبناء حمولة webhook مكرّر عبر ثلاثة مسارات (`contact`, `leads`, `webhooks/[token]`) مع ملف `api/leads/route.ts` ~611 سطرًا → مخاطر صيانة وتباعد سلوك.

### أكبر 10 فرص
1. تفعيل static/ISR + caching لطبقة `getRuntimeSettings` للصفحات العامة (أكبر مكسب أداء).
2. تفعيل تحسين الصور أو خدمة صور مُحسّنة مسبقًا من R2.
3. حسم استراتيجية اللغة: إمّا مسارات إنجليزية حقيقية `/en/...` أو إسقاط hreflang الإنجليزي والتقديم كصفحة عربية أحادية الفهرسة.
4. توحيد reCAPTCHA + حماية السبام عبر كل مداخل الـ leads.
5. توسيع تغطية الخدمات (أنف، شفط دهون، نحت جسم، عمليات الثدي، التثدّي) ببنية hub→category→procedure (راجع Keyword Map).
6. إصلاح منع التكرار ليكون لكل (هاتف + خدمة) أو ضمن نافذة أقصر، مع إشعار CRM للاستفسارات المتكررة.
7. تقوية `/api/analytics` (مصادقة/حد/حجم) أو الاستغناء عنه لصالح GA4.
8. توحيد منطق الـ leads في وحدة مشتركة لتقليل ازدواج السلوك.
9. إضافة BreadcrumbList + Physician/MedicalProcedure schema حيث يلزم.
10. baseline أداء (Lighthouse متعدّد الصفحات) وربط Search Console/GA4 لقياس فعلي قبل/بعد.

### ما تم التحقق منه فعليًا
- بنية المشروع والتقنيات والإصدارات (الملفات).
- خريطة routes الكاملة + حالة HTTP الحية لـ 11 مسارًا (curl).
- robots.txt الحي + رؤوس الصفحة الحية (canonical/hreflang/JSON-LD/meta robots/X-Robots-Tag).
- مسار الـ leads الثلاثي والتحقق وحماية السبام ومنع التكرار وتسلسل الحفظ→webhook (الكود).
- توقيت إطلاق تتبّع التحويل (نجاح حقيقي) في الكود.
- إعدادات الأمان: CSP/HSTS/headers/RBAC/SSRF guard/auth (الكود).

### ما لم يمكن التحقق منه (لا وصول)
- بيانات GSC/GA4/Ads (ترتيب، CTR، impressions، conversions الفعلية).
- أي معرّف GA4/Ads/Meta Pixel مُفعّل فعليًا في DB الإنتاج (التتبّع مُعتمِد على إعدادات DB).
- Core Web Vitals الميدانية (CrUX) وlogs الإنتاج وقاعدة البيانات.
- قيم متغيرات البيئة (هل bootstrap login مُفعّل؟ هل R2 مهيّأ؟ هل reCAPTCHA strict؟).
- لقطات مرئية للموبايل (التصفّح المتاح نصّي عبر curl/WebFetch، لا screenshots).

---

## 2. System Inventory

| العنصر | التفاصيل (بدليل) |
|---|---|
| التطبيق | تطبيق Next.js 16.2.6 واحد، App Router، `output: standalone` (`next.config.ts:112`) |
| Runtime / Host | Node 22.19.0 على Render، خدمة web واحدة (`render.yaml`), بدء عبر `scripts/run-standalone-server.mjs` |
| قاعدة البيانات | Postgres (Neon) عبر Prisma 6.8.2؛ 21 model + 6 enum (`prisma/schema.prisma`)؛ حد اتصال runtime = 1 (`render.yaml:27`) |
| المصادقة | NextAuth v5 beta، JWT strategy، Credentials + bcrypt + bootstrap (`src/auth.ts`) |
| الصلاحيات | RBAC بـ4 أدوار (SUPER_ADMIN/ADMIN/EDITOR/VIEWER) عبر `permissionMatrix` (`src/lib/admin-permissions.ts`) + middleware |
| التخزين | Cloudflare R2 (S3-compatible) للوسائط (`src/lib/storage/r2`, `.env.example:33-44`) |
| الصفحات العامة | 18 نوع route (انظر `REJUVERA_ROUTE_INVENTORY.md`) |
| الإدارة | `/admin` + 20 صفحة فرعية محمية |
| API | health, health/db, contact, leads, analytics, auth/[...nextauth], webhooks/[token], + 16 مسار admin |
| النماذج/Leads | مداخل: `/api/contact`, `/api/leads`, `/api/webhooks/[token]` → نموذج `ContactSubmission` |
| Webhooks | صادر: `dispatchFormWebhook`/`dispatchJsonWebhook` (إعدادات + per-custom-page)؛ وارد: `/api/webhooks/[token]` |
| التتبّع | Google Tag (gtag/GTM) من إعدادات DB، GA4 `lead_submit`, dataLayer, Meta Pixel `Lead` (`src/lib/lead-conversion-tracking.ts`); تتبّع pageview داخلي عبر `/api/analytics` |
| SEO | robots/llms/sitemap(.xml, 2, -index, -pages, -images) route handlers + `src/lib/seo-sitemaps.ts`, `src/lib/seo.ts` |
| Deployment | build يشغّل `prisma migrate deploy` + `seed:core` + `seed:landing` ثم `next build` (`render.yaml:9`) |
| Integrations | reCAPTCHA v3، Chatbase، Google Maps embed، career proxy (`dralsalmi.com`) |

---

## 3. Findings Table

> الحالة: `مؤكد` = مُتحقَّق بالكود/HTTP. `غير مؤكد` = يتطلب وصولًا غير متاح. الخطورة: Critical/High/Medium/Low/Info.

| ID | المجال | الخطورة | الحالة | الدليل (ملف:سطر / أمر) | الأثر | العلاج | اختبار التحقق |
|----|--------|--------:|--------|--------|-------|--------|---------------|
| PERF-001 | Performance | High | مؤكد | `layout.tsx:22` (`force-dynamic`)، `render.yaml:27` (conn=1) | TTFB عالٍ، DB مختنقة، توسّع ضعيف | static/ISR للصفحات العامة + cache لـ settings | قياس TTFB قبل/بعد + Lighthouse |
| PERF-006 | Performance | Medium | مؤكد | `render.yaml:16` vs `next.config.ts:129` | LCP أعلى، استهلاك باندويدث | تفعيل تحسين الصور أو R2 مُحسّن | مقارنة أحجام الصور المخدومة |
| SEO-001 | SEO/i18n | High | مؤكد | `seo.ts:23,62` + رؤوس الصفحة الحية (curl) | لا فهرسة EN، إشارات لغة متضاربة | مسارات `/en` حقيقية أو إسقاط hreflang EN | فحص GSC i18n + crawl |
| BUG-001 | Leads | Medium | مؤكد | `content-repository.ts:4591-4630` | ضياع استفسارات متكرّرة لخدمات مختلفة | dedup لكل (هاتف+خدمة) أو نافذة أقصر + إشعار | إرسال طلبين بخدمتين، توقّع حفظ الاثنين |
| SEC-001 | Security/Spam | Medium | مؤكد | `api/leads/route.ts` (لا recaptcha) vs `contact/route.ts:202` | سبام leads + تلويث تحويلات | إضافة `verifyRecaptchaToken` لمسار leads | طلب بـ token ضعيف → رفض/تعليم |
| SEC-002 | Security | Medium | مؤكد | `api/analytics/route.ts:95-162` | DoS سجلات + حقن تحليلات | rate-limit + حد حجم + (اختياري) إلغاء | تجاوز الحد → 429 |
| PERF-002 | Performance | Medium | مؤكد | `api/analytics/route.ts:139` | DB لكل زيارة، تكلفة | الاعتماد على GA4 أو batching | مراقبة كتابات AppLog |
| SEC-003 | Security/Auth | Medium | غير مؤكد (بيئة) | `auth.ts:88-93` | super-admin بلا DB عند تعذّرها | تعطيل bootstrap في الإنتاج/إزالة fallback | محاولة دخول bootstrap بعد قطع DB |
| PERF-003 | Performance | Medium | مؤكد | `layout.tsx:286` (MutationObserver) | INP/jank | استبدال بـ delegation/حدث واحد | قياس INP في DevTools |
| DUP-001 | Architecture | Medium | مؤكد | `contact/route.ts:56-130`, `leads/route.ts:74-205,414-464`, `webhooks/[token]/route.ts:70-148` | تباعد سلوك، صيانة | وحدة `lead-intake` مشتركة | typecheck + اختبار المسارات |
| SEC-004 | Security/Upload | Low-Med | مؤكد | `api/admin/upload/route.ts:36,92-99` | XSS مخزّن عبر SVG (admin) | منع SVG أو تعقيمه + فحص magic bytes | رفع SVG بسكربت → رفض |
| SEC-005 | Security/CSP | Info | مؤكد | `next.config.ts:36` (`unsafe-inline`) | إضعاف مقاومة XSS | CSP بـ nonce | فحص CSP بلا unsafe-inline |
| SEC-006 | Security | Info | مؤكد | `rate-limit.ts:1-12` | حد لكل worker لا عالمي | متجر مشترك/WAF | اختبار توزيعي |
| SEC-007 | Security/Webhook | Info | مؤكد | `api/webhooks/[token]/route.ts` | تسرّب token عبر referer/logs | توقيع HMAC + تدوير token | إعادة إرسال موقّعة |
| SEO-002 | SEO | Low | مؤكد | canonical حي `https://rejuvera.sa` vs sitemap `/` | تذبذب trailing slash | توحيد سياسة الـ slash | فحص canonical لعدة صفحات |
| SEO-003 | SEO/Content | Medium | مؤكد | `data/core-services.json` (5 فقط) | فجوات نية بحثية | توسيع الخدمات (Keyword Map) | تغطية كلمات الهدف |
| TRACK-002 | Tracking | Medium | غير مؤكد | `layout.tsx:182-185` (Tag من DB) | تتبّع قد لا يكون مُفعّلًا | تأكيد معرّف GA4/Ads في DB | فحص network/dataLayer حي |
| TRACK-003 | Tracking | Low | مؤكد | `lead-conversion-tracking.ts:51-71` | إسقاط Lead إن لم يحمّل fbq | إضافة CAPI خادمي | اختبار مع حجب fbq |
| TRACK-005 | Tracking | Info | جزئي | `api/analytics/route.ts` + مراجع `wa.me` | عدم وضوح تتبّع WA/Call | توحيد أحداث call/whatsapp | فحص أحداث dataLayer |
| ARCH-002 | Architecture | Low | مؤكد | `api/leads/route.ts` (~611 سطر) | god route | تقسيم + استخراج helpers | typecheck |
| ARCH-003 | Architecture | Low | مؤكد | `lib/content-repository.ts` (~4800 سطر) | god file | تقسيم حسب المجال | typecheck |
| DEAD-001 | Dead code | Info | مؤكد | `app/blog/page.tsx` (redirect)، deps مستخدمة | لا dead deps مؤكدة | لا حذف؛ مراقبة runtime | راجع DEAD report |

تفاصيل كل مجال في التقارير المتخصصة:
`REJUVERA_SECURITY_AUDIT.md`، `REJUVERA_SEO_AUDIT.md`، `REJUVERA_PERFORMANCE_BASELINE.md`، `REJUVERA_TRACKING_AUDIT.md`، `REJUVERA_ROUTE_INVENTORY.md`، `REJUVERA_CUSTOMER_JOURNEYS.md`، `REJUVERA_KEYWORD_MAP.md`، `REJUVERA_CONTENT_INVENTORY.md`، `REJUVERA_DEAD_CODE_REPORT.md`، `REJUVERA_DUPLICATION_REPORT.md`، `REJUVERA_REMEDIATION_PLAN.md`.

---

## 4. Evidence (مختارات أساسية)

### PERF-001 — الموقع كله ديناميكي
- ملف: `src/app/layout.tsx:22` → `export const dynamic = "force-dynamic";`
- كل صفحة عامة تستدعي `getRuntimeSettings()` (DB) + الصفحة الرئيسية تستدعي 6 استعلامات متوازية (`src/app/page.tsx:42-50`).
- `render.yaml:27-28` → `PRISMA_RUNTIME_CONNECTION_LIMIT=1`, `POOL_TIMEOUT=20`.
- المتوقّع: استجابة سريعة مع caching. الواقع: SSR + DB لكل طلب على اتصال واحد.

### SEO-001 — hreflang غير فعّال
- أمر: `curl -s https://rejuvera.sa/ | grep hreflang` →
  `hrefLang="en" href="https://rejuvera.sa/?lang=en"` و `<link rel="canonical" href="https://rejuvera.sa"/>`.
- كود: `src/lib/seo.ts:62` يبني canonical من `input.path` بلا lang → صفحة `?lang=en` تُعلن canonical للعربية.
- اللغة تبديل CSS: `src/app/layout.tsx:199-201,214` + أصناف `lang-ar/lang-en` (مثال `ContactForm.tsx`).

### BUG-001 — منع تكرار يُسقط استفسارات مشروعة
- ملف: `src/lib/content-repository.ts:4594-4605` و`4614-4629` → `findFirst({ where: { phone, createdAt: { gte: since } } })` ثم `mode: "duplicate"` وقمع webhook (`api/leads/route.ts:502-534`, `api/contact/route.ts:302-333`).
- خطوات الإنتاج: عميلة ترسل استفسار «شد الوجه» ثم بعد ساعة «تجميل الأنف» بنفس الرقم → الثاني يُعلَّم مكرّرًا ولا يُرسل webhook → الفريق لا يُشعَر.

### SEC-001 — leads بلا reCAPTCHA
- `src/app/api/contact/route.ts:25,197-229` يتحقق reCAPTCHA.
- `src/app/api/leads/route.ts` (كامل الملف) لا يستورد `verifyRecaptchaToken` ولا يستدعيه — يعتمد فقط على honeypot/توقيت (`lead-intake-guard`) + rate-limit (`:328`).

### SEC-002 / PERF-002 — analytics مفتوح
- `src/app/api/analytics/route.ts:95` → `POST` بلا `auth()` وبلا `rateLimit`، يكتب `recordAppLog` (DB) عند كل نداء (`:139`).

### الإيجابيات المُتحقّقة (لا تُغيَّر)
- تتبّع التحويل على نجاح حقيقي: `src/components/forms/ContactForm.tsx:213` و`src/components/layout/LeadConversionTracker.tsx:18`.
- حفظ الـ lead في DB قبل webhook مع قمع تكرار: `api/leads/route.ts:390,536`.
- SSRF guard في media-proxy: `api/admin/media-proxy/route.ts:25-38,64-83`.
- مصادقة مزدوجة للنسخ الاحتياطي: `api/admin/backup/route.ts:10-26`.
- throttle لتسجيل الدخول: `src/auth.ts:153-179`.
- robots حي صحيح + 404 حقيقي + `/admin` 307 (curl).

---

## 5. No-Access / Unverified Areas

| المنطقة | لماذا لم يُتحقّق | كيف يُتحقّق لاحقًا |
|---|---|---|
| الترتيب/CTR/Impressions | لا وصول GSC | ربط Search Console وتصدير Queries/Pages |
| التحويلات الفعلية وأحداث GA4/Ads/Meta | لا وصول GA4/Ads + التتبّع مُعتمِد على إعدادات DB | فحص network/dataLayer على الإنتاج + منصات الإعلانات |
| Core Web Vitals ميدانيًا | لا وصول CrUX/GA | تقرير CrUX + PageSpeed Field |
| متغيرات البيئة (bootstrap, R2, reCAPTCHA strict) | لا وصول Render | مراجعة Render Environment |
| محتوى DB الفعلي (عدد الخدمات/الأطباء المنشورين) | لا وصول DB | استعلام/لوحة الإدارة |
| اللقطات المرئية للموبايل/RTL | الأدوات المتاحة نصّية | جلسة متصفح بصرية + screenshots baseline |
| الأداء الميداني الفعلي للـ leads (تسليم webhook) | لا وصول logs الإنتاج | مراجعة `WebhookEvent`/`AppLog` في DB |

> أي بند في الجداول أعلاه موسوم «غير مؤكد» **لا يجوز اعتباره نتيجة نهائية** قبل توفّر الوصول المذكور.
