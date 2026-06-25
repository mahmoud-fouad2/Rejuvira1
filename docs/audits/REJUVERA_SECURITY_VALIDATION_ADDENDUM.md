# REJUVERA — Security Validation Addendum

- التاريخ: 2026-06-25. فحص دفاعي غير هدّام؛ بيانات اختبار فقط؛ لا استغلال.

## 0. بند مستقل يحتاج حسمًا قبل الإصلاحات العادية — Bootstrap Super-Admin (SEC-003)
> **قرار مطلوب منك صراحةً.** لا يجوز أن يمنح production جلسة `SUPER_ADMIN` عند فشل قاعدة البيانات.

- الدليل [CODE]: `src/auth.ts:45-95`:
  - مقارنة كلمة مرور **نصية** من env (`:54-55`: `bootstrap.password !== password`).
  - عند فشل upsert (DB غير متاحة) يُرجِع مستخدمًا **بلا سجل DB** بدور `SUPER_ADMIN` (`:88-93`، `id: "bootstrap:..."`).
- السيناريو: من يعرف `ADMIN_BOOTSTRAP_EMAIL/PASSWORD` + حالة فشل DB → جلسة super-admin في الذاكرة.
- الحالة: **[NEEDS-PROD]** هل المتغيّرات مضبوطة في Render؟ غير معروف (لا وصول env).
- القرار المطلوب (اختر): (أ) تعطيل bootstrap كليًا في الإنتاج، (ب) إزالة fallback الذاكرة مع إبقاء bootstrap لإنشاء أول مستخدم في DB فقط، (ج) حصره بعلم بيئي مؤقّت + تدوير الكلمة بعد الإعداد.
- اختبار تحقّق بعد الإصلاح: مع DB معطّلة + متغيّرات bootstrap مضبوطة → **يجب** ألا تُمنح جلسة.

## 1. فحوص حيّة (HTTP) [LIVE]
| الفحص | النتيجة | تقييم |
|---|---|---|
| `GET /admin/crm`, `/admin/users` | **307 → `/login?redirect=…`** | بوابة middleware/RBAC تعمل |
| `GET /api/admin/crm`, `/doctors`, `/upload` | **405** (Method Not Allowed) | لا تسريب بيانات على GET؛ التحقّق من الصلاحية داخل POST [CODE] |
| `GET /api/webhooks/aaaaaaaa` (token وهمي) | `{"error":"Not found"}` | لا كشف لإعداد عند token غير صالح |
| رؤوس `/api/health` | CSP + HSTS + `x-content-type-options` + `referrer-policy` + `x-robots-tag` | رؤوس أمنية مطبّقة على API |
| رؤوس الصفحة العامة | CSP كامل + HSTS(preload) + Permissions-Policy + `x-content-type-options` | مطابقة `next.config.ts` |
| كوكيز | `__Host-authjs.csrf-token`, `__Secure-authjs.callback-url` بـ `HttpOnly; Secure; SameSite=Lax` | إعداد كوكيز سليم |
| `Server`/origin | `Server: cloudflare` + `x-render-origin-server: Render` | استضافة مؤكّدة (Cloudflare→Render) |
| source maps | غير مُفعّلة (`productionBrowserSourceMaps:false`) | لا تسريب مصدر |

## 2. RBAC Role Matrix [CODE] (`src/lib/admin-permissions.ts`)
| المسار (prefix) | SUPER_ADMIN | ADMIN | EDITOR | VIEWER |
|---|:--:|:--:|:--:|:--:|
| `/admin/users` | ✔ | ✗ | ✗ | ✗ |
| `/admin/settings`,`/logs`,`/maintenance`,`/integration-tools` | ✔ | ✔ | ✗ | ✗ |
| `/admin/crm` | ✔ | ✔ | ✗ | ✔ |
| `/admin/content`,`/media`,`/pages`,`/services`,`/service-categories`,`/journal`,`/gallery`,`/doctors`,`/devices` | ✔ | ✔ | ✔ | ✗ |
| `/admin` (dashboard) | ✔ | ✔ | ✔ | ✗ (VIEWER → `/admin/crm`) |

- المطابقة `pathname.startsWith(prefix)` بترتيب الأكثر تحديدًا أولًا (`service-categories` قبل `services`) — سليم [CODE].
- **تحقّق متبقٍّ [NEEDS-PROD]:** اختبار فعلي بحسابات EDITOR/VIEWER على admin APIs (POST) للتأكد من فرض الصلاحية على مستوى الـ handler لا الصفحة فقط — يتطلب حسابات اختبار (لا تُنشأ بيانات على الإنتاج).

## 3. بنود أمنية أخرى (محدّثة)
| ID | الحالة بعد التحقق |
|---|---|
| SEC-001 leads recaptcha | [CODE] مؤكد (مسار leads بلا verify) |
| SEC-002 analytics مفتوح | [CODE]+[LIVE]؛ + **dep map** (يُقرأ من Admin/Stats → تصلّب لا إزالة) |
| SEC-004 SVG upload | [CODE] قائم (admin فقط؛ MIME من العميل) |
| SEC-005 CSP unsafe-inline | [LIVE] مؤكد في رؤوس الإنتاج |
| SEC-006 rate-limit بالذاكرة | [CODE]؛ خلف Cloudflare (طبقة WAF ممكنة) |
| SEC-007 webhook token في المسار | [CODE]؛ token غير صالح لا يكشف شيئًا [LIVE] |
| SEC-008 customHeadCode/BodyCode | [CODE] حقن سكربت من الإعدادات (admin) |

## 4. لم يُختبر (تجنّبًا للضرر أو لعدم الوصول)
- **unauth/over-privileged POST** على admin APIs (قد يُنشئ/يُعدّل بيانات إنتاج) — اكتُفي بـ GET=405 + تحقّق الكود.
- حقن XSS/SQL فعلي (Prisma معلَّم؛ لا SQL خام مرصود) — مراجعة كود فقط.
- استجابات 500 وتسريب stack traces — لم يُجبَر خطأ على الإنتاج؛ **[UNVERIFIED]**.
- `npm audit` للتبعيات — لم يُشغَّل (تجنّب لمس npm/الشبكة الإلزامي)؛ يُنفَّذ لاحقًا: `npm audit --omit=dev`.
- اختبار CORS/CSRF ديناميكي، وحدود حجم الطلب الفعلية على الإنتاج.

## 5. إيجابيات مؤكّدة (تُحافَظ)
RBAC + middleware gate [LIVE]، SSRF guard في media-proxy [CODE]، throttle تسجيل الدخول [CODE]، رؤوس أمنية شاملة [LIVE]، كوكيز محصّنة [LIVE]، لا source maps [CODE]، token webhook لا يكشف عند البطلان [LIVE].
