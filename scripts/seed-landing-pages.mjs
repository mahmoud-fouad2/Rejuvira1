#!/usr/bin/env node
/**
 * seed-landing-pages.mjs
 * Creates 4 starter advertising landing pages in the database.
 * Safe to run multiple times — uses upsert by slug.
 *
 *   node scripts/seed-landing-pages.mjs
 *   LANDING_SEED_FORCE=1 node scripts/seed-landing-pages.mjs  # re-apply all
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LANDING_PAGES = [
  {
    slug: "lp-laser-hair-removal",
    titleAr: "إزالة الشعر بالليزر — ريجوفيرا",
    titleEn: "Laser Hair Removal — Rejuvera",
    seoTitle: "إزالة الشعر بالليزر | مركز ريجوفيرا للتجميل الطبي بالرياض",
    seoDescription:
      "احصلي على بشرة ناعمة ومتجددة مع أحدث تقنيات إزالة الشعر بالليزر في مركز ريجوفيرا بالرياض. حجزك الأول بخصم خاص.",
    noindex: true,
    htmlContent: buildLandingPage({
      titleAr: "إزالة الشعر بالليزر",
      titleEn: "Laser Hair Removal",
      subtitleAr:
        "تقنية ليزر متطورة لإزالة شعر الجسم والوجه بشكل دائم وآمن وبدون ألم",
      subtitleEn:
        "Advanced laser technology for permanent, safe, and painless hair removal for face and body",
      benefits: [
        "نتائج دائمة بعد عدة جلسات",
        "آمن على جميع أنواع البشرة",
        "بدون ألم أو فترة تعافي",
        "أجهزة ليزر معتمدة طبياً",
        "بإشراف طبيب متخصص",
      ],
      ctaLabel: "احجزي جلستك الأولى",
      color: "#4a2476",
    }),
  },
  {
    slug: "lp-botox-filler",
    titleAr: "البوتوكس والفيلر — ريجوفيرا",
    titleEn: "Botox & Filler — Rejuvera",
    seoTitle: "حقن البوتوكس والفيلر | مركز ريجوفيرا الرياض",
    seoDescription:
      "ابدئي رحلة شبابك مع حقن البوتوكس والفيلر الاحترافية بإشراف أطباء معتمدين في مركز ريجوفيرا بالرياض.",
    noindex: true,
    htmlContent: buildLandingPage({
      titleAr: "البوتوكس والفيلر",
      titleEn: "Botox & Filler",
      subtitleAr:
        "حقن احترافية للوجه لتجديد الشباب وتعزيز الملامح بإشراف طبي متخصص",
      subtitleEn:
        "Professional facial injections to rejuvenate and enhance your features under specialist supervision",
      benefits: [
        "نتائج فورية وطبيعية المظهر",
        "بإشراف طبيب متخصص معتمد",
        "مواد حقن معتمدة عالمياً",
        "استشارة مجانية قبل الجلسة",
        "منتجات أصلية مضمونة",
      ],
      ctaLabel: "احجزي استشارة مجانية",
      color: "#7c3aed",
    }),
  },
  {
    slug: "lp-skin-brightening",
    titleAr: "تبييض وتفتيح البشرة — ريجوفيرا",
    titleEn: "Skin Brightening — Rejuvera",
    seoTitle: "تبييض البشرة بالليزر | مركز ريجوفيرا الرياض",
    seoDescription:
      "احصلي على بشرة أكثر إشراقاً وتوحداً مع برامج تبييض وتفتيح البشرة الطبية في مركز ريجوفيرا بالرياض.",
    noindex: true,
    htmlContent: buildLandingPage({
      titleAr: "تبييض وتفتيح البشرة",
      titleEn: "Skin Brightening",
      subtitleAr:
        "برامج متكاملة لتوحيد لون البشرة وإشراقها باستخدام أحدث التقنيات الطبية",
      subtitleEn:
        "Comprehensive programs to even skin tone and achieve a radiant glow using the latest medical technologies",
      benefits: [
        "توحيد لون البشرة",
        "علاج البقع الداكنة والتصبغات",
        "تقنيات ليزر وبيلينج متقدمة",
        "نتائج مرئية بعد الجلسة الأولى",
        "برنامج متابعة شخصي",
      ],
      ctaLabel: "احجزي جلسة تشخيصية",
      color: "#9a6a12",
    }),
  },
  {
    slug: "lp-face-contouring",
    titleAr: "شد الوجه والرقبة — ريجوفيرا",
    titleEn: "Face & Neck Lifting — Rejuvera",
    seoTitle: "شد الوجه بالليزر | مركز ريجوفيرا الرياض",
    seoDescription:
      "ابدئي رحلة الشباب الحقيقي مع تقنيات شد الوجه والرقبة غير الجراحية في مركز ريجوفيرا الطبي بالرياض.",
    noindex: true,
    htmlContent: buildLandingPage({
      titleAr: "شد الوجه والرقبة",
      titleEn: "Face & Neck Lifting",
      subtitleAr:
        "تقنيات غير جراحية لشد وتجديد بشرة الوجه والرقبة مع نتائج طبيعية مذهلة",
      subtitleEn:
        "Non-surgical technologies to lift and renew face and neck skin with stunning natural results",
      benefits: [
        "بدون جراحة أو تخدير",
        "نتائج طبيعية تدريجية",
        "تقنية HIFU والليزر التجميلي",
        "فترة تعافي صفرية",
        "نتائج تدوم من 12 إلى 24 شهراً",
      ],
      ctaLabel: "احجزي جلستك الأولى",
      color: "#0f766e",
    }),
  },
];

function buildLandingPage({ titleAr, titleEn, subtitleAr, subtitleEn, benefits, ctaLabel, color }) {
  const benefitsHtml = benefits
    .map(
      (b) => `
      <div class="lp-benefit-item">
        <span class="lp-benefit-check" style="color:${color}">✓</span>
        <span>${b}</span>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#f8f5ff;color:#1a0f2e;direction:rtl}
  .lp-hero{background:linear-gradient(135deg,${color}ee 0%,${color}99 100%);color:#fff;padding:4rem 1.5rem 5rem;text-align:center}
  .lp-hero h1{font-size:clamp(2rem,5vw,3.2rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:1rem}
  .lp-hero p{font-size:1.1rem;opacity:.9;max-width:560px;margin:0 auto 2.5rem;line-height:1.75}
  .lp-cta-btn{display:inline-block;background:#fff;color:${color};font-size:1rem;font-weight:700;padding:1rem 2.5rem;border-radius:999px;text-decoration:none;box-shadow:0 8px 30px rgba(0,0,0,.25);transition:transform .2s,box-shadow .2s}
  .lp-cta-btn:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(0,0,0,.35)}
  .lp-body{max-width:760px;margin:0 auto;padding:3rem 1.5rem}
  .lp-section-title{font-size:1.6rem;font-weight:700;color:${color};margin-bottom:1.5rem;text-align:center}
  .lp-benefits{display:grid;gap:.9rem;margin-bottom:3rem}
  .lp-benefit-item{display:flex;align-items:center;gap:.75rem;background:#fff;border-radius:1rem;padding:1rem 1.25rem;box-shadow:0 2px 12px rgba(0,0,0,.06);font-size:.95rem;font-weight:500}
  .lp-benefit-check{font-size:1.25rem;font-weight:800;flex-shrink:0}
  .lp-form-card{background:#fff;border-radius:1.75rem;padding:2.5rem 2rem;box-shadow:0 8px 40px rgba(0,0,0,.1);margin-bottom:3rem}
  .lp-form-title{font-size:1.4rem;font-weight:700;margin-bottom:1.5rem;text-align:center;color:${color}}
  .lp-field{margin-bottom:1rem}
  .lp-field label{display:block;font-size:.85rem;font-weight:600;margin-bottom:.4rem;color:#4a3668}
  .lp-field input,.lp-field select{width:100%;padding:.75rem 1rem;border:1.5px solid #e2d9f3;border-radius:.75rem;font-size:.95rem;font-family:inherit;color:#1a0f2e;background:#faf8ff;transition:border-color .2s}
  .lp-field input:focus,.lp-field select:focus{outline:none;border-color:${color}}
  .lp-submit{width:100%;background:linear-gradient(135deg,${color},${color}cc);color:#fff;border:none;border-radius:.9rem;padding:1rem;font-size:1rem;font-weight:700;cursor:pointer;transition:opacity .2s,transform .2s;margin-top:.5rem}
  .lp-submit:hover{opacity:.9;transform:translateY(-2px)}
  .lp-trust{display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;margin-bottom:3rem}
  .lp-trust-item{display:flex;align-items:center;gap:.5rem;background:#fff;border-radius:.9rem;padding:.75rem 1.25rem;font-size:.82rem;font-weight:600;color:#4a3668;box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .lp-trust-icon{font-size:1.1rem}
  .lp-footer{background:${color};color:#fff;text-align:center;padding:1.5rem;font-size:.85rem;opacity:.9}
  @media(max-width:640px){.lp-hero{padding:3rem 1rem 4rem}.lp-form-card{padding:1.75rem 1.25rem}}
</style>
</head>
<body>
<section class="lp-hero">
  <h1>${titleAr}</h1>
  <p>${subtitleAr}</p>
  <a href="#lp-form" class="lp-cta-btn">${ctaLabel}</a>
</section>

<div class="lp-body">
  <h2 class="lp-section-title">لماذا تختارين ريجوفيرا؟</h2>
  <div class="lp-benefits">${benefitsHtml}</div>

  <div class="lp-trust">
    <span class="lp-trust-item"><span class="lp-trust-icon">🏥</span>مركز معتمد طبياً</span>
    <span class="lp-trust-item"><span class="lp-trust-icon">👩‍⚕️</span>أطباء متخصصون</span>
    <span class="lp-trust-item"><span class="lp-trust-icon">⭐</span>+500 عميلة راضية</span>
    <span class="lp-trust-item"><span class="lp-trust-icon">📍</span>الرياض، المملكة العربية السعودية</span>
  </div>

  <div class="lp-form-card" id="lp-form">
    <p class="lp-form-title">احجزي موعدك الآن</p>
    <form method="POST" action="/api/contact/submit">
      <input type="hidden" name="source" value="lp-${titleAr.replace(/\s+/g, "-")}" />
      <div class="lp-field">
        <label>الاسم الكريم *</label>
        <input type="text" name="name" placeholder="اسمك الكريم" required />
      </div>
      <div class="lp-field">
        <label>رقم الجوال *</label>
        <input type="tel" name="phone" placeholder="05XXXXXXXX" required dir="ltr" />
      </div>
      <div class="lp-field">
        <label>الخدمة المطلوبة</label>
        <input type="text" name="service" value="${titleAr}" />
      </div>
      <div class="lp-field">
        <label>ملاحظات إضافية (اختياري)</label>
        <input type="text" name="notes" placeholder="أي تفاصيل إضافية" />
      </div>
      <button type="submit" class="lp-submit">${ctaLabel}</button>
    </form>
  </div>
</div>

<footer class="lp-footer">
  مركز ريجوفيرا للتجميل الطبي — الرياض، المملكة العربية السعودية<br />
  جميع الحقوق محفوظة © ${new Date().getFullYear()} Rejuvera Center
</footer>
</body>
</html>`;
}

async function main() {
  console.log("🚀 Seeding landing pages...");
  let created = 0;
  let skipped = 0;

  for (const page of LANDING_PAGES) {
    const existing = await prisma.customPage.findUnique({
      where: { slug: page.slug },
    });

    if (existing && process.env.LANDING_SEED_FORCE !== "1") {
      console.log(`  ⏭  Skipped (exists): /p/${page.slug}`);
      skipped++;
      continue;
    }

    await prisma.customPage.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        titleAr: page.titleAr,
        titleEn: page.titleEn,
        htmlContent: page.htmlContent,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        noindex: page.noindex,
        status: "DRAFT",
      },
      update: {
        titleAr: page.titleAr,
        titleEn: page.titleEn,
        htmlContent: page.htmlContent,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        noindex: page.noindex,
      },
    });

    console.log(`  ✅ Upserted: /p/${page.slug}`);
    created++;
  }

  console.log(
    `\n✨ Done — ${created} created/updated, ${skipped} skipped.`,
  );
  console.log(
    "   Go to /admin/pages to edit, publish, and preview them.",
  );
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
