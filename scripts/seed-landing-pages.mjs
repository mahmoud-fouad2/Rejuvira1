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

const sharedServices = [
  { value: "general-inquiry", label: "استفسار عام" },
  { value: "rhinoplasty", label: "عمليات تجميل الأنف" },
  { value: "liposuction", label: "شفط الدهون" },
  { value: "body-sculpting-surgery", label: "نحت الجسم الجراحي" },
  { value: "tummy-tuck", label: "شد البطن" },
  { value: "breast-augmentation", label: "تكبير وتنسيق الصدر" },
  { value: "breast-lift", label: "شد وتصغير الصدر" },
  { value: "eyelid-lift", label: "شد الجفون" },
  { value: "female-aesthetic-care", label: "التجميل النسائي" },
  { value: "male-gynecomastia-surgery", label: "علاج التثدي عند الرجال" },
];

const pages = [
  {
    campaignSegment: "general-aesthetic-center",
    slug: "lp-beauty-center-riyadh",
    title: "مركز تجميل في الرياض",
    titleEn: "Aesthetic Medical Center in Riyadh",
    headline: "اكتشفي خطتك التجميلية في ريجوفيرا بخطوات واضحة وآمنة",
    eyebrow: "مركز تجميل طبي متكامل في الرياض",
    intro:
      "ابدئي باستشارة دقيقة تجمع بين تقييم الطبيب، فهم توقعاتك، واختيار الخدمة المناسبة بدون ضغط أو مبالغة.",
    serviceSlug: "general-inquiry",
    serviceLabel: "استفسار عام",
    sourceLabel: "صفحة هبوط - مركز تجميل عام",
    accent: "#5c2484",
    image: "/media/curated/clinic-interior.jpeg",
    offer: "استشارة أولية لتحديد الأنسب لحالتك",
    bullets: [
      "تقييم طبي واضح قبل اختيار أي إجراء.",
      "خدمات جراحية وغير جراحية داخل مركز واحد.",
      "فريق استقبال يتابع الطلب ويؤكد التفاصيل بسرعة.",
      "تجربة هادئة تناسب الباحثين عن نتيجة طبيعية ومتوازنة.",
    ],
    sections: [
      ["خدمات متعددة", "الوجه، الجسم، الجلدية، التجميل النسائي، والأجهزة."],
      ["قرار أوضح", "نشرح لك الخيارات المناسبة وحدود كل إجراء قبل الحجز."],
      ["متابعة منظمة", "فريق الاستقبال يتابع طلبك ويؤكد التفاصيل خلال ساعات العمل."],
    ],
    faqs: [
      ["هل أحتاج لاختيار خدمة محددة؟", "يمكنك اختيار استفسار عام وسيتم توجيهك للخدمة الأنسب بعد التواصل."],
      ["هل الاستشارة مناسبة قبل اتخاذ القرار؟", "نعم، الهدف هو فهم الحالة والتأكد من ملاءمة الإجراء."],
      ["هل يمكن تغيير الخدمة لاحقًا؟", "نعم، الفريق يراجع البيانات ويقترح المسار الأنسب بعد التواصل."],
    ],
  },
  {
    campaignSegment: "liposuction-body-contouring",
    slug: "lp-liposuction-body-contouring-riyadh",
    title: "شفط الدهون ونحت الجسم في الرياض",
    titleEn: "Liposuction and Body Contouring in Riyadh",
    headline: "قوام أوضح بخطة نحت جسم تناسب شكل جسمك وهدفك",
    eyebrow: "شفط الدهون ونحت الجسم",
    intro:
      "لمن لديهم دهون موضعية أو رغبة في تحسين تناسق القوام، تبدأ الخطة بتقييم توزيع الدهون ومرونة الجلد قبل تحديد الإجراء.",
    serviceSlug: "liposuction",
    serviceLabel: "شفط الدهون ونحت الجسم",
    sourceLabel: "صفحة هبوط - شفط الدهون ونحت الجسم",
    accent: "#3e6d68",
    image: "/media/reference/legacy/88985959.webp",
    offer: "تقييم مناطق النحت وخطة التعافي",
    bullets: [
      "تحديد هل الأنسب شفط دهون، نحت، أو دمج مع شد الجلد.",
      "مناقشة مناطق البطن، الخصر، الظهر، الذراعين، والفخذين.",
      "شرح واقعي لفترة التعافي ومتى تظهر النتيجة.",
      "ربط الخطة بالأطباء المناسبين حسب الحالة.",
    ],
    sections: [
      ["دهون موضعية", "خطة مناسبة للمناطق التي لا تستجيب بسهولة للرياضة."],
      ["تناسق كامل", "التركيز على شكل الجسم كاملًا وليس منطقة واحدة فقط."],
      ["توقعات واقعية", "شرح ما يمكن تحقيقه وما يحتاج إلى بدائل أو مراحل."],
    ],
    faqs: [
      ["هل شفط الدهون ينقص الوزن؟", "هو لتحسين التناسق وإزالة دهون موضعية، وليس بديلًا عن نزول الوزن."],
      ["هل كل الحالات تحتاج جراحة؟", "لا، القرار يعتمد على الفحص ودرجة الترهل ومرونة الجلد."],
      ["متى تظهر النتيجة؟", "تظهر تدريجيًا مع انخفاض التورم واستقرار الأنسجة."],
    ],
  },
  {
    campaignSegment: "face-neck-eyelid-lift",
    slug: "lp-face-neck-eyelid-lift-riyadh",
    title: "شد الوجه والرقبة والجفون",
    titleEn: "Face, Neck and Eyelid Lift",
    headline: "ملامح أكثر تحديدًا مع الحفاظ على الشكل الطبيعي",
    eyebrow: "شد الوجه والرقبة والجفون",
    intro:
      "يبدأ القرار الصحيح بتقييم الخدين، الفك، الرقبة، والجفون لتحديد هل الأنسب إجراء جراحي، جهاز، أو خطة غير جراحية.",
    serviceSlug: "eyelid-lift",
    serviceLabel: "شد الوجه والرقبة والجفون",
    sourceLabel: "صفحة هبوط - شد الوجه والرقبة والجفون",
    accent: "#245d74",
    image: "/media/curated/device-emface.jpg",
    offer: "تقييم ملامح الوجه ودرجة الترهل",
    bullets: [
      "تقييم الترهل حول الفك والرقبة والجفون بشكل منفصل.",
      "شرح الفرق بين الشد الجراحي، الأجهزة، والخيارات غير الجراحية.",
      "خطة تحافظ على الهوية الطبيعية للوجه.",
      "متابعة واضحة قبل وبعد الإجراء عند الحاجة.",
    ],
    sections: [
      ["تحديد الفك", "تحسين الخط السفلي للوجه حسب درجة الترهل."],
      ["الجفون", "تقييم الجلد الزائد والانتفاخ وتأثيره على مظهر العين."],
      ["الرقبة", "اختيار الخطة المناسبة للارتخاء أو فقدان التحديد."],
    ],
    faqs: [
      ["هل الفيلر يكفي بدل الشد؟", "يعتمد ذلك على درجة الترهل وفقدان الحجم، ولا توجد إجابة واحدة لكل الحالات."],
      ["هل النتيجة تكون مبالغ فيها؟", "الهدف في ريجوفيرا هو تحسين التناسق مع الحفاظ على المظهر الطبيعي."],
      ["هل يمكن علاج الجفون وحدها؟", "نعم، إذا كان الاحتياج محصورًا حول العينين."],
    ],
  },
  {
    campaignSegment: "rhinoplasty",
    slug: "lp-rhinoplasty-riyadh",
    title: "تجميل الأنف في الرياض",
    titleEn: "Rhinoplasty in Riyadh",
    headline: "أنف متناسق يكمّل ملامحك بدون تغيير مبالغ فيه",
    eyebrow: "عمليات تجميل الأنف",
    intro:
      "تجميل الأنف الناجح يبدأ من فهم تناسق الأنف مع الذقن، الشفاه، والجبهة، مع مراعاة التنفس والنتيجة الواقعية.",
    serviceSlug: "rhinoplasty",
    serviceLabel: "عمليات تجميل الأنف",
    sourceLabel: "صفحة هبوط - تجميل الأنف",
    accent: "#6b3aa0",
    image: "/media/curated/service-injectables.webp",
    offer: "تقييم شكل الأنف من الأمام والجانب",
    bullets: [
      "تحليل شكل الأنف وعلاقته بباقي ملامح الوجه.",
      "مناقشة ما يمكن تحسينه وما لا يناسب الحالة.",
      "مراعاة الجانب الوظيفي والتنفس عند الحاجة.",
      "شرح خطة التعافي والتوقعات قبل اتخاذ القرار.",
    ],
    sections: [
      ["تناسق الوجه", "الهدف ليس التصغير فقط، بل الانسجام مع الملامح."],
      ["وظيفة التنفس", "يتم الانتباه للجانب الوظيفي عند وجود مشكلة."],
      ["توقعات واضحة", "شرح واقعي للنتيجة الممكنة وحدود الإجراء."],
    ],
    faqs: [
      ["هل يمكن اختيار شكل أنف من صورة؟", "الصور تساعد في فهم الذوق، لكن الخطة تعتمد على ملامحك وبنية الأنف."],
      ["هل النتيجة تظهر فورًا؟", "النتيجة تتحسن تدريجيًا مع انخفاض التورم."],
      ["هل كل حالات الأنف تحتاج جراحة؟", "يتم تحديد ذلك بعد الفحص والتقييم."],
    ],
  },
  {
    campaignSegment: "breast-surgery",
    slug: "lp-breast-surgery-riyadh",
    title: "عمليات الصدر في الرياض",
    titleEn: "Breast Surgery in Riyadh",
    headline: "تناسق أنثوي مدروس حسب شكل الجسم والهدف المطلوب",
    eyebrow: "تكبير، شد، تصغير، وتنسيق الصدر",
    intro:
      "اختيار حجم وشكل الصدر لا يعتمد على المقاس فقط، بل على عرض الصدر، طبيعة الأنسجة، شكل الجسم، وتوقعاتك.",
    serviceSlug: "breast-augmentation",
    serviceLabel: "عمليات الصدر",
    sourceLabel: "صفحة هبوط - عمليات الصدر",
    accent: "#8d4fb2",
    image: "/media/reference/legacy/56549.webp",
    offer: "تحديد المقاس والخيار الأنسب",
    bullets: [
      "مناقشة التكبير، الشد، التصغير، أو تغيير الحشوات حسب الحالة.",
      "اختيار المقاس وفق التناسق وليس الرغبة المجردة في حجم أكبر.",
      "شرح نوع الحشوة وموضعها عندما تكون مناسبة.",
      "تركيز على نتيجة طبيعية ومتوازنة مع الجسم.",
    ],
    sections: [
      ["تكبير الصدر", "امتلاء مخطط بما يناسب عرض الصدر وشكل الجسم."],
      ["شد وتصغير", "تحسين الترهل أو الحجم لتحقيق راحة وتناسق أفضل."],
      ["تغيير الحشوات", "مراجعة الشكل أو الحجم السابق بخطة أوضح."],
    ],
    faqs: [
      ["كيف أختار الحجم المناسب؟", "يتم الاختيار بعد قياسات وفحص الأنسجة ومناقشة توقعاتك."],
      ["هل النتيجة طبيعية؟", "الهدف هو شكل متناسق مع الجسم وليس حجمًا مبالغًا فيه."],
      ["هل يمكن دمج الشد مع التكبير؟", "بعض الحالات تستفيد من الدمج، ويحدد ذلك الطبيب بعد الفحص."],
    ],
  },
  {
    campaignSegment: "tummy-tuck-body-lift",
    slug: "lp-tummy-tuck-body-lift-riyadh",
    title: "شد البطن وشد الترهلات",
    titleEn: "Tummy Tuck and Body Lift",
    headline: "تخلصي من الترهلات بخطة شد تناسب الحمل أو نزول الوزن",
    eyebrow: "شد البطن وشد الترهلات",
    intro:
      "بعد الحمل أو نزول الوزن، قد يحتاج الجسم إلى تقييم الجلد والعضلات ومناطق الترهل قبل اختيار شد البطن أو شد الجسم.",
    serviceSlug: "tummy-tuck",
    serviceLabel: "شد البطن وشد الترهلات",
    sourceLabel: "صفحة هبوط - شد البطن وشد الترهلات",
    accent: "#7a4a1e",
    image: "/media/reference/legacy/56549.webp",
    offer: "تقييم الجلد والعضلات ومناطق الترهل",
    bullets: [
      "تحديد هل المشكلة جلد زائد، عضلات، دهون موضعية، أو مزيج بينها.",
      "مناقشة شد البطن المحدود أو الشامل حسب الحاجة.",
      "اقتراح خطة مرحلية عند وجود ترهلات في أكثر من منطقة.",
      "توضيح التعافي والمشد والمتابعة قبل القرار.",
    ],
    sections: [
      ["بعد الحمل", "تحسين ترهل الجلد وتباعد العضلات عند الحاجة."],
      ["بعد نزول الوزن", "إعادة التناسق لمناطق الجسم التي لا تتحسن بالرياضة وحدها."],
      ["خطة آمنة", "تقييم طبي قبل اختيار الشد أو الدمج مع شفط الدهون."],
    ],
    faqs: [
      ["هل شد البطن ينقص الوزن؟", "لا، هو لتحسين الشكل بعد استقرار الوزن وليس لإنقاص الوزن."],
      ["هل الشفط وحده يكفي؟", "إذا كان هناك جلد زائد أو ضعف عضلات، قد لا يكون الشفط وحده كافيًا."],
      ["هل يمكن شد أكثر من منطقة؟", "نعم لبعض الحالات، وقد يتم على مراحل حسب الأمان الطبي."],
    ],
  },
  {
    campaignSegment: "female-aesthetic-care",
    slug: "lp-female-aesthetic-care-riyadh",
    title: "التجميل النسائي في الرياض",
    titleEn: "Female Aesthetic Care in Riyadh",
    headline: "رعاية نسائية خاصة بخصوصية كاملة وخطة واضحة",
    eyebrow: "التجميل النسائي",
    intro:
      "يتم التعامل مع كل حالة بخصوصية وهدوء، مع شرح الخيارات التجميلية أو العلاجية المناسبة حسب الاحتياج الطبي.",
    serviceSlug: "female-aesthetic-care",
    serviceLabel: "التجميل النسائي",
    sourceLabel: "صفحة هبوط - التجميل النسائي",
    accent: "#8c3d7c",
    image: "/media/curated/service-laser-hair-removal.jpg",
    offer: "استشارة نسائية بسرية وراحة",
    bullets: [
      "تقييم نسائي يحترم الخصوصية ويشرح الخيارات بوضوح.",
      "خدمات تجميلية وعلاجية حسب الحالة والهدف.",
      "ربط الحالات بالأطباء المناسبين للتجميل النسائي والنساء والولادة.",
      "متابعة منظمة وتعليمات واضحة قبل وبعد.",
    ],
    sections: [
      ["خصوصية كاملة", "تجربة هادئة وآمنة من بداية الطلب حتى المتابعة."],
      ["تقييم متخصص", "اختيار الإجراء حسب الحالة وليس كحل موحد للجميع."],
      ["خيارات متعددة", "حلول طبية وتجميلية للراحة والثقة."],
    ],
    faqs: [
      ["هل الاستشارة بسرية؟", "نعم، يتم التعامل مع الطلبات النسائية بخصوصية عالية."],
      ["هل أحتاج لتحديد الإجراء من البداية؟", "يمكنك تركها كاستفسار عام وسيتم توجيهك بعد التواصل."],
      ["هل يمكن الحجز مع طبيبة؟", "يمكن توجيه الطلب للطبيبة المناسبة حسب الحالة والتوفر."],
    ],
  },
  {
    campaignSegment: "male-gynecomastia",
    slug: "lp-male-gynecomastia-riyadh",
    title: "علاج التثدي عند الرجال",
    titleEn: "Male Gynecomastia Surgery in Riyadh",
    headline: "صدر أكثر تناسقًا وثقة بخطة علاج مناسبة للرجال",
    eyebrow: "التثدي عند الرجال",
    intro:
      "يعتمد علاج التثدي على تقييم سبب البروز ودرجة الدهون أو النسيج الغددي قبل اختيار الشفط أو الإجراء المناسب.",
    serviceSlug: "male-gynecomastia-surgery",
    serviceLabel: "علاج التثدي عند الرجال",
    sourceLabel: "صفحة هبوط - التثدي للرجال",
    accent: "#263f6c",
    image: "/media/reference/legacy/88985959.webp",
    offer: "تقييم خاص وسري لتحديد الخطة",
    bullets: [
      "تقييم شكل الصدر ودرجة البروز قبل تحديد الإجراء.",
      "مناقشة الفرق بين الدهون الموضعية والنسيج الغددي.",
      "خصوصية كاملة في الطلب والتواصل.",
      "خطة تعافٍ واضحة ونتيجة تستهدف تناسقًا طبيعيًا.",
    ],
    sections: [
      ["خصوصية", "تواصل هادئ وسري مع فريق ريجوفيرا."],
      ["تقييم طبي", "تحديد سبب المشكلة قبل اختيار الحل."],
      ["نتيجة متناسقة", "الهدف مظهر طبيعي وثقة أعلى بدون مبالغة."],
    ],
    faqs: [
      ["هل التثدي سببه دهون فقط؟", "ليس دائمًا، لذلك يحتاج تقييمًا لتحديد الدهون أو النسيج الغددي."],
      ["هل يمكن علاجه بالشفط؟", "بعض الحالات تناسب الشفط، وحالات أخرى تحتاج خطة مختلفة."],
      ["هل الطلب سري؟", "نعم، يتم التعامل مع بياناتك بخصوصية كاملة."],
    ],
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function serviceOptions(page) {
  const preferred = new Set([
    "general-inquiry",
    page.serviceSlug,
    ...(page.serviceSlug === "liposuction"
      ? ["body-sculpting-surgery", "body-contouring"]
      : []),
    ...(page.serviceSlug === "eyelid-lift"
      ? ["blepharoplasty", "face-neck-lift"]
      : []),
    ...(page.serviceSlug === "breast-augmentation"
      ? ["breast-lift", "breast-reduction", "breast-implant-revision"]
      : []),
    ...(page.serviceSlug === "tummy-tuck"
      ? ["body-lift", "body-sculpting-surgery"]
      : []),
  ]);

  const localExtra = [
    { value: "face-neck-lift", label: "شد الوجه والرقبة" },
    { value: "blepharoplasty", label: "تجميل الجفون" },
    { value: "breast-reduction", label: "تصغير الصدر" },
    { value: "breast-implant-revision", label: "تغيير حشوات الصدر" },
    { value: "body-lift", label: "شد الترهلات" },
    { value: "body-contouring", label: "نحت القوام غير الجراحي" },
  ];

  return [...sharedServices, ...localExtra]
    .filter((service) => preferred.has(service.value))
    .map(
      (service) =>
        `<option value="${escapeHtml(service.value)}"${
          service.value === page.serviceSlug ? " selected" : ""
        }>${escapeHtml(service.label)}</option>`,
    )
    .join("");
}

function renderCards(items) {
  return items
    .map(
      ([title, body]) => `
        <article class="rv-ad-card">
          <span class="rv-ad-card__mark">+</span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(body)}</p>
        </article>`,
    )
    .join("");
}

function renderBullets(items) {
  return items
    .map(
      (item) => `
        <li>
          <span class="rv-ad-tick">✓</span>
          <span>${escapeHtml(item)}</span>
        </li>`,
    )
    .join("");
}

function renderFaqs(items) {
  return items
    .map(
      ([question, answer]) => `
        <details class="rv-ad-faq">
          <summary>${escapeHtml(question)}</summary>
          <p>${escapeHtml(answer)}</p>
        </details>`,
    )
    .join("");
}

function buildLandingPage(page) {
  return `
<section class="rv-ad-page" data-uploaded-html="true" data-layout="canvas" data-header="false" data-footer="false" data-campaign-page="${escapeHtml(page.campaignSegment)}" aria-label="${escapeHtml(page.title)}">
  <style>
    .rv-ad-page{--accent:${page.accent};--accent-soft:#f4ecfb;--ink:#24143d;--muted:#756986;--line:rgba(36,20,61,.12);direction:rtl;text-align:right;color:var(--ink);font-family:inherit;background:#fbf7f0;overflow:hidden}
    .rv-ad-page *{box-sizing:border-box}
    .rv-ad-shell{width:min(1120px,calc(100% - 32px));margin:0 auto}
    .rv-ad-hero{position:relative;isolation:isolate;padding:clamp(28px,6vw,76px) 0;background:linear-gradient(135deg,#fff 0%,#fbf5ff 47%,#f8efe4 100%)}
    .rv-ad-hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(92,36,132,.09),transparent 36%,rgba(198,151,87,.09));z-index:-1}
    .rv-ad-hero__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,430px);gap:clamp(24px,5vw,54px);align-items:center}
    .rv-ad-eyebrow{display:inline-flex;width:max-content;max-width:100%;align-items:center;gap:8px;border:1px solid var(--line);border-radius:999px;background:#fff;padding:8px 13px;color:var(--accent);font-size:13px;font-weight:900;box-shadow:0 8px 24px rgba(36,20,61,.06)}
    .rv-ad-eyebrow:before{content:"";width:8px;height:8px;border-radius:999px;background:#22c55e}
    .rv-ad-title{max-width:11ch;margin:18px 0 16px;font-size:clamp(42px,7vw,82px);line-height:.98;font-weight:950;letter-spacing:0;color:var(--ink)}
    .rv-ad-intro{max-width:620px;margin:0;color:var(--muted);font-size:clamp(16px,1.8vw,20px);line-height:1.9}
    .rv-ad-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
    .rv-ad-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:999px;padding:13px 20px;text-decoration:none;font-weight:950;transition:transform .18s ease,box-shadow .18s ease}
    .rv-ad-btn:hover{transform:translateY(-2px)}
    .rv-ad-btn--primary{background:var(--accent);color:#fff;box-shadow:0 18px 34px rgba(92,36,132,.22)}
    .rv-ad-btn--ghost{border:1px solid var(--line);background:#fff;color:var(--accent)}
    .rv-ad-proof{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:28px;max-width:620px}
    .rv-ad-proof span{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.74);padding:13px 12px;text-align:center;font-size:13px;font-weight:850;color:var(--ink);box-shadow:0 10px 26px rgba(36,20,61,.05)}
    .rv-ad-form-card{border:1px solid rgba(255,255,255,.52);border-radius:28px;background:rgba(255,255,255,.9);padding:18px;box-shadow:0 28px 80px rgba(36,20,61,.16);backdrop-filter:blur(14px)}
    .rv-ad-visual{position:relative;overflow:hidden;border-radius:22px;min-height:260px;background:#efe7f5}
    .rv-ad-visual img{display:block;width:100%;height:300px;object-fit:cover;margin:0}
    .rv-ad-offer{position:absolute;inset:auto 14px 14px 14px;border-radius:18px;background:rgba(255,255,255,.88);padding:12px 14px;color:var(--ink);font-weight:900;box-shadow:0 16px 32px rgba(36,20,61,.16);backdrop-filter:blur(10px)}
    .rv-ad-form{display:grid;gap:11px;padding-top:16px}
    .rv-ad-form h2{margin:0 0 2px;font-size:24px;line-height:1.25;color:var(--ink);font-weight:950}
    .rv-ad-form p{margin:0 0 6px;color:var(--muted);font-size:13px;line-height:1.7}
    .rv-ad-field{display:grid;gap:6px}
    .rv-ad-field label{font-size:12px;font-weight:900;color:var(--ink)}
    .rv-ad-field input,.rv-ad-field select,.rv-ad-field textarea{width:100%;min-height:46px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--ink);padding:11px 13px;font:inherit;outline:none}
    .rv-ad-field textarea{min-height:86px;resize:vertical}
    .rv-ad-field input:focus,.rv-ad-field select:focus,.rv-ad-field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 4px rgba(92,36,132,.1)}
    .rv-ad-submit{min-height:50px;border:0;border-radius:16px;background:var(--accent);color:#fff;padding:13px 18px;font:inherit;font-weight:950;cursor:pointer;box-shadow:0 16px 34px rgba(92,36,132,.22)}
    .rv-ad-note{font-size:11px!important;text-align:center!important}
    .rv-ad-section{padding:clamp(34px,6vw,76px) 0}
    .rv-ad-section--white{background:#fff}
    .rv-ad-section__head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:24px}
    .rv-ad-kicker{margin:0 0 7px;color:var(--accent);font-size:13px;font-weight:950}
    .rv-ad-h2{margin:0;font-size:clamp(28px,4vw,46px);line-height:1.1;color:var(--ink);font-weight:950}
    .rv-ad-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .rv-ad-card{position:relative;min-height:168px;border:1px solid var(--line);border-radius:22px;background:#fff;padding:22px;box-shadow:0 16px 38px rgba(36,20,61,.07)}
    .rv-ad-card__mark{display:grid;place-items:center;width:34px;height:34px;border-radius:12px;background:var(--accent-soft);color:var(--accent);font-weight:950;margin-bottom:18px}
    .rv-ad-card h3{margin:0 0 9px;font-size:20px;font-weight:950;color:var(--ink)}
    .rv-ad-card p{margin:0;color:var(--muted);font-size:14px;line-height:1.8}
    .rv-ad-split{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:18px;align-items:stretch}
    .rv-ad-panel{border:1px solid var(--line);border-radius:24px;background:#fff;padding:24px;box-shadow:0 18px 40px rgba(36,20,61,.07)}
    .rv-ad-list{display:grid;gap:12px;margin:0;padding:0;list-style:none}
    .rv-ad-list li{display:flex;gap:10px;align-items:flex-start;border-radius:16px;background:#fbf8fd;padding:13px;color:var(--ink);line-height:1.75;font-weight:750}
    .rv-ad-tick{display:grid;place-items:center;width:24px;height:24px;flex:0 0 auto;border-radius:999px;background:var(--accent);color:#fff;font-weight:950}
    .rv-ad-mini-image{overflow:hidden;border-radius:24px;min-height:100%;background:#efe7f5}
    .rv-ad-mini-image img{display:block;width:100%;height:100%;min-height:360px;object-fit:cover;margin:0}
    .rv-ad-faqs{display:grid;gap:10px}
    .rv-ad-faq{border:1px solid var(--line);border-radius:16px;background:#fff;padding:0 16px;box-shadow:0 10px 26px rgba(36,20,61,.05)}
    .rv-ad-faq summary{cursor:pointer;padding:15px 0;font-weight:950;color:var(--ink)}
    .rv-ad-faq p{margin:0 0 16px;color:var(--muted);line-height:1.8}
    .rv-ad-bottom{border-radius:28px;background:linear-gradient(135deg,var(--accent),#2b0c45);padding:clamp(24px,5vw,46px);color:#fff;text-align:center;box-shadow:0 24px 60px rgba(36,20,61,.16)}
    .rv-ad-bottom h2{margin:0 0 10px;font-size:clamp(28px,4vw,46px);line-height:1.15;font-weight:950;color:#fff}
    .rv-ad-bottom p{margin:0 auto 22px;max-width:680px;color:rgba(255,255,255,.82);line-height:1.9}
    .rv-ad-bottom .rv-ad-btn{background:#fff;color:var(--accent)}
    @media(max-width:900px){.rv-ad-hero__grid,.rv-ad-split{grid-template-columns:1fr}.rv-ad-title{max-width:100%}.rv-ad-grid{grid-template-columns:1fr}.rv-ad-section__head{display:block}.rv-ad-proof{grid-template-columns:1fr}.rv-ad-mini-image img{min-height:260px}}
    @media(max-width:560px){.rv-ad-shell{width:min(100% - 22px,1120px)}.rv-ad-title{font-size:40px}.rv-ad-actions{display:grid}.rv-ad-btn{width:100%}.rv-ad-form-card,.rv-ad-card,.rv-ad-panel,.rv-ad-bottom{border-radius:20px}.rv-ad-visual img{height:250px}}
  </style>

  <header class="rv-ad-hero">
    <div class="rv-ad-shell rv-ad-hero__grid">
      <div>
        <span class="rv-ad-eyebrow">${escapeHtml(page.eyebrow)}</span>
        <h1 class="rv-ad-title">${escapeHtml(page.headline)}</h1>
        <p class="rv-ad-intro">${escapeHtml(page.intro)}</p>
        <div class="rv-ad-actions">
          <a class="rv-ad-btn rv-ad-btn--primary" href="#lead-form">احجزي تقييمك الآن</a>
          <a class="rv-ad-btn rv-ad-btn--ghost" href="tel:0114999959">اتصال مباشر</a>
        </div>
        <div class="rv-ad-proof" aria-label="مميزات ريجوفيرا">
          <span>تقييم طبي واضح</span>
          <span>خصوصية كاملة</span>
          <span>متابعة منظمة</span>
        </div>
      </div>

      <div class="rv-ad-form-card">
        <div class="rv-ad-visual">
          <img src="${escapeHtml(page.image)}" alt="${escapeHtml(page.title)}" loading="eager" decoding="async">
          <div class="rv-ad-offer">${escapeHtml(page.offer)}</div>
        </div>
        <form id="lead-form" class="rv-ad-form" method="post" action="/api/leads">
          <h2>اطلبي التواصل الآن</h2>
          <p>املئي البيانات وسيتم التواصل معك من فريق ريجوفيرا لتأكيد التفاصيل.</p>
          <input type="hidden" name="source" value="${escapeHtml(page.sourceLabel)}">
          <input type="hidden" name="serviceName" value="${escapeHtml(page.serviceLabel)}">
          <input type="hidden" name="serviceLabel" value="${escapeHtml(page.serviceLabel)}">
          <input type="hidden" name="serviceTypeAr" value="${escapeHtml(page.serviceLabel)}">
          <input type="hidden" name="preferredLanguage" value="ar">
          <div class="rv-ad-field">
            <label for="${escapeHtml(page.slug)}-name">الاسم الكامل *</label>
            <input id="${escapeHtml(page.slug)}-name" name="fullName" type="text" required autocomplete="name" placeholder="اكتبي الاسم الكامل">
          </div>
          <div class="rv-ad-field">
            <label for="${escapeHtml(page.slug)}-phone">رقم الجوال *</label>
            <input id="${escapeHtml(page.slug)}-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" dir="ltr" placeholder="05xxxxxxxx">
          </div>
          <div class="rv-ad-field">
            <label for="${escapeHtml(page.slug)}-service">الخدمة المطلوبة</label>
            <select id="${escapeHtml(page.slug)}-service" name="serviceSlug" required>
              ${serviceOptions(page)}
            </select>
          </div>
          <div class="rv-ad-field">
            <label for="${escapeHtml(page.slug)}-message">ملاحظة مختصرة</label>
            <textarea id="${escapeHtml(page.slug)}-message" name="message" placeholder="اكتبي أي تفاصيل مهمة أو الوقت المناسب للتواصل"></textarea>
          </div>
          <button class="rv-ad-submit" type="submit">إرسال الطلب</button>
          <p class="rv-ad-note">بالضغط على إرسال، يراجع فريق ريجوفيرا طلبك للتواصل وتأكيد التفاصيل.</p>
        </form>
      </div>
    </div>
  </header>

  <section class="rv-ad-section rv-ad-section--white">
    <div class="rv-ad-shell">
      <div class="rv-ad-section__head">
        <div>
          <p class="rv-ad-kicker">اختيار ريجوفيرا</p>
          <h2 class="rv-ad-h2">لماذا تبدأي من ريجوفيرا؟</h2>
        </div>
      </div>
      <div class="rv-ad-grid">${renderCards(page.sections)}</div>
    </div>
  </section>

  <section class="rv-ad-section">
    <div class="rv-ad-shell rv-ad-split">
      <div class="rv-ad-panel">
        <p class="rv-ad-kicker">ما الذي يحدث بعد الطلب؟</p>
        <h2 class="rv-ad-h2">رحلة واضحة من أول تواصل</h2>
        <ul class="rv-ad-list">${renderBullets(page.bullets)}</ul>
      </div>
      <div class="rv-ad-mini-image">
        <img src="${escapeHtml(page.image)}" alt="${escapeHtml(page.title)} داخل Rejuvera" loading="lazy" decoding="async">
      </div>
    </div>
  </section>

  <section class="rv-ad-section rv-ad-section--white">
    <div class="rv-ad-shell">
      <div class="rv-ad-section__head">
        <div>
          <p class="rv-ad-kicker">أسئلة قبل الحجز</p>
          <h2 class="rv-ad-h2">إجابات مختصرة تساعدك على القرار</h2>
        </div>
      </div>
      <div class="rv-ad-faqs">${renderFaqs(page.faqs)}</div>
    </div>
  </section>

  <section class="rv-ad-section">
    <div class="rv-ad-shell">
      <div class="rv-ad-bottom">
        <h2>ابدئي بخطوة واضحة الآن</h2>
        <p>أرسلي طلبك الآن وسيتم التواصل معك لتأكيد التفاصيل وتوجيهك للخدمة والطبيب الأنسب داخل ريجوفيرا.</p>
        <a class="rv-ad-btn" href="#lead-form">احجزي الآن</a>
      </div>
    </div>
  </section>
</section>`;
}

async function main() {
  console.log(`Seeding ${pages.length} advertising landing pages...`);
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
        metaTitle: `${page.title} | Rejuvera Center`,
        metaDescription: page.intro,
        keywords: [
          page.title,
          "ريجوفيرا",
          "مركز تجميل في الرياض",
          "استشارة تجميل",
        ],
        ogTitle: page.headline,
        ogDescription: page.intro,
        ogImage: page.image,
        noindex: false,
        status: "PUBLISHED",
        leadWebhookEnabled: false,
      },
      update: {
        titleAr: page.title,
        titleEn: page.titleEn,
        htmlContent: buildLandingPage(page),
        seoTitle: `${page.title} | Rejuvera Medical Center`,
        seoDescription: page.intro,
        metaTitle: `${page.title} | Rejuvera Center`,
        metaDescription: page.intro,
        keywords: [
          page.title,
          "ريجوفيرا",
          "مركز تجميل في الرياض",
          "استشارة تجميل",
        ],
        ogTitle: page.headline,
        ogDescription: page.intro,
        ogImage: page.image,
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
