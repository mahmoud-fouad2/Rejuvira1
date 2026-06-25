# REJUVERA — Full URL Crawl (Live)

- التاريخ: 2026-06-25. المصدر: زحف فعلي عبر curl لكل URL في `sitemap-pages.xml` + فحوص مستهدفة.
- الأداة: `curl` (status + final URL + canonical + title + meta robots). كل القيم **[LIVE]**.

## 1. ملخّص الزحف
- مصدر القائمة: `https://rejuvera.sa/sitemap.xml` (sitemapindex) → `sitemap-pages.xml` = **86 `<loc>`** + `sitemap-images.xml` = 76 صورة.
- نتيجة زحف الـ86: **كلها HTTP 200**، **لا redirect chains**، **لا canonical mismatch** (كل صفحة self-canonical بعد تطبيع الـ slash)، **لا عناوين مكررة**، **لا canonicals مكررة**، **لا عنوان/كانونيكال فارغ**.
- التوزيع: 34 `/services/*` · 21 `/journal/*` · 12 `/doctors/*` · 9 `/p/*` · 10 ثابتة (`/`, about, contact, services, doctors, devices, gallery, journal, privacy, terms).

## 2. قائمة الخدمات المنشورة (34) [LIVE]
aesthetic-surgery, arm-lift, body-contouring, body-contouring-buttock-augmentation, brazilian-butt-lift, breast-augmentation-reshaping, breast-implant-replacement, breast-reduction, dermatology-consultation, double-chin-liposuction, eyelid-lift-eye-rejuvenation, face-neck-lift, facial-contouring, female-aesthetic-care, full-body-lift, general-surgery-consultation, gynecomastia-surgery, injectable-harmony, laser-hair-removal, lipedema-treatment, liposuction, neck-lift-surgery, neurosurgery-spine-care, obgyn-care, otoplasty, postpartum-vaginal-tightening, pregnancy-delivery-care, rhinoplasty, rhinoplasty-nose-reshaping, sagging-skin-tightening-surgery, skin-rejuvenation, tummy-tuck, upper-lower-eyelid-surgery, vaginal-rejuvenation.

> **تصحيح Phase 0:** التغطية واسعة (34 صفحة)، تشمل الأنف/شفط الدهون/نحت الجسم/الثدي/التثدّي المطلوبة في التكليف. المشكلة ليست الغياب بل **التكرار + جودة العناوين + الفهرسة**.

## 3. صفحات indexable خارج sitemap (SEO-008) [LIVE]
slugs من `core-services.json` تُخدم 200 وself-canonical لكنها **غير مُدرَجة في sitemap**، وتكرّر نية صفحات مُدرَجة:

| URL (خارج sitemap) | status | canonical | يكرّر (داخل sitemap) |
|---|---|---|---|
| `/services/facelift-surgery` | 200 | ذاتي | `/services/face-neck-lift` (عنوانه «شد الوجه ... Facelift») |
| `/services/vaginoplasty` | 200 | ذاتي | `/services/vaginal-rejuvenation` (عنوانه «تجميل المهبل ... Vaginoplasty») |

- الأثر: صفحتان متطابقتا النية لكل مفهوم، كلاهما indexable self-canonical → احتمال cannibalization وتشتيت إشارات.
- **تحقّق مطلوب:** مطابقة كامل slugs الـ`core-services.json` (5) ↔ slugs DB المنشورة (34) لكشف بقية الحالات (تأكَّد من facelift-surgery و vaginoplasty؛ البقية neck-lift-surgery/lipedema-treatment/postpartum-vaginal-tightening موجودة في sitemap).
- العلاج المقترح (لاحقًا): توحيد على slug واحد لكل نية + `redirect 308` من المكرّر، أو `canonical` للمكرّر نحو المعتمد. **قرار قبل التنفيذ** (أيّ slug هو المعتمد؟).

## 4. مرشّحات تطابق النية (cannibalization) داخل sitemap [LIVE]
أزواج تستهدف نية متقاربة بعناوين مختلفة (لا تكرار عنوان، لكن تداخل نية):

| المجموعة | الصفحات | الملاحظة |
|---|---|---|
| الأنف | `rhinoplasty` («تجميل الأنف») + `rhinoplasty-nose-reshaping` («تنسيق وتجميل الأنف») | نيّتان شبه متطابقتين بالعربية |
| الجفون | `eyelid-lift-eye-rejuvenation` + `upper-lower-eyelid-surgery` | كلاهما تجميل جفون |
| الوجه/الرقبة | `face-neck-lift` + `neck-lift-surgery` (+ خارج sitemap `facelift-surgery`) | تداخل شد الوجه/الرقبة |
| نحت/أرداف | `body-contouring` + `body-contouring-buttock-augmentation` + `brazilian-butt-lift` | تداخل تكبير الأرداف/النحت |
| النسائي | `vaginal-rejuvenation` + `postpartum-vaginal-tightening` + `female-aesthetic-care` | تداخل جزئي |

- **ليست كلها خطأ**؛ بعضها نوايا فرعية مشروعة. القرار لكل زوج: إبقاء بتمايز واضح (عنوان/H1/محتوى/كلمة مختلفة) **أو** دمج + redirect. يتطلب قرار محتوى/SEO قبل أي تنفيذ.

## 5. جودة العناوين (CONTENT-006) [LIVE]
- نمط العنوان: `{AR} | ريجوفيرا — {EN} | Rejuvera | Rejuvera Center` → علامة مكرّرة 2-3×، طول مفرط، ولغتان داخل عنوان واحد (EN يظهر في SERP العربي).
- أسماء إنجليزية = slug خام (نقص `nameEn`):
  - `/services/rhinoplasty` → «تجميل الأنف | ريجوفيرا — **rhinoplasty** | Rejuvera | Rejuvera Center»
  - `/services/upper-lower-eyelid-surgery` → «... — **upper-lower-eyelid-surgery** | ...»
- العلاج (لاحقًا، محتوى/DB): ضبط template العنوان لمنع العلامة المكررة + تعبئة `nameEn`/`seoTitleEn` للخدمات الناقصة + تقصير العنوان.

## 6. ما لم يُقَس في الزحف
- لكل URL: H1/meta-description/JSON-LD/hreflang جُمعت عيّنات (الرئيسية + صفحة خدمة) لا للـ86 كاملة (قيود وقت/أدوات) → **سُجِّلت status/canonical/title/robots للـ86**؛ بقية الحقول **[UNVERIFIED per-URL]** وتحتاج زاحفًا كاملًا (Screaming Frog/Sitebulb).
- **Orphan داخلي** (في sitemap بلا رابط داخلي): يتطلب بناء رسم الروابط الداخلي (لم يُنفَّذ كاملًا) — **[UNVERIFIED]**.
- **الصفحات الرقيقة/المتشابهة**: مرشّحات النية أعلاه تحتاج قياس محتوى كامل → موسومة **«تحتاج مراجعة»** لا «مؤكدة رقيقة».
