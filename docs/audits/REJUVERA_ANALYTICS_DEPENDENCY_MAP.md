# REJUVERA — Analytics Dependency Map (`/api/analytics`)

- الغرض: قبل أي اقتراح بإزالة/تغيير `/api/analytics`، توثيق من يستدعيه ومن يقرأ بياناته. [CODE] + [LIVE].

## 1. من يكتب (callers)
| المستدعي | ملف | ملاحظة |
|---|---|---|
| `PageViewTracker` (client) | `src/components/layout/PageViewTracker.tsx:26` (`fetch("/api/analytics", …)`) | يُركَّب في كل صفحة عامة فقط (`layout.tsx:280`، `!isAdminOrAuth`) |

- الـ endpoint: `src/app/api/analytics/route.ts` — يستقبل JSON (path/referrer/language/timezone/screen)، يستنتج device/browser/os/country/source من UA/TZ، ويكتب `recordAppLog({ kind: "analytics.pageview", … })`.

## 2. أين تُكتب البيانات (tables)
- جدول **`AppLog`** (Prisma model `AppLog`، `prisma/schema.prisma`) عبر `recordAppLog` (`src/lib/app-log.ts`).
- **ملاحظة تصميم:** `AppLog` جدول عام للسجلات التشغيلية (spam/webhook/rate-limit/auth/media…)؛ `recordAppLog` مُستخدَم في **9 ملفات**. خلط أحداث pageview عالية الحجم مع السجلات التشغيلية في نفس الجدول يُغرِق السجلات التشغيلية ويضخّم الجدول (يدعم PERF-002 + قابلية تشغيل أسوأ).

## 3. من يقرأ (readers) — **مهم قبل أي إزالة**
| القارئ | ملف | الاستخدام |
|---|---|---|
| **لوحة Admin → Stats** | `src/app/admin/stats/page.tsx:397` (تعليق صريح: «VISITOR ANALYTICS — Real visitor data from /api/analytics») | تعرض تحليلات الزوّار (device/browser/country/source) المشتقّة من `AppLog` |
| Admin → Logs | `src/app/admin/logs/page.tsx` + `app-log.ts:122` (`appLog.findMany`) | عرض السجلات التشغيلية |
| Media library | `src/app/api/admin/media-library/route.ts:159` (`appLog.findMany`) | سجلّ رفع الوسائط |

## 4. الخلاصة والقرار
- **`/api/analytics` ليس آمنًا للإزالة كما هو**: لوحة Admin/Stats تعتمد على بياناته لعرض «تحليلات الزوّار الحقيقية». إزالته تُعطّل تلك اللوحة.
- هل GA4 يعوّض؟ **جزئيًا فقط**: GA4 يغطّي pageviews/سلوك الزوّار، لكن **لوحة Admin الحالية تقرأ من DB لا من GA4** → التعويض يتطلّب إعادة بناء لوحة Stats على GA4 Data API أولًا.
- **التوجّه المعتمد مبدئيًا منك** (GA4 للـ pageviews، DB/CRM للأحداث التشغيلية فقط، لا كتابة DB لكل pageview) **سليم كهدف**، لكن تسلسله:
  1. (P0 تصلّب) إضافة `rateLimit` + حد حجم body + validation إلى `/api/analytics` لإيقاف إساءة الاستخدام **فورًا** دون تعطيل اللوحة.
  2. (لاحق) sampling/تقليل تكرار الكتابة، أو فصل pageviews عن `AppLog` في جدول/مسار مخصّص.
  3. (لاحق) ترحيل لوحة Admin/Stats إلى GA4 ثم **إيقاف** كتابة pageview الداخلية.
- **Origin guard وحده غير كافٍ** (يُزوَّر خارج المتصفح) — الاعتماد على rate-limit + حجم + sampling/إزالة لاحقة.

## 5. غير مؤكد [NEEDS-PROD]
- مدّة الاحتفاظ بصفوف `AppLog` (هل يوجد تقليم/TTL؟) — يتطلب فحص DB/إعداد.
- حجم الجدول الفعلي ومعدّل النمو — يتطلب DB.
- هل تُقرأ بيانات pageview في تقارير/تصدير أخرى غير Admin/Stats — بحث grep غطّى `src`؛ أي قراءة عبر SQL خارجي غير مرئية.
