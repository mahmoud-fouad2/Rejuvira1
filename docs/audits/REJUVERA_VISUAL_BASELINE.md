# REJUVERA — Visual & Mobile Baseline

- التاريخ: 2026-06-25.
- **حالة اللقطات: لم تُلتقط.** أدوات هذه البيئة لا توفّر متصفحًا متّصلًا/Chrome headless لالتقاط screenshots لموقع خارجي بشكل موثوق.
- **التزامًا بقاعدتك:** لا أُصدر أي حكم جمالي/بصري (overlap, spacing, تناسق, tap targets, CLS) دون لقطة أو دليل بصري. ما يلي ينقسم إلى: (أ) إشارات HTML-level مُتحقَّقة [LIVE]، (ب) قائمة الالتقاط المطلوبة لاحقًا.

## أ) إشارات قابلة للتحقق بلا تصيير (HTML/headers) [LIVE]
| إشارة | النتيجة | دليل |
|---|---|---|
| viewport meta | موجود | `<meta name="viewport" content="width=device-width, initial-scale=1"/>` |
| اتجاه/لغة الجذر | صحيح | `<html lang="ar" dir="rtl" data-lang="ar" data-theme="light">` |
| theme-color | موجود | `viewport.themeColor=#4a2476` (`layout.tsx:25`) + meta حي |
| خط عربي | IBM Plex Sans Arabic محلي عبر next/font | `layout.tsx:43-99` |
| حاوية منع التمدّد الأفقي | الرئيسية تستخدم `overflow-x-clip max-w-full min-w-0` | `app/page.tsx:53` |
| تبديل اللغة | عبر `data-lang` + أصناف `lang-ar/lang-en` (CSS) | `layout.tsx:199-214` |

> هذه إشارات إيجابية على الأساسيات (mobile viewport + RTL)، لكنها **لا تُغني** عن الفحص البصري الفعلي (لا تكشف overlap/CLS/قص الصور/أحجام اللمس).

## ب) قائمة الالتقاط المطلوبة (baseline قبل أي تعديل مرئي)
**المقاسات:** Mobile 390×844 · Mobile صغير 360×800 · Tablet 768×1024 · Desktop 1440×900.
**الصفحات:**
1. `/`
2. `/services`
3. `/services/face-neck-lift` (شد الوجه — المنشورة في sitemap)
4. `/services/neck-lift-surgery` (شد الرقبة)
5. `/doctors`
6. `/doctors/loai-alsalmi` (طبيب)
7. `/contact`
8. `/journal`
9. `/journal/skin-renewal-timing` (مقال)
10. صفحة هبوط منشورة `/p/<slug>` (اختر من 9 المتاحة)
11. صفحة QR / interactive guide **إن وُجدت منشورة** (لم تُرصد كنوع route مستقل — تحقّق).

**ما يُفحَص ويُوثَّق بصريًا (لكل مقاس):** RTL، اتجاه الأرقام، horizontal scroll، تداخل عناصر، صور مكسورة/مقصوصة، القوائم/المودالات وسلوك الإغلاق، sticky CTA، تخطيط النموذج (خصوصًا قائمة الخدمات الطويلة)، typography، spacing، اتساق بصري، أحجام مناطق اللمس (≥44px).

## ج) طريقة الالتقاط المقترحة (لاحقًا)
- متصفح متّصل (Claude-in-Chrome / Playwright) بأربعة viewports، أو أداة CI مثل Playwright `screenshot` مع device presets، أو خدمة Lighthouse/WebPageTest التي تُرفق لقطات.
- حفظ اللقطات تحت `docs/audits/visual/<page>__<WxH>.png` لمقارنة قبل/بعد عند أي تعديل مرئي.

## د) خلاصة
- **لا توجد أحكام بصرية في هذا التقرير.**
- الأساسيات (viewport/RTL/خط) مُتحقَّقة [LIVE]؛ ما عداها **[UNVERIFIED]** حتى تُلتقط اللقطات.
- أي مرحلة علاج تمسّ واجهة **يجب** أن تبدأ بالتقاط baseline من هذه القائمة.
