# REJUVERA — Performance Baseline

> **فصل مصادر البيانات (إلزامي):**
> - **Lab (Lighthouse):** لم يُقَس في هذه الجولة (لم تُشغَّل أداة Lighthouse) — يلزم تشغيله كـ baseline.
> - **Field (CrUX/GA4):** غير متاح (لا وصول).
> - **Local dev:** لم يُشغَّل (`npm ci`/`dev` متروك عمدًا لأن `postinstall`+build يلمسان migrations/DB).
> - **Production (HTTP حي):** مُقاس جزئيًا عبر curl (رؤوس/حالة فقط، لا توقيتات موثوقة).
> ما يلي **تحليل مُشتق من الكود** + إشارات حية، وليس أرقام Core Web Vitals مقيسة.

## إشارات حية مؤكدة (curl)
- الرئيسية: `200`, `Cache-Control: public, max-age=0, s-maxage=60, must-revalidate` (CDN قصير 60ث).
- رؤوس preload لملفات CSS موجودة (`link: ... rel=preload as=style`).
- لا source maps إنتاجية (`next.config.ts:116`).

## مخاطر الأداء (بدليل كودي)

### PERF-001 (High) — لا static/ISR؛ DB لكل طلب
- `src/app/layout.tsx:22` → `force-dynamic` على الجذر يُجبر كل الصفحات على SSR لكل طلب.
- كل صفحة عامة: `getRuntimeSettings()` (DB)؛ الرئيسية: 6 استعلامات (`page.tsx:42-50`).
- `render.yaml:27-28`: `PRISMA_RUNTIME_CONNECTION_LIMIT=1` → تسلسل الوصول إلى DB.
- الأثر المتوقّع: TTFB مرتفع تحت التزامن، اختناق DB، فشل توسّع على خطة starter.
- العلاج: ISR/`revalidate` أو cache (`unstable_cache`/data cache) لطبقة المحتوى العام؛ إبقاء `force-dynamic` للوحة/الـ API فقط.

### PERF-006 (Medium-High) — تحسين الصور مُعطّل
- `render.yaml:16-17`: `IMAGE_UNOPTIMIZED=1`؛ بينما `next.config.ts:129-142` يعرّف avif/webp وأحجام أجهزة.
- الأثر: الصور تُخدم كما هي (لا resize/avif) → LCP أكبر على الموبايل.
- العلاج: تفعيل تحسين Next (sharp متوفّر على Render) أو خدمة صور R2 مُحسّنة مسبقًا بأحجام responsive، مع التحقق من الذاكرة (`MAX_OLD_SPACE_SIZE=384`).

### PERF-002 (Medium) — كتابة DB لكل page view
- `src/app/api/analytics/route.ts:139` يكتب `AppLog` لكل زيارة عامة (يُستدعى من `PageViewTracker`).
- الأثر: DB على المسار الحرج مرتين لكل زيارة (إعدادات + analytics)، تكلفة ونمو جدول.
- العلاج: الاعتماد على GA4 للـ pageviews، أو batching/sampling/كتابة غير متزامنة خارج المسار الحرج.

### PERF-003 (Medium) — MutationObserver عام
- `src/app/layout.tsx:286`: مراقب على `document.documentElement` (`childList+subtree`) يعيد `querySelectorAll` لكل المدخلات عند أي تغيير DOM، لملء حقول UTM.
- الأثر: عمل متكرر على main thread → INP/jank على الصفحات الديناميكية.
- العلاج: ملء الحقول مرة عند `DOMContentLoaded` + عند submit (delegation)، أو مراقبة محدودة بحاوية النماذج.

### PERF-004 (Low) — HTML غير حتمي للرئيسية
- `app/page.tsx:35-39`: `randomInt` لترتيب المقالات لكل طلب → يمنع أي استفادة من caching ويغيّر DOM.

### PERF-005 (Info) — ازدواج نص AR+EN في DOM
- تبديل اللغة عبر CSS يعني شحن نص اللغتين في كل صفحة (`layout.tsx` + أصناف `lang-*`) → DOM/HTML أثقل.

### PERF-007 (Info) — مؤثرات بصرية عميل
- `CustomCursor` (`layout.tsx:278`) + `IntersectionObserver` للكشف عند التمرير (`layout.tsx:299-305`) + مستمع scroll للهيدر (`:306-312`). مقبولة لكن تُراجَع على الموبايل ومع `prefers-reduced-motion`.

## خطة قياس baseline (قبل أي إصلاح)
1. Lighthouse (mobile + desktop) على: `/`, `/services`, `/services/facelift-surgery`, `/doctors`, `/doctors/loai-alsalmi`, `/contact`, `/journal`, `/p/[نموذج هبوط]`. حفظ JSON.
2. WebPageTest/PSI لقياس LCP/CLS/TTFB لنفس الصفحات (lab).
3. ربط CrUX/GA4 لاحقًا (field) — غير متاح الآن.
4. تسجيل bundle لكل route (`next build` analyze) — لم يُشغَّل (تجنّب لمس build).
> لا تُخلَط هذه المصادر في أي تقرير قبل/بعد.

## لم يُتحقّق منه
- توقيتات LCP/INP/CLS/TTFB الفعلية، أحجام bundle، N+1 في الاستعلامات (تتطلب logs/تشغيل)، سلوك CDN التفصيلي.
