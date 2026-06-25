# REJUVERA — Route Inventory (جرد المسارات)

- المصدر: `find src/app -name page.tsx|route.ts` + فحص HTTP حي (curl, 2026-06-24).
- الحالة الحية المؤكدة (curl `-o /dev/null -w %{http_code}`): `/`,`/services`,`/doctors`,`/contact`,`/journal`,`/gallery`,`/devices`,`/about` → **200**؛ مسار غير موجود → **404**؛ `/admin` → **307** (إلى /login)؛ `/sitemap-pages.xml` → **200**.

## الصفحات العامة (Public)

| Route | ملف | فهرسة | sitemap | ملاحظة (دليل) |
|---|---|---|---|---|
| `/` | `app/page.tsx` | Index | نعم (prio 1) | canonical حي `https://rejuvera.sa` |
| `/about` | `app/about/page.tsx` | Index | نعم | 200 حي |
| `/contact` | `app/contact/page.tsx` | Index | نعم (0.9) | نموذج تواصل + NAP |
| `/services` | `app/services/page.tsx` | Index | نعم (0.95) | فهرس الخدمات |
| `/services/[slug]` | `app/services/[slug]/page.tsx` | Index | نعم (ديناميكي) | core services prio 0.9 |
| `/doctors` | `app/doctors/page.tsx` | Index | نعم (0.9) | دليل الأطباء |
| `/doctors/[slug]` | `app/doctors/[slug]/page.tsx` | Index | نعم | `loai-alsalmi` prio 0.9 |
| `/devices` | `app/devices/page.tsx` | Index | نعم (0.85) | + صور sitemap |
| `/gallery` | `app/gallery/page.tsx` | Index | نعم (0.7) | before/after صور |
| `/journal` | `app/journal/page.tsx` | Index | نعم (0.8) | المدوّنة الطبية |
| `/journal/[slug]` | `app/journal/[slug]/page.tsx` | Index | نعم | مقالات |
| `/blog` | `app/blog/page.tsx` | Redirect 308 | لا | `permanentRedirect("/journal")` — مقصود |
| `/p/[slug]` | `app/p/[slug]/page.tsx` | Index إن لم noindex | نعم إن منشور وغير noindex | صفحات هبوط PageCraft |
| `/privacy` | `app/privacy/page.tsx` | Index | نعم (0.4) | سياسة |
| `/terms` | `app/terms/page.tsx` | Index | نعم (0.4) | شروط |
| `/career`, `/career/*` | middleware + `career-proxy.ts` | مستبعد من crawl | لا (مُستبعد `isCleanSitemapPath`) | proxy خارجي `dralsalmi.com`، CSP خاص |
| `/login` | `app/login/page.tsx` | Disallow (robots) | لا | + noindex headers |
| `/forbidden` | `app/forbidden/page.tsx` | Disallow | لا | RBAC reject |
| `not-found` | `app/not-found.tsx` | 404 | لا | 404 حقيقي مُتحقَّق |

## الإدارة (Admin، محمي — robots Disallow `/admin`)

`/admin` + الفرعية: `content, crm, doctors, services, service-categories, journal, gallery, media, devices, pages, pages/[id], pages/new, integration-tools(+[id],new), users, settings, stats, logs, maintenance, webhooks`. الحماية: middleware (`middleware.ts:89-112`) + RBAC (`admin-permissions.ts`) + headers `no-store` + `X-Frame-Options: DENY`.

## API

| Route | ملف | مصادقة | ملاحظة |
|---|---|---|---|
| `/api/health` | `api/health/route.ts` | عام | healthCheckPath لـ Render |
| `/api/health/db` | `api/health/db/route.ts` | عام (تحقّق) | فحص DB |
| `/api/contact` | `api/contact/route.ts` | عام | + reCAPTCHA + rate-limit 5/10د |
| `/api/leads` | `api/leads/route.ts` | عام | **بلا reCAPTCHA** (SEC-001) + rate-limit 6/10د |
| `/api/analytics` | `api/analytics/route.ts` | **عام بلا حد** | SEC-002/PERF-002 |
| `/api/auth/[...nextauth]` | NextAuth | — | robots Disallow `/api/auth` |
| `/api/webhooks/[token]` | `api/webhooks/[token]/route.ts` | token في المسار | rate-limit 120/10د، GET يكشف إعداد الـ webhook |
| `/api/admin/*` | 16 مسار | `auth()` + RBAC | backup (مصادقة مزدوجة)، media-proxy (SSRF guard)، upload (نوع/حجم) |

## ملاحظات الجرد
- **Orphan/Noindex متوقّعة:** `/login`,`/forbidden`,`/career` (مستبعدة من sitemap عمدًا).
- **Redirect مقصود:** `/blog → /journal` (308).
- **trailing slash:** middleware يزيل الـ slash النهائي (308) عدا `/career/` (`middleware.ts:57-76`) — سلوك متّسق، لكن canonical الرئيسية بلا slash بينما sitemap للجذر `/` (SEO-002، طفيف).
- **اللغة:** لا توجد مسارات `/en` منفصلة؛ الإنجليزية تبديل CSS داخل نفس URL (مرتبط بـ SEO-001).
- **مقارنة المشروع↔sitemap↔الحي:** كل أنواع الصفحات العامة في الكود موجودة في منطق sitemap وتستجيب 200 حيًّا؛ لم يُرصد route عام مفقود من sitemap عدا المستبعد عمدًا.
- لم يُتحقّق من العدد الفعلي لصفحات `[slug]` المنشورة (يتطلب DB — غير متاح).
