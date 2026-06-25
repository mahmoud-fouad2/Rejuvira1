# REJUVERA — Security Audit (مراجعة أمنية دفاعية)

- النطاق: مراجعة كود ثابتة + فحص رؤوس حية. **لا استغلال هجومي، لا بيانات حقيقية.**
- لا وصول إلى: بيئة الإنتاج، DB، logs، متغيرات البيئة → بعض البنود «غير مؤكدة بيئيًا».

## ملخّص المخاطر

| ID | الخطورة | البند | الحالة |
|---|--:|---|---|
| SEC-001 | Medium | `/api/leads` بلا تحقّق reCAPTCHA | مؤكد |
| SEC-002 | Medium | `/api/analytics` عام بلا مصادقة/حد + كتابة DB | مؤكد |
| SEC-003 | Medium | bootstrap login → جلسة super-admin في الذاكرة عند تعذّر DB | غير مؤكد بيئيًا |
| SEC-004 | Low-Med | رفع SVG بنوع MIME من العميل دون فحص magic bytes | مؤكد |
| SEC-005 | Info | CSP `script-src 'unsafe-inline'` | مؤكد |
| SEC-006 | Info | rate-limit في الذاكرة لكل worker | مؤكد |
| SEC-007 | Info | token الـ webhook في مسار URL، بلا توقيع HMAC | مؤكد |
| SEC-008 | Info | `customHeadCode/customBodyCode` يُحقن من الإعدادات | مؤكد |

---

### SEC-001 — leads بلا reCAPTCHA
- الدليل: `src/app/api/contact/route.ts:25,197-229` يتحقق؛ `src/app/api/leads/route.ts` لا يستورد/يستدعي `verifyRecaptchaToken`.
- السيناريو: بوت يرسل POST مباشرة إلى `/api/leads` بحقول صحيحة (تجاوز honeypot/توقيت سهل برمجيًا).
- الأثر: leads سبام في CRM، تلويث `generate_lead`/تكلفة إعلانية ظاهرية.
- قابلية الاستغلال: عالية (نقطة عامة، مصدر زيارات مدفوعة).
- العلاج: استدعاء `verifyRecaptchaToken(token,"lead")` مع نفس عتبة 0.4 واحترام `RECAPTCHA_STRICT`.
- اختبار التحقق: POST بـ token فارغ/ضعيف عند تفعيل strict → 403؛ token صالح → 201.

### SEC-002 — analytics مفتوح
- الدليل: `src/app/api/analytics/route.ts:95-162` (`POST` بلا `auth()`/`rateLimit`، يكتب `recordAppLog` في DB).
- السيناريو: حلقة POST سريعة تملأ جدول `AppLog` ببيانات pageview ملفّقة.
- الأثر: استنزاف تخزين/كتابات DB (DoS ناعم)، تلويث تحليلات داخلية، تكلفة.
- العلاج: `rateLimit({key:"analytics:"+ip,...})` + حد حجم body + (اختياري) إسقاط الكتابة لصالح GA4، أو batching/sampling.
- اختبار: إرسال > الحد خلال النافذة → 429؛ التأكد من عدم نمو AppLog بلا حد.

### SEC-003 — bootstrap login fallback
- الدليل: `src/auth.ts:45-95`؛ خاصة `:54-55` (مقارنة كلمة مرور نصية من env) و`:88-93` (إرجاع مستخدم `id: bootstrap:...` بدور `SUPER_ADMIN` **دون سجل DB** عند فشل upsert).
- السيناريو: عند خطأ DB + معرفة `ADMIN_BOOTSTRAP_EMAIL/PASSWORD`، يُمنح super-admin في الذاكرة.
- الأثر: تجاوز اعتماد DB لحساب فائق الصلاحية.
- قابلية الاستغلال: متوسطة-منخفضة (تتطلب معرفة سر + حالة فشل DB)؛ **لم يُتحقّق إن كانت المتغيرات مضبوطة في الإنتاج**.
- العلاج: تعطيل bootstrap خارج بيئة الإعداد الأولي، أو منع fallback الذاكرة، أو تقييده بعلم بيئي + تدوير الكلمة.
- اختبار: مع DB معطّلة ومتغيرات bootstrap مضبوطة، تأكيد عدم منح جلسة (بعد الإصلاح).

### SEC-004 — رفع SVG / MIME من العميل
- الدليل: `src/app/api/admin/upload/route.ts:36` يسمح `image/svg+xml`؛ `:92-99` يأخذ النوع من `file.type` (يتحكم به العميل) بلا فحص محتوى/magic bytes.
- السيناريو: مدير (أو حساب مدير مخترق) يرفع SVG يحوي `<script>` يُخدم لاحقًا.
- الأثر: XSS مخزّن إن خُدِم من نفس الأصل؛ مُخفَّف لأن الوسائط تُخدم من R2 وعبر `media-proxy` يفرض `Content-Type` من الـ upstream.
- العلاج: منع SVG أو تعقيمه (DOMPurify/svgo) + التحقق من magic bytes للأنواع الأخرى + فرض `Content-Disposition`/CSP على الوسائط.
- اختبار: رفع SVG بسكربت → رفض/تعقيم.

### SEC-005 — CSP unsafe-inline (موثّق ذاتيًا)
- الدليل: `next.config.ts:18-23,36`. مبرّر بحقن snippets/JSON-LD inline.
- العلاج (جهد عالٍ): CSP بـ nonce عبر الردّ. أولوية منخفضة مقابل العائد.

### SEC-006 — rate-limit في الذاكرة
- الدليل: `src/lib/rate-limit.ts:1-19` (Map لكل عملية). موثّق أن WAF/Cloudflare متوقّع للحدود العالمية.
- العلاج: متجر مشترك (Redis) أو طبقة WAF عند التوسّع.

### SEC-007 — token webhook في المسار
- الدليل: `src/app/api/webhooks/[token]/route.ts:183-193`؛ GET (`:422-471`) يكشف اسم/إعداد الـ webhook لحامل الـ token.
- الأثر: token قد يتسرّب عبر referer/logs الوسيطة؛ لا توقيع HMAC للتحقّق من المُرسِل.
- العلاج: توقيع HMAC في رأس + تدوير tokens + تقليل ما يكشفه GET.

### SEC-008 — حقن كود مخصّص من الإعدادات
- الدليل: `src/app/layout.tsx:291-298` يمرّر `customHeadCode/customBodyCode` من إعدادات DB إلى `ExternalIntegrations`.
- الأثر: من يملك صلاحية الإعدادات (SUPER_ADMIN/ADMIN) يحقن سكربت في كل الصفحات العامة (مقصود كميزة، لكنه سطح خطر داخلي).
- العلاج: تقييد بـ SUPER_ADMIN + سجل تدقيق + تنبيه عند التغيير.

---

## الإيجابيات المُتحقّقة (Defensive controls قائمة)
- **RBAC**: مصفوفة أدوار بـ first-match prefix (`admin-permissions.ts:65-173`) + بوابة middleware (`middleware.ts:89-118`).
- **SSRF guard**: `media-proxy` allowlist مضيفين + بروتوكول + نوع image + حد حجم (`media-proxy/route.ts:25-101`).
- **Auth throttle**: 8/5د لكل IP وEmail (`auth.ts:153-179`) + bcrypt(12) + حظر المستخدم غير النشط.
- **Headers**: CSP/HSTS(preload)/X-Content-Type-Options/Referrer-Policy/Permissions-Policy (`next.config.ts:81-109`)؛ admin: `X-Frame-Options: DENY` + COOP/CORP.
- **Caching**: `no-store` على admin/login/api-admin (`middleware.ts:127-132`).
- **Lead hardening**: honeypot + توقيت render (`lead-intake-guard`) + IP denylist (`isBlockedIpAddress`) + rate-limit.
- **canonical host redirect** + إزالة trailing slash (`middleware.ts:50-76`).
- **source maps مُعطّلة** في الإنتاج (`next.config.ts:116`)، `poweredByHeader:false`.

## لم يُتحقّق منه (لا وصول)
- هل bootstrap/reCAPTCHA-strict/R2 مفعّلة فعلًا (متغيرات Render).
- هل logs الإنتاج تكشف PII (يتطلب logs).
- `dependency audit` (`npm audit`) — لم يُشغّل لتجنّب لمس `npm`؛ يُنفّذ لاحقًا بأمان: `npm audit --omit=dev`.
- اختبار CORS/CSRF ديناميكي على الإنتاج.
