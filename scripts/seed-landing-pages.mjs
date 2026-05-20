#!/usr/bin/env node
/**
 * Creates ready-to-edit advertising landing pages in CustomPage.
 *
 * Safe by default: existing pages are skipped so admin edits are preserved.
 * Use LANDING_SEED_FORCE=1 only when you intentionally want to re-apply
 * the template over existing seeded pages.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const timeOptions = [
  ["14:00", "2:00 م"],
  ["14:30", "2:30 م"],
  ["15:00", "3:00 م"],
  ["15:30", "3:30 م"],
  ["16:00", "4:00 م"],
  ["16:30", "4:30 م"],
  ["17:00", "5:00 م"],
  ["17:30", "5:30 م"],
  ["18:00", "6:00 م"],
  ["18:30", "6:30 م"],
  ["19:00", "7:00 م"],
  ["19:30", "7:30 م"],
  ["20:00", "8:00 م"],
  ["20:30", "8:30 م"],
  ["21:00", "9:00 م"],
  ["21:30", "9:30 م"],
  ["22:00", "10:00 م"],
];

const pages = [
  {
    slug: "campaign-rhinoplasty-riyadh",
    title: "تجميل الأنف في الرياض",
    titleEn: "Rhinoplasty in Riyadh",
    serviceSlug: "rhinoplasty",
    accent: "#5a2a86",
    image: "/media/curated/service-injectables.webp",
    eyebrow: "تناغم الوجه يبدأ من تفاصيل دقيقة",
    headline: "أنف متناسق يحافظ على ملامحك الطبيعية",
    intro:
      "ابدئي بخطة تجميل أنف مبنية على تحليل ملامح الوجه، التنفس، والتوقعات الواقعية، للوصول إلى نتيجة متوازنة بلا مبالغة.",
    bullets: [
      "تقييم طبي لشكل الأنف من الأمام والجانب.",
      "مناقشة واضحة لما يمكن تحسينه وما لا يناسب الحالة.",
      "خطة جراحية تراعي التناسق مع الذقن والشفاه والجبهة.",
      "متابعة قبل وبعد العملية لضمان تعاف آمن ومنظم.",
    ],
    proof: ["نتائج طبيعية", "استشارة متخصصة", "خطة فردية"],
    cta: "احجزي تقييم تجميل الأنف",
  },
  {
    slug: "campaign-body-contouring-riyadh",
    title: "نحت الجسم وشفط الدهون",
    titleEn: "Body Contouring in Riyadh",
    serviceSlug: "liposuction-body-contouring",
    accent: "#3b6f6a",
    image: "/media/reference/legacy/88985959.webp",
    eyebrow: "قوام أوضح بتخطيط طبي",
    headline: "نحت جسم يركز على التناسق، لا على المقاس فقط",
    intro:
      "للحالات المناسبة، يساعد نحت الجسم وشفط الدهون على تحسين مناطق الدهون الموضعية وإبراز الانسيابية بشكل طبيعي ومدروس.",
    bullets: [
      "تحديد مناطق الدهون والترهل قبل اختيار التقنية.",
      "خطة مناسبة للبطن، الخصر، الظهر، الذراعين أو الفخذين.",
      "شرح واقعي لفترة التعافي ووقت ظهور النتيجة.",
      "ربط الخطة بالوزن، مرونة الجلد، وتناسق الجسم كاملًا.",
    ],
    proof: ["تقييم قوام شامل", "نتائج متدرجة", "متابعة طبية"],
    cta: "احجزي استشارة نحت الجسم",
  },
  {
    slug: "campaign-breast-aesthetics-riyadh",
    title: "تجميل وتنسيق الصدر",
    titleEn: "Breast Aesthetics in Riyadh",
    serviceSlug: "breast-augmentation",
    accent: "#8a4ec1",
    image: "/media/curated/service-skin-rejuvenation.webp",
    eyebrow: "توازن أنثوي يناسب جسمك",
    headline: "اختيار الحجم والشكل المناسب يبدأ بالتقييم الصحيح",
    intro:
      "سواء كان الهدف تكبير الصدر، شد الصدر، أو تحسين التناسق، يتم التخطيط بناءً على شكل الجسم والأنسجة والتوقعات الطبيعية.",
    bullets: [
      "مقاسات وخيارات تناسب عرض الصدر وشكل الجسم.",
      "شرح الفرق بين التكبير، الشد، والتصغير حسب الحالة.",
      "تركيز على مظهر طبيعي ومتوازن.",
      "متابعة واضحة قبل وبعد الإجراء.",
    ],
    proof: ["تخطيط فردي", "نتيجة متناسقة", "خصوصية كاملة"],
    cta: "احجزي استشارة تجميل الصدر",
  },
  {
    slug: "campaign-face-neck-lift-riyadh",
    title: "شد الوجه والرقبة",
    titleEn: "Face and Neck Lift",
    serviceSlug: "non-surgical-face-neck-lift",
    accent: "#245d74",
    image: "/media/curated/device-laser-platform.webp",
    eyebrow: "ملامح أكثر تحديدًا بدون مبالغة",
    headline: "خطة شد الوجه والرقبة حسب درجة الترهل",
    intro:
      "اختيار شد الوجه الجراحي أو غير الجراحي يعتمد على درجة الترهل وجودة الجلد. في ريجوفيرا يتم تقييم الحالة قبل أي توصية.",
    bullets: [
      "تقييم الفك، الخدين، والرقبة بشكل منفصل.",
      "اختيار بين الأجهزة، الإجراءات غير الجراحية، أو الجراحة عند الحاجة.",
      "التركيز على مظهر طبيعي يحافظ على الهوية.",
      "شرح النتائج المتوقعة ومدة التعافي بوضوح.",
    ],
    proof: ["تقييم دقيق", "خيارات متعددة", "نتيجة طبيعية"],
    cta: "احجزي تقييم شد الوجه",
  },
  {
    slug: "campaign-skin-rejuvenation-riyadh",
    title: "تجديد البشرة وشد الجلد",
    titleEn: "Skin Rejuvenation",
    serviceSlug: "skin-rejuvenation-tightening",
    accent: "#b17a2a",
    image: "/media/curated/service-skin-rejuvenation.webp",
    eyebrow: "بشرة أكثر صفاءً بتقنيات حديثة",
    headline: "برنامج مخصص لتحسين النضارة، المسام، والملمس",
    intro:
      "يعتمد برنامج تجديد البشرة على تشخيص نوع الجلد واحتياجه، ثم اختيار التقنية المناسبة لتحسين النضارة والشد والملمس تدريجيًا.",
    bullets: [
      "تقييم التصبغات، المسام، الندبات، وجودة البشرة.",
      "استخدام تقنيات مثل Exion وMorpheus8 حسب الحاجة.",
      "خطة جلسات واضحة مع تعليمات قبل وبعد.",
      "نتائج تدريجية ومظهر أكثر صحة ونضارة.",
    ],
    proof: ["تشخيص بشرة", "أجهزة حديثة", "خطة جلسات"],
    cta: "احجزي جلسة تقييم البشرة",
  },
  {
    slug: "campaign-laser-hair-removal-riyadh",
    title: "إزالة الشعر بالليزر",
    titleEn: "Laser Hair Removal",
    serviceSlug: "laser-hair-removal",
    accent: "#6d3f9c",
    image: "/media/curated/service-laser-hair-removal.jpg",
    eyebrow: "راحة ونعومة ضمن خطة آمنة",
    headline: "جلسات ليزر منظمة حسب نوع البشرة وكثافة الشعر",
    intro:
      "يتم تحديد الخطة بناءً على لون البشرة وكثافة الشعر والمنطقة المطلوبة، مع تعليمات واضحة للحصول على تجربة أكثر راحة وأمانًا.",
    bullets: [
      "جلسات للوجه والجسم حسب احتياج كل حالة.",
      "تقييم نوع البشرة قبل بدء الخطة.",
      "تعليمات قبل وبعد الجلسة لتقليل التهيج.",
      "متابعة منتظمة لتحسين النتائج عبر الجلسات.",
    ],
    proof: ["خطة آمنة", "جلسات مريحة", "متابعة منظمة"],
    cta: "احجزي جلسة الليزر",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildLandingPage(page) {
  const bullets = page.bullets
    .map(
      (item) => `
        <li>
          <span class="rv-ad-lp__tick">✓</span>
          <span>${escapeHtml(item)}</span>
        </li>`,
    )
    .join("");

  const proof = page.proof
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");

  const timeSelect = timeOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");

  return `
<style>
.rv-ad-lp{--accent:${page.accent};--ink:#24143d;--muted:#756986;--surface:#fff;--soft:#f7f2fb;direction:rtl;text-align:right;color:var(--ink);font-family:inherit;background:linear-gradient(180deg,#fff 0%,var(--soft) 100%);border-radius:1.5rem;overflow:hidden}
.rv-ad-lp *{box-sizing:border-box}
.rv-ad-lp__hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(18rem,.95fr);gap:clamp(1.5rem,4vw,4rem);align-items:center;min-height:clamp(34rem,70vh,46rem);padding:clamp(2rem,6vw,5.5rem);background:radial-gradient(circle at 15% 15%,color-mix(in srgb,var(--accent) 20%,transparent),transparent 28rem),linear-gradient(135deg,#fff 0%,color-mix(in srgb,var(--accent) 8%,#fff) 100%)}
.rv-ad-lp__eyebrow{display:inline-flex;width:max-content;border:1px solid color-mix(in srgb,var(--accent) 24%,transparent);border-radius:999px;background:#fff;padding:.45rem .8rem;color:var(--accent);font-size:.78rem;font-weight:900}
.rv-ad-lp h1{max-width:12ch;margin:.9rem 0 1rem;font-size:clamp(2.4rem,6vw,5rem);line-height:1.02;font-weight:950;letter-spacing:0;color:var(--ink)}
.rv-ad-lp__intro{max-width:40rem;color:var(--muted);font-size:clamp(1rem,1.4vw,1.22rem);line-height:1.9}
.rv-ad-lp__actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.6rem}
.rv-ad-lp__btn{display:inline-flex;align-items:center;justify-content:center;min-height:3.1rem;border-radius:999px;padding:.85rem 1.35rem;text-decoration:none;font-weight:900}
.rv-ad-lp__btn--primary{background:var(--accent);color:#fff;box-shadow:0 16px 34px color-mix(in srgb,var(--accent) 24%,transparent)}
.rv-ad-lp__btn--ghost{border:1px solid color-mix(in srgb,var(--accent) 24%,transparent);background:#fff;color:var(--accent)}
.rv-ad-lp__visual{position:relative;min-height:24rem;border-radius:2rem;overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,#fff);box-shadow:0 28px 80px rgba(36,20,61,.16)}
.rv-ad-lp__visual img{width:100%;height:100%;min-height:24rem;object-fit:cover;margin:0;border-radius:0;display:block}
.rv-ad-lp__proof{position:absolute;inset:auto 1rem 1rem 1rem;display:flex;flex-wrap:wrap;gap:.45rem}
.rv-ad-lp__proof span{border-radius:999px;background:rgba(255,255,255,.92);padding:.48rem .72rem;color:var(--ink);font-size:.78rem;font-weight:850;backdrop-filter:blur(10px)}
.rv-ad-lp__body{display:grid;grid-template-columns:minmax(0,.9fr) minmax(20rem,1fr);gap:clamp(1.2rem,4vw,3rem);padding:clamp(2rem,6vw,5rem)}
.rv-ad-lp__panel,.rv-ad-lp__form{border:1px solid rgba(36,20,61,.08);border-radius:1.25rem;background:#fff;padding:clamp(1.2rem,3vw,2rem);box-shadow:0 18px 44px rgba(36,20,61,.08)}
.rv-ad-lp__panel h2,.rv-ad-lp__form h2{margin:0 0 1rem;font-size:clamp(1.45rem,2.5vw,2.1rem);font-weight:950;color:var(--ink)}
.rv-ad-lp__list{display:grid;gap:.75rem;margin:0;padding:0;list-style:none}
.rv-ad-lp__list li{display:flex;gap:.7rem;align-items:flex-start;border-radius:1rem;background:var(--soft);padding:.9rem;color:var(--ink);line-height:1.7;font-weight:750}
.rv-ad-lp__tick{display:grid;place-items:center;width:1.45rem;height:1.45rem;flex:0 0 auto;border-radius:999px;background:var(--accent);color:#fff;font-weight:950}
.rv-ad-lp__field{display:grid;gap:.35rem;margin-bottom:.75rem}
.rv-ad-lp__field label{color:var(--ink);font-size:.82rem;font-weight:850}
.rv-ad-lp__field input,.rv-ad-lp__field select,.rv-ad-lp__field textarea{width:100%;border:1px solid rgba(36,20,61,.14);border-radius:.85rem;background:#fbf9fd;color:var(--ink);padding:.85rem 1rem;font:inherit}
.rv-ad-lp__field textarea{min-height:5.5rem;resize:vertical}
.rv-ad-lp__submit{width:100%;border:0;border-radius:1rem;background:var(--accent);color:#fff;padding:1rem 1.2rem;font:inherit;font-weight:950;cursor:pointer;box-shadow:0 14px 30px color-mix(in srgb,var(--accent) 25%,transparent)}
.rv-ad-lp__note{margin-top:.8rem;color:var(--muted);font-size:.78rem;line-height:1.7;text-align:center}
.rv-ad-lp__footer{padding:1.25rem;text-align:center;color:var(--muted);font-size:.82rem}
@media(max-width:900px){.rv-ad-lp__hero,.rv-ad-lp__body{grid-template-columns:1fr}.rv-ad-lp h1{max-width:100%}.rv-ad-lp__visual{min-height:18rem}.rv-ad-lp__visual img{min-height:18rem}}
@media(max-width:540px){.rv-ad-lp{border-radius:0}.rv-ad-lp__hero,.rv-ad-lp__body{padding:1.2rem}.rv-ad-lp__actions{display:grid}.rv-ad-lp__btn{width:100%}}
</style>
<section class="rv-ad-lp" data-uploaded-html="true" aria-label="${escapeHtml(page.title)}">
  <div class="rv-ad-lp__hero">
    <div>
      <span class="rv-ad-lp__eyebrow">${escapeHtml(page.eyebrow)}</span>
      <h1>${escapeHtml(page.headline)}</h1>
      <p class="rv-ad-lp__intro">${escapeHtml(page.intro)}</p>
      <div class="rv-ad-lp__actions">
        <a class="rv-ad-lp__btn rv-ad-lp__btn--primary" href="#lead-form">${escapeHtml(page.cta)}</a>
        <a class="rv-ad-lp__btn rv-ad-lp__btn--ghost" href="tel:0114999959">اتصلي الآن</a>
      </div>
    </div>
    <div class="rv-ad-lp__visual">
      <img src="${page.image}" alt="${escapeHtml(page.title)}" loading="eager" />
      <div class="rv-ad-lp__proof">${proof}</div>
    </div>
  </div>
  <div class="rv-ad-lp__body">
    <div class="rv-ad-lp__panel">
      <h2>لماذا هذه الصفحة مناسبة للحملة؟</h2>
      <ul class="rv-ad-lp__list">${bullets}</ul>
    </div>
    <form id="lead-form" class="rv-ad-lp__form" method="post" action="/api/leads">
      <h2>احجزي استشارتك</h2>
      <input type="hidden" name="source" value="${page.slug}" />
      <input type="hidden" name="preferredLanguage" value="ar" />
      <input type="hidden" name="serviceSlug" value="${page.serviceSlug}" />
      <div class="rv-ad-lp__field">
        <label>الاسم الكامل *</label>
        <input name="fullName" type="text" required placeholder="اكتبي الاسم الكامل" />
      </div>
      <div class="rv-ad-lp__field">
        <label>رقم الجوال *</label>
        <input name="phone" type="tel" required inputmode="tel" dir="ltr" placeholder="05xxxxxxxx" />
      </div>
      <div class="rv-ad-lp__field">
        <label>البريد الإلكتروني (اختياري)</label>
        <input name="email" type="email" dir="ltr" placeholder="name@example.com" />
      </div>
      <div class="rv-ad-lp__field">
        <label>تاريخ الموعد المفضل</label>
        <input name="preferredDate" type="date" />
      </div>
      <div class="rv-ad-lp__field">
        <label>الوقت المفضل</label>
        <select name="preferredTime">
          <option value="">اختاري الوقت</option>
          ${timeSelect}
        </select>
      </div>
      <div class="rv-ad-lp__field">
        <label>ملاحظات مختصرة</label>
        <textarea name="appointmentNotes" placeholder="اكتبي أي تفاصيل مهمة للفريق الطبي"></textarea>
      </div>
      <button class="rv-ad-lp__submit" type="submit">${escapeHtml(page.cta)}</button>
      <p class="rv-ad-lp__note">مواعيدنا من السبت إلى الخميس من 2:00 م إلى 10:00 م. الجمعة إجازة.</p>
    </form>
  </div>
  <p class="rv-ad-lp__footer">Rejuvera Medical Center · الرياض · info@rejuvera.sa</p>
</section>`;
}

async function main() {
  console.log("Seeding 6 advertising landing pages...");
  let upserted = 0;
  let skipped = 0;
  const force = process.env.LANDING_SEED_FORCE === "1";

  for (const page of pages) {
    const existing = await prisma.customPage.findUnique({
      where: { slug: page.slug },
      select: { id: true },
    });

    if (existing && !force) {
      console.log(`Skipped existing page: /p/${page.slug}`);
      skipped += 1;
      continue;
    }

    await prisma.customPage.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        titleAr: page.title,
        titleEn: page.titleEn,
        htmlContent: buildLandingPage(page),
        seoTitle: `${page.title} | Rejuvera Medical Center`,
        seoDescription: page.intro,
        noindex: false,
        status: "PUBLISHED",
      },
      update: {
        titleAr: page.title,
        titleEn: page.titleEn,
        htmlContent: buildLandingPage(page),
        seoTitle: `${page.title} | Rejuvera Medical Center`,
        seoDescription: page.intro,
        noindex: false,
        status: "PUBLISHED",
      },
    });

    console.log(`Ready: /p/${page.slug}`);
    upserted += 1;
  }

  console.log(`Done. ${upserted} created/updated, ${skipped} skipped.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
