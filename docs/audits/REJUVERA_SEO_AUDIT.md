# REJUVERA — Technical SEO Audit

- المصدر: كود (`seo.ts`, `seo-sitemaps.ts`, `layout.tsx`, `middleware.ts`) + فحص حي (curl، 2026-06-24).
- لا وصول GSC/GA4 → **لا ادعاء ترتيب/أداء**؛ هذا فحص تقني للإشارات.

## ما هو سليم (مؤكد حيًّا/كودًا)
- **robots.txt** حي وصحيح: يمنع `/admin`,`/api/admin`,`/api/auth`,`/forbidden`,`/login`؛ يعلن 4 sitemaps (curl).
- **404 حقيقي** لمسار غير موجود (curl 404)، **`/admin` → 307** (لا soft-404).
- **canonical** ذاتي على الرئيسية: `<link rel="canonical" href="https://rejuvera.sa"/>` (curl).
- **meta robots** `index, follow` + `X-Robots-Tag: all` (curl).
- **JSON-LD** حيّة: `MedicalBusiness` + `WebSite` + `Person` (curl)؛ تتضمّن `medicalSpecialty`, `openingHours` (سبت-خميس 14:00-22:00), `geo`, `areaServed: Riyadh` (`seo.ts:116-198`).
- **sitemaps** برمجية: index → pages + images (`seo-sitemaps.ts:320-392`)، مع image sitemap وalt/caption.
- **OG/Twitter** + `metadataBase` + favicons (`layout.tsx:101-159`)، meta جغرافية `geo.region SA-01`/`geo.position` (`seo.ts:106-112`).
- **خرائط الكلمات في البيانات**: عناوين/أوصاف/كلمات AR+EN جاهزة لكل خدمة أساسية (`data/core-services.json`).

## المشاكل (بدليل)

### SEO-001 (High) — hreflang إنجليزي غير فعّال
- الدليل الحي: `hrefLang="en" href="https://rejuvera.sa/?lang=en"` بينما `canonical = https://rejuvera.sa` (curl).
- الكود: `seo.ts:21-35` (en alternate = `?lang=en`) و`:62` (canonical من `input.path` بلا lang). الإنجليزية تبديل CSS داخل نفس DOM (`layout.tsx:199-201,214`).
- الأثر: صفحة `?lang=en` تُعلن canonical للعربية → Google يطوي البديل الإنجليزي ولا تتحقّق فهرسة إنجليزية؛ إشارة لغة متضاربة.
- العلاج (قرار استراتيجي): إمّا (أ) مسارات إنجليزية حقيقية `/en/...` بمحتوى وcanonical خاص وhreflang متبادل صحيح، أو (ب) إسقاط hreflang الإنجليزي والتعامل كموقع عربي أحادي الفهرسة (مع إبقاء تبديل العرض). لا تُترك الحالة الحالية.
- تحقّق: بعد الإصلاح، فحص hreflang عبر أداة + GSC International Targeting.

### SEO-002 (Low) — اتساق trailing slash
- الدليل: canonical الرئيسية بلا slash (`https://rejuvera.sa`) بينما `getCanonicalPath("/")` يُرجع `.../` (`seo.ts:16-19`) وsitemap للجذر `/`. middleware يزيل الـ slash لغير الجذر (`middleware.ts:64-76`).
- الأثر: تذبذب طفيف في تمثيل الجذر؛ غير حرج لكن يُوحَّد.
- العلاج: توحيد سياسة الجذر (بلا slash) عبر canonical + sitemap + روابط داخلية.

### SEO-003 (Medium) — فجوة تغطية الخدمات
- الدليل: `data/core-services.json` يحوي 5 خدمات أساسية فقط (شد الوجه، شد الرقبة، الوذمة الشحمية، تجميل المهبل، تضييق بعد الولادة). كلمات الهدف في التكليف تشمل: تجميل الأنف، شفط الدهون، نحت الجسم/الفيزر، شد البطن/الذراعين/الأفخاذ، عمليات الثدي (تكبير/تصغير/شد)، التثدّي.
- الأثر: غياب صفحات إجراء مخصّصة لنوايا بحثية تجارية مهمّة.
- العلاج: راجع `REJUVERA_KEYWORD_MAP.md` (بنية hub→category→procedure→doctor). **لم يُتحقّق** من محتوى DB الفعلي (قد توجد خدمات إضافية منشورة عبر seed/CMS) — يلزم استعلام DB/لوحة الإدارة.

### SEO-004 (Low) — استبعاد مسارات غير ASCII من sitemap
- الدليل: `seo-sitemaps.ts:63-72` (`isCleanSitemapPath`) يرفض الأحرف غير ASCII والحروف الكبيرة.
- الأثر: حاليًا لا ضرر (الـ slugs ASCII)؛ خطر كامن إن أُضيفت slugs عربية.
- العلاج: السماح بـ percent-encoding للمسارات العربية إن استُخدمت.

### SEO-005 (Info) — تعدّد ألياس sitemap
- الدليل: `SITEMAP_PATHS` يشمل `sitemap.xml`(index) + legacy `sitemap-index.xml` + `sitemap-pages.xml` + legacy `sitemap2.xml` + images؛ robots يعلن 4.
- الأثر: تكرار غير ضار؛ يُفضّل تقليصه إلى index واحد + الفرعية لتجنّب الالتباس في GSC.

### SEO-006 (Low) — `format-detection: telephone=no`
- الدليل: `seo.ts:107`. يُعطّل الربط التلقائي للأرقام.
- الأثر: إن لم تكن أزرار الاتصال روابط `tel:` صريحة، تتأثر تجربة النقر للاتصال على الموبايل. **يلزم تحقّق**: تأكيد أن CTAs للاتصال تستخدم `tel:` (لم يُفحَص مكوّن الاتصال بالكامل بعد).

### SEO-007 (Info) — تذبذب HTML للصفحة الرئيسية
- الدليل: `app/page.tsx:35-39` يدوّر ترتيب المقالات بـ `randomInt` لكل طلب → HTML غير ثابت، يُضعِف أي caching/إشارات ثبات.
- العلاج: تدوير على فترات (مثلاً يومي) لا لكل طلب، أو على العميل.

## مقارنة routes ↔ sitemap ↔ الحي
- كل أنواع الصفحات العامة في الكود ممثّلة في منطق sitemap وتستجيب 200 حيًّا (راجع Route Inventory).
- المستبعد عمدًا من sitemap: `/career`,`/login`,`/forbidden`,`/blog`(redirect) — صحيح.
- **لم يُتحقّق**: مطابقة عدد URLs الفعلي في `sitemap-pages.xml` الحي مع عدد الصفحات المنشورة في DB (يتطلب DB).

## بنية معلوماتية وروابط داخلية
- التنقّل الرئيسي + footer يوفّران روابط للأقسام (Header/Footer components) — يلزم تحقّق بصري للعمق وروابط breadcrumb.
- **توصية**: إضافة `BreadcrumbList` schema + breadcrumbs مرئية على صفحات الخدمة/الطبيب/المقال، وربط داخلي service↔doctor↔journal (cluster).
