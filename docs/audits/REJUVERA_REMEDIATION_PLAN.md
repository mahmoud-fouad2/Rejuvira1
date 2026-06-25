# REJUVERA — Remediation Plan (خطة العلاج)

- مبني على نتائج التقارير في هذا المجلد. كل مرحلة **صغيرة ومستقلة**، تُنفَّذ فقط بعد اعتمادك.
- بوابات كل مرحلة: `npm run lint` → `npm run typecheck` → `npm run build` → `npm run test:smoke`، مراجعة `git diff`، تأكيد غياب secrets وmigrations غير مقصودة. لا push عند فشل بوابة. لا `--force`.
- حماية التصميم: baseline screenshots (Desktop+Mobile, AR-RTL) قبل/بعد أي تغيير مرئي؛ التحقق من عدم ظهور horizontal scroll/CLS.
- **لا migration ولا تغيير env إلا حيث يُذكر صراحة أدناه.**

## ترتيب الأولويات
P0 (أمان/بيانات/فهرسة حرجة) → P1 (تحويل/أداء عالي الأثر) → P2 (SEO/معمارية) → P3 (تحسينات).

---

## P0 — حرج

### Phase P0.1 — تأمين `/api/leads` بـ reCAPTCHA (SEC-001/TRACK-004)
- المشاكل: leads هبوط بلا تحقّق بوت → سبام CRM + تلويث تحويلات.
- الملفات: `src/app/api/leads/route.ts` (إضافة استدعاء `verifyRecaptchaToken`)، التأكد أن `ContactForm`/نماذج الهبوط ترسل `recaptchaToken` (مراجعة `src/components/forms/*`).
- المخاطر: رفض leads شرعية إن لم يُرسَل token → نفّذ بنفس نمط contact (يحترم `RECAPTCHA_STRICT`؛ fail-open عند غياب secret).
- الاختبارات: lint/typecheck/build؛ POST token صالح → 201، token ضعيف مع strict → 403، بلا secret → يمر (توافق dev).
- rollback: عودة الملف (تغيير واحد معزول).
- نتيجة متوقّعة: انخفاض سبام leads + دقّة أعلى لـ `generate_lead`.
- migration: لا. env: يستخدم `RECAPTCHA_*` القائمة. منصّات: لا.

### Phase P0.2 — تقوية/تقييد `/api/analytics` (SEC-002/PERF-002)
- المشاكل: نقطة عامة بلا حد + كتابة DB لكل نداء → DoS سجلات/تكلفة.
- الملفات: `src/app/api/analytics/route.ts` (إضافة `rateLimit` + حد حجم body + حارس origin).
- قرار مرافق (يُعرض عليك): الإبقاء على الكتابة مع sampling/batching **أو** الاستغناء لصالح GA4.
- المخاطر: فقدان بعض pageviews الداخلية (مقبول؛ GA4 بديل).
- الاختبارات: تجاوز الحد → 429؛ body ضخم → رفض؛ smoke.
- rollback: عودة الملف.
- نتيجة: حماية DB + ثبات تكلفة. migration/env/منصّات: لا.

### Phase P0.3 — منع تكرار الـ lead لكل (هاتف+خدمة) (BUG-001)
- المشاكل: استفسار ثانٍ لخدمة مختلفة يُقمع كمكرّر → ضياع lead.
- الملفات: `src/lib/content-repository.ts` (`createContactLead` حول 4591-4630): تضييق شرط التكرار ليشمل الخدمة، أو نافذة أقصر، أو إشعار CRM «استفسار متكرر» بدل القمع الكامل.
- المخاطر: عودة بعض التكرار الحقيقي → خفّفها بإبقاء نافذة قصيرة لنفس (هاتف+خدمة) فقط.
- الاختبارات: طلبان بخدمتين/نفس الرقم → حفظ الاثنين + webhook للثاني؛ طلبان متطابقان سريعان → يبقى المنع.
- rollback: عودة منطق الدالة.
- نتيجة: لا ضياع leads مشروعة. **migration: لا** (منطق فقط، لا تغيير schema). env: اختياري `LEAD_*_WINDOW_MINUTES` القائمة.

### Phase P0.4 — حسم استراتيجية hreflang/اللغة (SEO-001) — *قرار أولًا*
- المشاكل: hreflang EN يشير إلى `?lang=en` الذي يُعيد canonical للعربية → لا فهرسة EN، إشارات متضاربة.
- خيار A (موصى به قصير المدى): **إسقاط hreflang EN** والإبقاء على تبديل العرض، وتقديم الموقع كعربي أحادي الفهرسة. تعديل `src/lib/seo.ts:21-35` (إزالة بدائل en من `alternates`).
- خيار B (استراتيجي): مسارات `/en/...` حقيقية بمحتوى وcanonical خاص (جهد كبير، مرحلة منفصلة).
- المخاطر: A يلغي أي إشارة EN قائمة (محدودة الأثر فعليًا)؛ B كبير.
- الاختبارات: فحص رؤوس الصفحة بعد التغيير (curl) لغياب hreflang المتضارب؛ build.
- rollback: عودة `seo.ts`.
- نتيجة: إشارات لغة نظيفة. migration/env/منصّات: لا (A). **يتطلب قرارك بين A/B.**

---

## P1 — أثر عالٍ

### Phase P1.1 — caching/ISR لطبقة المحتوى العام (PERF-001)
- المشاكل: `force-dynamic` عام + DB لكل طلب + conn=1.
- الملفات: `src/app/layout.tsx:22` (مراجعة الحاجة للـ force-dynamic على الجذر)، طبقة `getRuntimeSettings`/قراءات المحتوى في `content-repository.ts` (إدخال `unstable_cache`/`revalidate`), صفحات عامة (`revalidate` بدل dynamic حيث آمن).
- المخاطر: عرض محتوى قديم بعد تحديث admin → استخدم `revalidatePath`/tags عند التحرير (موجود بالفعل لبعض المسارات).
- الاختبارات: build؛ تأكيد أن admin/api يبقى ديناميكيًا؛ تحقّق تحديث المحتوى بعد revalidate؛ قياس TTFB قبل/بعد.
- rollback: إزالة caching.
- نتيجة: TTFB أقل، ضغط DB أقل. migration: لا. env: لا. منصّات: لا (يفضّل لاحقًا رفع conn limit في Render إن سمحت الخطة).

### Phase P1.2 — تفعيل تحسين الصور (PERF-006) — *تحقّق Render*
- المشاكل: `IMAGE_UNOPTIMIZED=1` يعطّل avif/webp/resize.
- التغيير: في **Render env** إزالة/تعطيل `IMAGE_UNOPTIMIZED` (أو خدمة صور R2 مُحسّنة). **هذا تغيير منصّة، يتطلب وصولك إلى Render.**
- المخاطر: استهلاك ذاكرة sharp مقابل `MAX_OLD_SPACE_SIZE=384` → راقب الذاكرة؛ بديل: pre-optimize على R2.
- الاختبارات: مقارنة أحجام/صيَغ الصور المخدومة؛ Lighthouse LCP قبل/بعد.
- rollback: إعادة المتغير.
- نتيجة: LCP أفضل موبايل. **env/منصّات: نعم (Render).** migration: لا.

### Phase P1.3 — نموذج lead inline + تعبئة مسبقة على صفحات الخدمة (LEAK-1/LEAK-2)
- المشاكل: لا نموذج على صفحة الخدمة + قائمة 40+ خيارًا.
- الملفات: مكوّن صفحة الخدمة `src/app/services/[slug]/page.tsx` + مكوّن نموذج (إعادة استخدام `ContactForm` مع `serviceSlug` مُعبّأ) + احترام تصميم/هوية.
- المخاطر: تغيير مرئي → baseline screenshots + الحفاظ على CSS/هوية + reCAPTCHA (بعد P0.1).
- الاختبارات: إرسال lead من صفحة الخدمة (DB + webhook + تتبّع نجاح)؛ موبايل/RTL؛ CLS.
- rollback: إزالة القسم.
- نتيجة: تقصير الرحلة، رفع التحويل. migration/env: لا.

### Phase P1.4 — تخفيف MutationObserver لحقول UTM (PERF-003)
- الملفات: `src/app/layout.tsx:286` (استبدال المراقب العام بملء عند التحميل/الإرسال أو مراقبة محصورة بالنماذج).
- المخاطر: عدم ملء حقول مضافة ديناميكيًا → اربط الملء بحدث submit أيضًا.
- الاختبارات: تأكيد بقاء utm/landing في الـ lead؛ قياس INP قبل/بعد.
- rollback: عودة السكربت. migration/env: لا.

---

## P2 — مهم

### Phase P2.1 — توحيد منطق الـ leads في وحدة مشتركة (DUP-001/ARCH-001/2)
- الملفات: إنشاء `src/lib/lead-intake/` (parse/normalize/guards/webhook-payload/response)، ثم إعادة توصيل `api/contact`, `api/leads`, `api/webhooks/[token]` عليها تدريجيًا (سلوك مطابق).
- المخاطر: تغيير سلوك خفي → خطوات صغيرة + typecheck + اختبار كل مسار بعد كل خطوة.
- نتيجة: منع تكرار الثغرات (مثل SEC-001 مستقبلًا). migration/env: لا.

### Phase P2.2 — schema الصفحات: Breadcrumb/MedicalProcedure/Physician/FAQ
- الملفات: `src/lib/seo.ts` (بناة schema) + صفحات الخدمة/الطبيب/المقال.
- شرط: FAQPage فقط عند ظهور FAQ فعليًا (P1.3/محتوى)؛ لا review schema بلا تقييمات حقيقية.
- نتيجة: rich results أدق. migration/env: لا.

### Phase P2.3 — تنظيف sitemap/trailing-slash (SEO-002/005)
- الملفات: `seo-sitemaps.ts`, `seo.ts`, `next.config.ts` (رؤوس) — تقليص ألياس sitemap وتوحيد سياسة slash للجذر.
- المخاطر: تغيير URLs مفهرسة → أبقِ redirects 308 لأي مسار قديم.
- نتيجة: إشارات أنظف في GSC. migration/env: لا.

---

## P3 — تحسينات

- **P3.1** أحداث WhatsApp/Call متمايزة + (اختياري) Meta CAPI خادمي (TRACK-003/005).
- **P3.2** تقسيم god files (`content-repository.ts`) تدريجيًا (ARCH-003).
- **P3.3** مراجعة SVG upload (SEC-004) + قرار CSP nonce (SEC-005).
- **P3.4** baseline أداء (Lighthouse متعدّد الصفحات) + ربط GSC/GA4 للقياس.
- **P3.5** توسيع تغطية الخدمات حسب `REJUVERA_KEYWORD_MAP.md` (عمق قبل اتساع).
- **P3.6** تنظيف dead code بعد `knip`/`depcheck` + تحقّق يدوي (DEAD report).

---

## مصفوفة Impact × Risk × Effort × Confidence
> مقياس: H/M/L. Confidence = ثقة التشخيص (لا الأثر التجاري).

| Phase | Impact | Risk | Effort | Confidence |
|---|---|---|---|---|
| P0.1 reCAPTCHA leads | H | L | L | H |
| P0.2 analytics hardening | M | L | L | H |
| P0.3 dedup fix | H | M | M | H |
| P0.4 hreflang (A) | M | L | L | H |
| P1.1 caching/ISR | H | M | M | M |
| P1.2 image opt | H | M | L | H |
| P1.3 inline form | H | M | M | H |
| P1.4 UTM observer | M | L | L | H |
| P2.1 lead module | M | M | M | H |
| P2.2 page schema | M | L | M | M |
| P2.3 sitemap/slug | L | M | L | M |
| P3.* | M-L | L-M | متفاوت | M |

## متطلبات خارج الكود (تحتاجك)
- **Render env**: P1.2 (تحسين الصور)، ومراجعة `IMAGE_UNOPTIMIZED`/conn limit/bootstrap vars (SEC-003).
- **Google platforms**: ربط GSC/GA4/Ads/Meta للقياس والتحقق من التتبّع (TRACK-002) — لا يمكن تنفيذه من الكود.
- **قرارك المطلوب**: P0.4 (خيار A أم B للغة)، وسياسة P0.2 (إبقاء analytics أم الاستغناء)، وأولوية توسيع الخدمات.
- **لا توجد database migration مطلوبة** في P0–P2 كما هي مخطّطة (كلها منطق/إعداد/واجهة).

## تعريف النجاح لكل مرحلة
لا وظائف مكسورة، النماذج تحفظ leads حقيقية، لا تتبّع وهمي، لا تراجع أداء/SEO/تصميم، البوابات خضراء، وكل تغيير مدعوم بمقارنة قبل/بعد.
