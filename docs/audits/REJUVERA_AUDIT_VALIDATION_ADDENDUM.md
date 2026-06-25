# REJUVERA — Audit Validation & Missing Evidence Addendum (Phase 0.5)

- تاريخ التحقق: **2026-06-25**
- الفرع: `audit/rejuvera-master-audit-2026-06-24` (التقارير فقط، لا كود إنتاجي).
- الغرض: التحقق من نتائج Phase 0، سدّ الفجوات بأدلة فعلية، وتصحيح ما كان غير دقيق.

## مفتاح مستوى التحقق (Verification taxonomy)
- **[CODE]** مُتحقَّق من الكود.
- **[LIVE]** مُتحقَّق من الموقع الحي (curl/DNS/headers).
- **[TEST]** مُتحقَّق بأداة/اختبار آلي شُغّل فعليًا.
- **[UNVERIFIED]** لم يُتحقَّق.
- **[NEEDS-PROD]** يتطلب وصول إنتاج/منصّة غير متاح.

---

## 1. الأوامر التي نُفِّذت فعليًا (Phase 0.5)
| الأمر | النتيجة |
|---|---|
| `git switch -c audit/rejuvera-master-audit-2026-06-24` + commit docs | ✅ 12 تقريرًا commit على الفرع (لا main، لا push) |
| `npm run lint` | ✅ **PASS** (exit 0) [TEST] |
| `npm run typecheck` (`tsc --noEmit`) | ✅ **PASS** (exit 0) [TEST] |
| `SMOKE_BASE_URL=https://rejuvera.sa npm run test:smoke` | ⚠️ **FAIL** (exit 1) — 18 PASS / 1 FAIL [TEST] |
| `npx knip@5` | ✅ شُغّل (exit 1 = نتائج) [TEST] |
| crawl 86 URLs (curl) | ✅ كلها 200 [LIVE] |
| DNS `nslookup` + `curl -I` | ✅ بصمة استضافة [LIVE] |
| قياس زمن curl (median×3) | ✅ أرقام إنتاج [LIVE] |

> **لم يُشغَّل:** `npm ci` (لتجنّب مسح node_modules العامل وفقدان Prisma client المُولّد)، `npm run build` (next build قد يتطلب env؛ وملف build في Render يشغّل migration+seed — تُرك)، Lighthouse (غير متاح في هذه البيئة).

## 2. اختبارات فشلت (موثّقة بصدق)
### test:smoke — 1 فشل من 19
- الفشل: `/sitemap.xml` → `missing:<urlset`.
- السبب الحقيقي: `/sitemap.xml` يُرجع الآن `<sitemapindex>` (فهرس صحيح SEO) بينما توقّع smoke-test القديم `<urlset` (`scripts/smoke-test.mjs:23`).
- **سابق للتعديلات؟** نعم — لم أعدّل أي كود؛ الفشل قائم في الإنتاج/الكود الحالي.
- يمنع النشر؟ نعم، إن كان smoke gate إلزاميًا في CI → **بوابة حمراء قائمة**.
- التصنيف: **TEST-001 (Medium)** — توقّع smoke قديم. العلاج (لاحقًا، بموافقة): تحديث التوقّع إلى `<sitemapindex` لـ `/sitemap.xml` أو توجيهه لـ `/sitemap-pages.xml`.

## 3. تصحيحات جوهرية لنتائج Phase 0 (مهم)
### CORR-1 — تغطية الخدمات: ليست 5 بل **34 صفحة خدمة منشورة** [LIVE]
- Phase 0 استند إلى `data/core-services.json` (5 خدمات «أساسية») وخلص خطأً إلى فجوة تغطية كبيرة.
- الواقع الحي (zحف `sitemap-pages.xml`): **86 URL** = 34 خدمة + 21 مقال + 12 طبيب + 9 صفحات هبوط + 10 ثابتة.
- 34 خدمة تشمل فعليًا: rhinoplasty، liposuction، tummy-tuck، arm-lift، full-body-lift، breast-augmentation-reshaping، breast-reduction، breast-implant-replacement، gynecomastia-surgery، body-contouring، brazilian-butt-lift، otoplasty، eyelid... إلخ.
- **الأثر على SEO-003:** يُخفَّض من «فجوة تغطية» إلى **«مشكلة تكرار/تطابق نية + جودة عناوين»** (انظر CORR-2/CORR-3). معظم كلمات التكليف **مغطّاة بصفحات بالفعل**.

### CORR-2 — صفحات indexable خارج sitemap + تكرار نية [LIVE]
- `/services/facelift-surgery` → 200، **self-canonical**، **غير موجود في sitemap**، يكرّر نية `/services/face-neck-lift` (الموجود في sitemap ويحمل عنوان «شد الوجه ... Facelift»).
- `/services/vaginoplasty` → 200، self-canonical، غير موجود في sitemap، يكرّر `/services/vaginal-rejuvenation`.
- السبب: slugs في `core-services.json` (facelift-surgery، vaginoplasty) تختلف عن slugs المنشورة في DB (face-neck-lift، vaginal-rejuvenation)؛ كلاهما يُخدم 200 ويُفهرس.
- **جديد: SEO-008 (Medium)** — صفحات indexable مكررة النية خارج sitemap → تشتيت فهرسة/cannibalization محتمل. تفاصيل في `REJUVERA_FULL_URL_CRAWL.md`.

### CORR-3 — جودة العناوين: تفرّع وعلامة مكررة وأسماء = slug [LIVE]
- العنوان الفعلي نمط: `{AR} | ريجوفيرا — {EN} | Rejuvera | Rejuvera Center` → **علامة مكررة 2-3 مرّات** وعنوان طويل ثنائي اللغة.
- بعض الخدمات بلا `nameEn` فيظهر **الـ slug الخام** كاسم إنجليزي: `/services/rhinoplasty` → «... — rhinoplasty | ...»، `/services/upper-lower-eyelid-surgery` → «... — upper-lower-eyelid-surgery | ...».
- **جديد: CONTENT-006 (Medium)** — عناوين طويلة + علامة مكررة + أسماء إنجليزية ناقصة (slug خام). تفاصيل في crawl.

### CORR-4 — المعمارية الآن **مُتحقَّقة حيًّا** (لم تعد كودًا فقط) [LIVE]
- DNS: `www.rejuvera.sa` → CNAME `gcp-us-west1-1.origin.onrender.com.cdn.cloudflare.net`؛ apex A `216.24.57.1`.
- Headers: `Server: cloudflare` + `CF-RAY` + `cf-cache-status: DYNAMIC`؛ و`x-render-origin-server: Render` + `rndr-id`.
- **لا** بصمة Vercel/Netlify/Fly. النتيجة: **Next.js على Render**، خلف **Cloudflare CDN/proxy**، الوسائط على R2. (تفاصيل في `REJUVERA_SECURITY_VALIDATION_ADDENDUM.md`.)
- تعزيز PERF-001: `cf-cache-status: DYNAMIC` + `Set-Cookie: __Host-authjs.csrf-token` على كل صفحة عامة → HTML غير مُخزَّن في CDN → كل طلب يصل أصل Render (SSR+DB).

## 4. حالة كل finding بعد التحقق (تحديث)
| ID | قبل | بعد التحقق |
|---|---|---|
| PERF-001 | CODE | **CODE+LIVE** (cf DYNAMIC + TTFB~0.65s موحّد) |
| PERF-006 | CODE | CODE (env Render) — [NEEDS-PROD] للقياس |
| SEO-001 hreflang | CODE+LIVE | مؤكد LIVE |
| SEO-003 تغطية | CODE | **مُصحَّح → CORR-1** (34 صفحة؛ المشكلة تكرار لا غياب) |
| SEO-008 dup/خارج sitemap | — | **جديد** CODE+LIVE |
| CONTENT-006 عناوين | — | **جديد** LIVE |
| BUG-001 dedup | CODE | CODE (جدول حالات أدناه) |
| SEC-001 leads recaptcha | CODE | CODE |
| SEC-002 analytics | CODE | CODE + **dep map** (يُقرأ من admin Stats — لا يُحذف) |
| SEC-003 bootstrap | CODE/UNVERIFIED | بند مستقل P0 (أدناه) |
| TEST-001 smoke | — | **جديد** TEST (بوابة حمراء) |
| الاستضافة | CODE | **LIVE** (CORR-4) |
| 86 URLs status | — | **LIVE** كلها 200، لا dup titles/canonicals |

## 5. جدول حالات اختبار dedup (P0.3 — قبل أي تعديل كود)
> القاعدة الحالية: تكرار = نفس الهاتف ضمن نافذة (حتى 12 ساعة) بغضّ النظر عن الخدمة (`content-repository.ts:4591-4630`). المطلوب تصميم قاعدة دقيقة. **لا تعديل قبل اعتماد هذا الجدول.**

| # | السيناريو | المتوقّع |
|---|---|---|
| T1 | نفس الهاتف + نفس الخدمة + نفس الصفحة + خلال دقائق | duplicate حقيقي (قمع webhook) |
| T2 | نفس الهاتف + **خدمة مختلفة** | **lead جديد** (حفظ + webhook) |
| T3 | نفس الهاتف + نفس الخدمة بعد مدة معقولة (>نافذة قصيرة) | متابعة جديدة / activity جديدة (لا قمع صامت) |
| T4 | general inquiry بلا خدمة، متكرر | لا يُقمع بشكل دائم؛ يُربط/يُسجَّل activity |
| T5 | نقر مزدوج/إرسال مزدوج بعد نجاح خلال ثوانٍ | لا ينشئ عشرات السجلات (idempotency قصير) |
| T6 | أي duplicate | لا يختفي صامتًا عن CRM؛ يُربط بالسجل أو يُسجَّل كـ activity |

التصميم المقترح (للنقاش، ليس تنفيذًا): مفتاح idempotency قصير جدًا (ثوانٍ) لمنع الإرسال المزدوج + نافذة «نفس (هاتف+خدمة)» قصيرة للـ duplicate + إنشاء lead/activity لخدمة مختلفة + عدم قمع general inquiry بشكل دائم + تسجيل activity مرئية للـ CRM بدل الإسقاط الصامت.

## 6. ما زال [UNVERIFIED] / [NEEDS-PROD]
- Lighthouse/CWV الميدانية، GSC/GA4/Ads/Meta، متغيرات Render (bootstrap/R2/recaptcha-strict)، محتوى DB التفصيلي، لقطات بصرية (انظر `REJUVERA_VISUAL_BASELINE.md`)، اختبار unauth **POST** على admin APIs (تجنّب إنشاء بيانات — اكتُفي بـ CODE + GET=405).

## 7. لا تعديل كود
لم يُعدَّل أي ملف إنتاجي في Phase 0.5. كل التغييرات ملفات توثيق تحت `docs/audits/`.
