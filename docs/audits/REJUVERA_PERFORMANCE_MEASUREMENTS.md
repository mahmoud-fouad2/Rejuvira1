# REJUVERA — Performance Measurements

> **فصل المصادر (إلزامي):**
> - **Production (curl):** مقيس فعليًا أدناه — أزمنة استجابة وأحجام HTML. **ليست Lighthouse**، تتضمّن زمن شبكة جهاز الفحص.
> - **Lab (Lighthouse):** **لم يُشغَّل** (غير متاح في هذه البيئة) → PERF-001/PERF-006 تبقى **code/live risks لا قياسات مختبرية**.
> - **Field (CrUX/GA4):** غير متاح [NEEDS-PROD].
> - **Local:** لم يُشغَّل (build/تشغيل محلي تُرك لتجنّب env/DB).

## 1. أزمنة الاستجابة الإنتاجية (curl، median من 3، ثوانٍ) [LIVE]
| الصفحة | median TTFB | total | حجم HTML المنزّل |
|---|---:|---:|---:|
| `/` | 0.675 | 1.058 | **476,967 bytes (~466 KB)** |
| `/services` | 0.680 | 1.052 | 415,964 (~406 KB) |
| `/services/face-neck-lift` | 0.661 | 0.899 | 308,152 (~301 KB) |
| `/doctors` | 0.623 | 0.861 | 332,754 (~325 KB) |
| `/contact` | 0.633 | 0.898 | 353,630 (~345 KB) |
| `/sitemap-pages.xml` | 0.711 | 0.801 | 63,973 |

من smoke run منفصل (single-run، إنتاج): `/` 875ms، `/services` 703ms، بقية الصفحات ~410-460ms، ملفات XML/robots/health ~210-230ms.

## 2. قراءة الأرقام (بحذر)
- **TTFB ~0.62-0.71s موحّد** عبر صفحات مختلفة، بما فيها `sitemap-pages.xml` (يُولَّد من DB) → يتّسق مع **PERF-001** (SSR + قراءة DB لكل طلب، بلا تخزين CDN).
- **تأكيد عدم تخزين CDN:** رؤوس الإنتاج تُظهر `cf-cache-status: DYNAMIC` + `Set-Cookie: __Host-authjs.csrf-token` على الصفحات العامة → Cloudflare لا يخزّن HTML → كل طلب يصل أصل Render.
- **أحجام HTML كبيرة:** الرئيسية ~466KB والخدمات ~406KB HTML (قبل الأصول) → يتّسق مع **PERF-005** (نص AR+EN معًا في DOM + ترميز كثيف). حجم HTML وحده مرتفع وقد يؤثّر على وقت التحليل وLCP على شبكات الموبايل.

## 3. ما لا يمكن إعلانه كقياس
- **LCP/CLS/INP/TBT/Speed Index/Performance score**: غير مقيسة (لا Lighthouse) → **لا تُذكر كأرقام**. تبقى PERF-001/PERF-006/PERF-003 مخاطر مبنية على الكود + إشارات [LIVE] أعلاه.
- **حجم JS/الصور المنفصل**: غير مقيس هنا (يتطلب Lighthouse/تحليل bundle). ملاحظة: `IMAGE_UNOPTIMIZED=1` في Render (`render.yaml:16`) → الصور غير مُحسّنة [CODE]، لكن وزنها الفعلي [UNVERIFIED] دون قياس.

## 4. خطة قياس baseline (لاحقًا، عند توفّر الأداة)
1. Lighthouse mobile+desktop (≥3 runs، median) على: `/`, `/services`, `/services/face-neck-lift`, `/services/neck-lift-surgery`, `/doctors`, `/doctors/loai-alsalmi`, `/contact`, `/journal`, `/p/<slug>`. حفظ JSON تحت `docs/audits/perf/`.
2. تسجيل: Performance/Accessibility/Best-Practices/SEO + LCP/CLS/INP/TBT/SpeedIndex + total bytes + JS + image weight + TTFB.
3. CrUX/PSI Field عند ربط GSC/GA4.
4. عدم خلط Lab/Field/Local/Production في أي مقارنة قبل/بعد.

> الأرقام في القسم 1 صالحة كـ **baseline إنتاجي تقريبي (curl)** للمقارنة بعد إصلاحات الأداء، شرط استخدام نفس الأداة ونفس الظروف عند إعادة القياس.
