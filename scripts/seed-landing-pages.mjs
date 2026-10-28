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

const pages = [
  {
    campaignSegment: "general-aesthetic-center",
    slug: "lp-beauty-center-riyadh",
    title: "مركز تجميل في الرياض",
    titleEn: "Aesthetic Medical Center in Riyadh",
    headline: "ابدأ رحلتك التجميلية في ريجوفيرا بجلسة استشارية تليق بك",
    eyebrow: "مركز تجميل طبي متكامل في الرياض",
    intro:
      "جلسة استشارية خاصة تبدأ بالإنصات لتطلعاتك، ثم يرسم لك الاستشاري خطة تجمع بين الدقة الطبية واللمسة الفنية، بخدمات جراحية وغير جراحية في مكان واحد وبخصوصية تامة.",
    serviceSlug: "general-inquiry",
    serviceLabel: "استفسار عام",
    sourceLabel: "صفحة هبوط - مركز تجميل عام",
    accent: "#5c2484",
    image: "/media/curated/clinic-interior.jpeg",
    offer: "جلسة استشارية خاصة تحدد الخطة الأنسب لك",
    bullets: [
      "جلسة استشارية تبدأ بالإنصات لتطلعاتك.",
      "خدمات جراحية وغير جراحية في مركز واحد.",
      "تنسيق مريح يرتّب لك فريقنا فيه الموعد الأنسب.",
      "تجربة هادئة تسعى إلى نتائج طبيعية ومتناسقة.",
    ],
    sections: [
      [
        "خدمات متكاملة",
        "الوجه والجسم والجلدية والتجميل النسائي والأجهزة، تحت سقف واحد.",
      ],
      [
        "قرار بوضوح",
        "نعرض عليك الخيارات المناسبة وتفاصيل كل منها بوضوح وهدوء.",
      ],
      ["رعاية ومتابعة", "يرافقك فريقنا قبل الإجراء وبعده بخصوصية واهتمام."],
    ],
    faqs: [
      [
        "هل أحتاج لاختيار خدمة محددة؟",
        "لا حاجة لذلك؛ يكفي أن تشاركنا اهتمامك ونوجّهك إلى الخدمة والاستشاري الأنسب.",
      ],
      [
        "هل الاستشارة مناسبة قبل اتخاذ القرار؟",
        "بالتأكيد؛ هي أجمل بداية لتتعرّف على الخيارات وتقرر براحة.",
      ],
      [
        "هل يمكنني تغيير الخدمة لاحقًا؟",
        "نعم، يرافقك الفريق ويقترح معك المسار الأنسب في أي وقت.",
      ],
    ],
  },
  {
    campaignSegment: "liposuction-body-contouring",
    slug: "lp-liposuction-body-contouring-riyadh",
    title: "شفط الدهون ونحت الجسم في الرياض",
    titleEn: "Liposuction and Body Contouring in Riyadh",
    headline: "قوام منحوت بانسيابية، بخطة نحت تلائم تفاصيل جسمك",
    eyebrow: "شفط الدهون ونحت الجسم",
    intro:
      "لمن يتمنى إبراز انسيابية الخصر والبطن والظهر، تبدأ الخطة بجلسة استشارية ينصت فيها الجرّاح لتطلعاتك، ثم يرسم لك الشفط أو الفيزر أو الشد الأنسب لجسمك.",
    serviceSlug: "liposuction",
    serviceLabel: "شفط الدهون ونحت الجسم",
    sourceLabel: "صفحة هبوط - شفط الدهون ونحت الجسم",
    accent: "#3e6d68",
    image: "/media/reference/legacy/88985959.webp",
    offer: "جلسة استشارية لمناطق النحت وخطة التعافي",
    bullets: [
      "شفط أو نحت أو شد: خطة تناسب جسمك وتطلعاتك.",
      "البطن والخصر والظهر والذراعان والفخذان في رؤية واحدة.",
      "تعافٍ واضح الخطوات ومتابعة تطمئنك.",
      "استشاريون متخصصون يرافقونك في كل مرحلة.",
    ],
    sections: [
      ["نحت موضعي", "لإبراز انسيابية المناطق التي تهمّك في جسمك."],
      ["تناسق من كل الزوايا", "رؤية متكاملة لجسمك وليس لمنطقة واحدة فقط."],
      ["خطة مريحة", "مراحل واضحة تناسب راحتك وصحتك."],
    ],
    faqs: [
      [
        "هل شفط الدهون للتنحيف؟",
        "هو لتحسين التناسق في مناطق محددة، وليس لإنقاص الوزن.",
      ],
      [
        "هل تحتاج كل الحالات إلى جراحة؟",
        "يحدد الفحص الأنسب لك بين الخيارات الجراحية وغيرها.",
      ],
      ["متى تظهر النتيجة؟", "تظهر تدريجيًا مع زوال التورم واستقرار الأنسجة."],
    ],
  },
  {
    campaignSegment: "face-neck-eyelid-lift",
    slug: "lp-face-neck-eyelid-lift-riyadh",
    title: "شد الوجه والرقبة والجفون",
    titleEn: "Face, Neck and Eyelid Lift",
    headline: "ملامح متجددة بحيوية طبيعية، وتبقى أنت",
    eyebrow: "شد الوجه والرقبة والجفون",
    intro:
      "جلسة استشارية نتعرّف فيها على ملامحك وتطلعاتك: الخدين وخط الفك والرقبة والجفون، لنقترح لك الشد الأنسب بين الجراحة والأجهزة والخيارات غير الجراحية.",
    serviceSlug: "eyelid-lift",
    serviceLabel: "شد الوجه والرقبة والجفون",
    sourceLabel: "صفحة هبوط - شد الوجه والرقبة والجفون",
    accent: "#245d74",
    image: "/media/curated/device-emface.jpg",
    offer: "جلسة استشارية لملامح الوجه والخيار الأنسب لك",
    bullets: [
      "نتعرّف على الفك والرقبة والجفون كلٌّ على حدة.",
      "خيارات جراحية وبأجهزة وغير جراحية بحسب ما يليق بك.",
      "خطة تحافظ على هويتك الطبيعية وتعابيرك.",
      "متابعة واضحة قبل الإجراء وبعده.",
    ],
    sections: [
      ["خط فك أوضح", "لإطلالة أكثر انسيابية في أسفل الوجه."],
      ["جفون أكثر انتعاشًا", "لعينين تبدوان أكثر إشراقًا وحيوية."],
      ["رقبة أكثر انسيابية", "خطة تلائم ما تتمنى تجديده في رقبتك."],
    ],
    faqs: [
      [
        "هل يكفي الفيلر عن الشد؟",
        "يعتمد ذلك على ما تتمنى تجديده؛ فيرسم الاستشاري معك الخيار الأنسب بعد التعرف على ملامحك.",
      ],
      [
        "هل ستبدو الملامح طبيعية؟",
        "هدفنا إطلالة متناسقة تحافظ على طابعك الطبيعي.",
      ],
      [
        "هل يمكن علاج الجفون وحدها؟",
        "بالتأكيد، إن كان اهتمامك محصورًا حول العينين.",
      ],
    ],
  },
  {
    campaignSegment: "rhinoplasty",
    slug: "lp-rhinoplasty-riyadh",
    title: "تجميل الأنف في الرياض",
    titleEn: "Rhinoplasty in Riyadh",
    headline: "أنف متناسق يكمّل ملامحك بلمسة طبيعية",
    eyebrow: "عمليات تجميل الأنف",
    intro:
      "تناسق الأنف مع الذقن والشفاه والجبهة، وراحة التنفس، يستحقان عناية خاصة؛ تبدأ الرحلة بجلسة استشارية ينصت فيها الاستشاري إلى ما تتمنى تغييره وما تحب أن يبقى كما هو.",
    serviceSlug: "rhinoplasty",
    serviceLabel: "عمليات تجميل الأنف",
    sourceLabel: "صفحة هبوط - تجميل الأنف",
    accent: "#6b3aa0",
    image: "/media/curated/service-injectables.webp",
    offer: "جلسة استشارية لشكل الأنف من الأمام والجانب",
    bullets: [
      "نتعرّف على شكل الأنف وعلاقته بباقي ملامح وجهك.",
      "نناقش معك ما يمكن تحسينه بما يناسب ملامحك.",
      "نراعي راحة التنفس عند الحاجة.",
      "نشرح لك التعافي ومراحل ظهور النتيجة بوضوح.",
    ],
    sections: [
      ["تناسق الوجه", "الهدف انسجام الأنف مع ملامحك، لا التصغير وحده."],
      ["راحة التنفس", "عناية بالجانب الوظيفي حين يلزم."],
      ["رؤية واضحة", "نشرح لك الخطة والتعافي بوضوح قبل أن تقرر."],
    ],
    faqs: [
      [
        "هل يمكنني اختيار شكل أنف من صورة؟",
        "الصورة تساعدنا على فهم ذوقك، ثم نختار معك ما يناسب ملامحك وبنية أنفك.",
      ],
      [
        "متى تظهر النتيجة؟",
        "تتحسن تدريجيًا مع زوال التورم، ويشرح لك الاستشاري المراحل.",
      ],
      ["هل تحتاج كل الحالات إلى جراحة؟", "يحدد الفحص الأنسب لك بين الخيارات."],
    ],
  },
  {
    campaignSegment: "breast-surgery",
    feminine: true,
    slug: "lp-breast-surgery-riyadh",
    title: "عمليات الصدر في الرياض",
    titleEn: "Breast Surgery in Riyadh",
    headline: "تناسق أنثوي راقٍ يليق بقوامك",
    eyebrow: "تكبير وشد وتصغير وتنسيق الصدر",
    intro:
      "لكل صدر قصته؛ فاختيار الحجم والشكل يراعي قوامك وتطلعاتك وراحتك. تبدأ رحلتك بجلسة استشارية خاصة وبسرية تامة، ينصت فيها الجرّاح إلى ما تتمنينه.",
    serviceSlug: "breast-augmentation",
    serviceLabel: "عمليات الصدر",
    sourceLabel: "صفحة هبوط - عمليات الصدر",
    accent: "#8d4fb2",
    image: "/media/reference/legacy/56549.webp",
    offer: "جلسة استشارية خاصة لاختيار الخيار الأنسب",
    bullets: [
      "تكبير أو شد أو تصغير أو تغيير الحشوات بحسب تطلعاتك.",
      "اختيار الحجم بما ينسجم مع جسمك لا برقم ثابت.",
      "نشرح لك نوع الحشوة وموضعها حين تناسب حالتك.",
      "تناسق طبيعي ومتوازن مع قوامك.",
    ],
    sections: [
      ["تكبير الصدر", "امتلاء أجمل ينسجم مع عرض صدرك وقوامك."],
      ["شد وتصغير", "ارتفاع وتناسق وراحة أكبر بحسب تطلعاتك."],
      ["تغيير الحشوات", "تجديد النتيجة بخطة واضحة تناسبك."],
    ],
    faqs: [
      [
        "كيف أختار الحجم المناسب؟",
        "نختاره معًا بعد التعرف على قياسات صدرك وتطلعاتك.",
      ],
      ["هل ستبدو النتيجة طبيعية؟", "هدفنا شكل متناسق ينسجم مع جسمك."],
      [
        "هل يمكن دمج الشد مع التكبير؟",
        "في بعض الحالات، ويقرر الجرّاح الأنسب لك بعد الفحص.",
      ],
    ],
  },
  {
    campaignSegment: "tummy-tuck-body-lift",
    slug: "lp-tummy-tuck-body-lift-riyadh",
    title: "شد البطن وشد الترهلات",
    titleEn: "Tummy Tuck and Body Lift",
    headline: "بطن أكثر استقامة وقوام أكثر انسجامًا بعد الحمل أو نزول الوزن",
    eyebrow: "شد البطن وشد الترهلات",
    intro:
      "بعد الحمل أو نزول الوزن قد يتمنى الجسم استعادة استقامته؛ تبدأ الخطة بجلسة استشارية يتعرّف فيها الجرّاح على جلدك وعضلاتك ومناطق ما تتمنى تجديده، ثم يختار لك شد البطن أو شد الجسم.",
    serviceSlug: "tummy-tuck",
    serviceLabel: "شد البطن وشد الترهلات",
    sourceLabel: "صفحة هبوط - شد البطن وشد الترهلات",
    accent: "#7a4a1e",
    image: "/media/reference/legacy/56549.webp",
    offer: "جلسة استشارية للجلد والعضلات ومناطق الترهل",
    bullets: [
      "نتعرّف على ما يلزم بدقة: جلد زائد أو عضلات أو دهون موضعية.",
      "شد بطن محدود أو شامل بحسب ما يلائمك.",
      "خطة على مراحل عند تعدد المناطق.",
      "نوضح لك التعافي والمشد والمتابعة قبل قرارك.",
    ],
    sections: [
      ["بعد الحمل", "لبطن أكثر استقامة بعد ترهل الجلد وتباعد العضلات."],
      [
        "بعد نزول الوزن",
        "لقوام أكثر انسجامًا في مناطق لا تكفي معها الرياضة وحدها.",
      ],
      ["خطة آمنة", "تقييم طبي قبل اختيار الشد أو دمجه مع شفط الدهون."],
    ],
    faqs: [
      [
        "هل شد البطن ينقص الوزن؟",
        "هو لتحسين الشكل بعد استقرار الوزن، وليس لإنقاص الوزن.",
      ],
      [
        "هل الشفط وحده يكفي؟",
        "عند وجود جلد زائد أو ارتخاء في العضلات قد يكون الشد هو الأنسب لك.",
      ],
      [
        "هل يمكن شد أكثر من منطقة؟",
        "في بعض الحالات، وقد يكون على مراحل لراحتك وسلامتك.",
      ],
    ],
  },
  {
    campaignSegment: "female-aesthetic-care",
    feminine: true,
    slug: "lp-female-aesthetic-care-riyadh",
    title: "التجميل النسائي في الرياض",
    titleEn: "Female Aesthetic Care in Riyadh",
    headline: "رعاية نسائية بخصوصية تامة وراحة تليق بك",
    eyebrow: "التجميل النسائي",
    intro:
      "جلسة هادئة وخاصة تتحدثين فيها بكل راحة، ثم تتعرفين على الخيارات التجميلية أو العلاجية المناسبة لك بوضوح وهدوء.",
    serviceSlug: "female-aesthetic-care",
    serviceLabel: "التجميل النسائي",
    sourceLabel: "صفحة هبوط - التجميل النسائي",
    accent: "#8c3d7c",
    image: "/media/curated/service-laser-hair-removal.jpg",
    offer: "استشارة نسائية بسرية وراحة",
    bullets: [
      "جلسة تحترم خصوصيتك وتشرح لك الخيارات بوضوح.",
      "خدمات تجميلية وعلاجية بحسب ما يناسبك.",
      "طبيبات واستشاريات في التجميل النسائي والنساء والولادة.",
      "متابعة منظمة وإرشادات واضحة قبل الإجراء وبعده.",
    ],
    sections: [
      ["خصوصية تامة", "تجربة هادئة وآمنة منذ أول تواصل وحتى المتابعة."],
      ["رعاية متخصصة", "خطة تُصمَّم لحالتك وليست حلًا موحدًا للجميع."],
      ["خيارات متعددة", "حلول طبية وتجميلية للراحة والثقة."],
    ],
    faqs: [
      [
        "هل الاستشارة بسرية؟",
        "بالتأكيد؛ نتعامل مع الطلبات النسائية بخصوصية عالية.",
      ],
      [
        "هل يجب أن أحدد الإجراء من البداية؟",
        "لا حاجة لذلك؛ يكفي أن تشاركينا ما يشغلك وسنوجّهك بلطف.",
      ],
      [
        "هل يمكنني الحجز مع طبيبة؟",
        "نعم، ننسّق لك الموعد مع الطبيبة المناسبة.",
      ],
    ],
  },
  {
    campaignSegment: "lipedema-treatment",
    feminine: true,
    slug: "lp-lipedema-riyadh",
    title: "علاج الوذمة الشحمية في الرياض",
    titleEn: "Lipedema Treatment in Riyadh",
    headline: "تقييم متخصص للوذمة الشحمية بخطة واضحة تطمئنك",
    eyebrow: "علاج الوذمة الشحمية",
    intro:
      "ثقل أو ألم أو انتفاخ في الساقين لا يستجيب للرياضة؟ قد يستحق ذلك تقييمًا متخصصًا؛ تبدأ رحلتك بجلسة استشارية هادئة نفهم فيها حالتك معًا ونضع الخطة المناسبة.",
    serviceSlug: "lipedema-treatment",
    serviceLabel: "علاج الوذمة الشحمية",
    sourceLabel: "صفحة هبوط - علاج الوذمة الشحمية",
    accent: "#4a2d6b",
    image: "/media/reference/legacy/88985959.webp",
    offer: "جلسة استشارية لتقييم الأعراض ومرحلة الحالة",
    bullets: [
      "نتعرّف على توزيع الدهون والألم ومرحلة الوذمة الشحمية.",
      "نوضح لك الفرق بين الوذمة الشحمية والسمنة.",
      "نعرض عليك خيارات العلاج الجراحية وغير الجراحية المناسبة لك.",
      "خطة متابعة واضحة مع فريق متخصص في ريجوفيرا.",
    ],
    sections: [
      ["تقييم دقيق", "نفهم أعراضك ومرحلة الحالة قبل أي خطوة."],
      ["خطة مخصصة", "نختار معك المسار المناسب لشدة الحالة وأهدافك."],
      ["متابعة واضحة", "نشرح لك التعافي والمتابعة خطوة بخطوة."],
    ],
    faqs: [
      [
        "هل الوذمة الشحمية مثل السمنة؟",
        "لها طبيعة مختلفة، ولذلك يفيدك التقييم المتخصص لفهم حالتك.",
      ],
      [
        "هل تحتاج كل الحالات إلى جراحة؟",
        "يحدد الطبيب الخطة بعد الفحص ومعرفة مرحلة الحالة.",
      ],
      [
        "هل يمكنني بدء التقييم في الرياض؟",
        "بالتأكيد؛ يمكنك البدء في مركز ريجوفيرا بالرياض.",
      ],
    ],
  },
  {
    campaignSegment: "brand-booking",
    slug: "lp-rejuvera-book-riyadh",
    title: "حجز استشارة في ريجوفيرا الرياض",
    titleEn: "Book a Consultation at Rejuvera Riyadh",
    headline: "احجز استشارتك الخاصة في ريجوفيرا بخطوات بسيطة",
    eyebrow: "ريجوفيرا | Rejuvera Center",
    intro:
      "لمن يبحث عن مركز ريجوفيرا أو يريد حجز استشارة مباشرة: شاركنا اسمك وجوالك، وينسّق لك فريقنا الموعد والخدمة المناسبة بكل ترحاب.",
    serviceSlug: "general-inquiry",
    serviceLabel: "حجز استشارة",
    sourceLabel: "صفحة هبوط - حجز ريجوفيرا",
    accent: "#5c2484",
    image: "/media/curated/clinic-interior.jpeg",
    offer: "تنسيق مباشر لموعد استشارتك الخاصة",
    bullets: [
      "حجز مباشر لاستشارة في مركز ريجوفيرا بالرياض.",
      "نوجّهك إلى الخدمة أو الطبيب الأنسب لاهتمامك.",
      "فريق يرتّب لك الموعد بكل ترحاب.",
      "تجربة هادئة وخصوصية تامة من أول تواصل.",
    ],
    sections: [
      ["حجز سريع", "اسمك وجوالك فقط للبدء."],
      ["توجيه مريح", "نحدد معك الخدمة المناسبة بعد معرفة اهتمامك."],
      ["مركز متكامل", "جراحة تجميل وجلدية ونساء وأجهزة في مكان واحد."],
    ],
    faqs: [
      [
        "هل هذه الصفحة الرسمية لريجوفيرا؟",
        "نعم، هي صفحة حجز تابعة لمركز ريجوفيرا الطبي بالرياض.",
      ],
      [
        "هل أحتاج اختيار الخدمة الآن؟",
        "لا حاجة لذلك؛ يكفي أن تشاركنا اهتمامك وسنوجّهك.",
      ],
      [
        "متى يتواصل معي الفريق؟",
        "يتواصل معك الفريق في أقرب وقت ممكن لترتيب موعدك.",
      ],
    ],
  },
  {
    campaignSegment: "male-gynecomastia",
    slug: "lp-male-gynecomastia-riyadh",
    title: "علاج التثدي عند الرجال",
    titleEn: "Male Gynecomastia Surgery in Riyadh",
    headline: "صدر أكثر تناسقًا وثقة، بخطة مناسبة للرجال وبخصوصية تامة",
    eyebrow: "التثدي عند الرجال",
    intro:
      "جلسة استشارية خاصة وسرية، يتعرّف فيها الاستشاري على سبب البروز ودرجته، ثم يعرض عليك الخيار الأنسب بين الشفط وغيره بوضوح وهدوء.",
    serviceSlug: "male-gynecomastia-surgery",
    serviceLabel: "علاج التثدي عند الرجال",
    sourceLabel: "صفحة هبوط - التثدي للرجال",
    accent: "#263f6c",
    image: "/media/reference/legacy/88985959.webp",
    offer: "تقييم خاص وسري لتحديد الخطة",
    bullets: [
      "نتعرّف على شكل الصدر ودرجة البروز قبل اختيار الإجراء.",
      "نوضح لك الفرق بين الدهون الموضعية والنسيج الغددي.",
      "خصوصية تامة في الطلب والتواصل.",
      "خطة تعافٍ واضحة بهدف مظهر متناسق وطبيعي.",
    ],
    sections: [
      ["خصوصية", "تواصل هادئ وسري مع فريق ريجوفيرا."],
      ["تقييم طبي", "نحدد سبب المشكلة قبل اختيار الحل."],
      ["مظهر متناسق", "هدفنا صدر طبيعي المظهر يعزز ثقتك."],
    ],
    faqs: [
      [
        "هل التثدي سببه دهون فقط؟",
        "ليس دائمًا؛ يحدد التقييم إن كان دهونًا أم نسيجًا غدديًا.",
      ],
      [
        "هل يمكن علاجه بالشفط؟",
        "بعض الحالات تناسبها هذه الطريقة وبعضها يحتاج خطة مختلفة، ويرسمها لك الاستشاري.",
      ],
      ["هل الطلب سري؟", "بالتأكيد؛ نتعامل مع بياناتك بخصوصية تامة."],
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

/** Arabic imperatives are gendered; pages written to women address them directly. */
function imperative(page, masculine, feminine) {
  return page.feminine ? feminine : masculine;
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

const sharedKeywordPhrases = [
  "مركز تجميل في الرياض",
  "عيادة تجميل في الرياض",
  "استشارة تجميلية",
  "جراحة تجميل في الرياض",
  "نتائج طبيعية",
  "أطباء تجميل",
  "ريجوفيرا",
  "Rejuvera Center",
  "تجميل الوجه",
  "تجميل الجسم",
  "نحت الجسم",
  "شد الترهلات",
  "تجميل الأنف",
  "شد الوجه",
  "شد الجفون",
  "تكبير الصدر",
  "شد البطن",
  "علاج الوذمة الشحمية",
  "الوذمة الشحمية",
  "حجز ريجوفيرا",
  "التجميل النسائي",
  "التثدي عند الرجال",
  "حجز استشارة",
  "عيادات الرياض",
  "مركز طبي تجميلي",
];

function keywordPhrases(page) {
  const phrases = [
    page.title,
    page.eyebrow,
    page.serviceLabel,
    page.offer,
    ...page.sections.map(([title]) => title),
    ...sharedKeywordPhrases,
  ];
  return [...new Set(phrases.filter(Boolean))].slice(0, 28);
}

function buildLandingPage(page) {
  return `
<section class="rv-ad-page" data-uploaded-html="true" data-layout="canvas" data-header="false" data-footer="false" data-campaign-page="${escapeHtml(page.campaignSegment)}" aria-label="${escapeHtml(page.title)}">
  <style>
    .rv-ad-page{--accent:${page.accent};--accent-soft:#f4ecfb;--ink:#24143d;--muted:#756986;--line:rgba(36,20,61,.12);display:block;width:100%;min-height:100vh;direction:rtl;text-align:right;color:var(--ink);font-family:inherit;background:#fbf7f0;overflow:hidden}
    .rv-ad-page *{box-sizing:border-box}
    .rv-ad-shell{width:min(1160px,calc(100% - 32px));margin:0 auto}
    .rv-ad-hero{position:relative;isolation:isolate;padding:clamp(28px,6vw,82px) 0;background:radial-gradient(circle at 20% 12%,rgba(125,230,219,.22),transparent 28%),linear-gradient(135deg,#fff 0%,#fbf5ff 47%,#f8efe4 100%)}
    .rv-ad-hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(92,36,132,.09),transparent 36%,rgba(198,151,87,.09));z-index:-1}
    .rv-ad-hero__grid{display:grid;grid-template-columns:minmax(320px,420px) minmax(0,1fr);gap:clamp(24px,5vw,58px);align-items:center;direction:ltr}
    .rv-ad-copy,.rv-ad-form-card{direction:rtl}
    .rv-ad-eyebrow{display:inline-flex;width:max-content;max-width:100%;align-items:center;gap:8px;border:1px solid var(--line);border-radius:999px;background:#fff;padding:8px 13px;color:var(--accent);font-size:13px;font-weight:900;box-shadow:0 8px 24px rgba(36,20,61,.06)}
    .rv-ad-eyebrow:before{content:"";width:8px;height:8px;border-radius:999px;background:#22c55e}
    .rv-ad-title{max-width:17ch;margin:18px 0 16px;font-size:clamp(34px,5.2vw,62px);line-height:1.15;font-weight:950;letter-spacing:0;color:var(--ink);text-wrap:balance}
    .rv-ad-intro{max-width:620px;margin:0;color:var(--muted);font-size:clamp(16px,1.8vw,20px);line-height:1.9}
    .rv-ad-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
    .rv-ad-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:999px;padding:13px 20px;text-decoration:none!important;font-weight:950;transition:transform .18s ease,box-shadow .18s ease}
    .rv-ad-btn:hover{transform:translateY(-2px)}
    .rv-ad-btn--primary{background:var(--accent);color:#fff!important;box-shadow:0 18px 34px rgba(92,36,132,.22)}
    .rv-ad-btn--ghost{border:1px solid var(--line);background:#fff;color:var(--accent)!important}
    .rv-ad-proof{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:28px;max-width:620px}
    .rv-ad-proof span{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.74);padding:13px 12px;text-align:center;font-size:13px;font-weight:850;color:var(--ink);box-shadow:0 10px 26px rgba(36,20,61,.05)}
    .rv-ad-form-card{border:1px solid rgba(255,255,255,.58);border-radius:30px;background:rgba(255,255,255,.92);padding:18px;box-shadow:0 28px 80px rgba(36,20,61,.16);backdrop-filter:blur(14px)}
    .rv-ad-form-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}
    .rv-ad-form-badge{display:inline-flex;border-radius:999px;background:#e9fbf5;color:#177a62;padding:7px 11px;font-size:12px;font-weight:950}
    .rv-ad-form-logo{border-radius:14px;background:var(--accent-soft);color:var(--accent);padding:8px 10px;font-size:12px;font-weight:950}
    .rv-ad-visual{position:relative;overflow:hidden;border-radius:22px;min-height:210px;background:#efe7f5}
    .rv-ad-visual img{display:block;width:100%;height:230px;object-fit:cover;margin:0}
    .rv-ad-offer{position:absolute;inset:auto 14px 14px 14px;border-radius:18px;background:rgba(255,255,255,.88);padding:12px 14px;color:var(--ink);font-weight:900;box-shadow:0 16px 32px rgba(36,20,61,.16);backdrop-filter:blur(10px)}
    .rv-ad-form{display:grid;gap:11px;padding-top:16px}
    .rv-ad-form h2{margin:0 0 2px;font-size:24px;line-height:1.3;color:var(--ink);font-weight:950;text-wrap:balance}
    .rv-ad-form p{margin:0 0 6px;color:var(--muted);font-size:13px;line-height:1.7}
    .rv-ad-field{display:grid;gap:6px}
    .rv-ad-field label{font-size:12px;font-weight:900;color:var(--ink)}
    .rv-ad-field input,.rv-ad-field select,.rv-ad-field textarea{width:100%;min-height:46px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--ink);padding:11px 13px;font:inherit;outline:none}
    .rv-ad-field textarea{min-height:86px;resize:vertical}
    .rv-ad-field input:focus,.rv-ad-field select:focus,.rv-ad-field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 4px rgba(92,36,132,.1)}
    .rv-ad-submit{min-height:50px;border:0;border-radius:16px;background:var(--accent);color:#fff!important;padding:13px 18px;font:inherit;font-weight:950;cursor:pointer;box-shadow:0 16px 34px rgba(92,36,132,.22)}
    .rv-ad-note{font-size:11px!important;text-align:center!important}
    .rv-ad-section{padding:clamp(34px,6vw,76px) 0}
    .rv-ad-section--white{background:#fff}
    .rv-ad-section__head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:24px}
    .rv-ad-kicker{margin:0 0 7px;color:var(--accent);font-size:13px;font-weight:950}
    .rv-ad-h2{margin:0;font-size:clamp(28px,4vw,46px);line-height:1.2;color:var(--ink);font-weight:950;text-wrap:balance}
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
    .rv-ad-bottom .rv-ad-btn{background:#fff;color:var(--accent)!important}
    @media(max-width:900px){.rv-ad-hero__grid,.rv-ad-split{grid-template-columns:1fr}.rv-ad-title{max-width:100%}.rv-ad-grid{grid-template-columns:1fr}.rv-ad-section__head{display:block}.rv-ad-proof{grid-template-columns:1fr}.rv-ad-mini-image img{min-height:260px}}
    @media(max-width:560px){.rv-ad-shell{width:min(100% - 22px,1120px)}.rv-ad-title{font-size:34px}.rv-ad-actions{display:grid}.rv-ad-btn{width:100%}.rv-ad-form-card,.rv-ad-card,.rv-ad-panel,.rv-ad-bottom{border-radius:20px}.rv-ad-visual img{height:250px}}
  </style>

  <header class="rv-ad-hero">
    <div class="rv-ad-shell rv-ad-hero__grid">
      <div class="rv-ad-form-card">
        <div class="rv-ad-form-head">
          <span class="rv-ad-form-badge">استشارة خاصة</span>
          <span class="rv-ad-form-logo">Rejuvera</span>
        </div>
        <form id="lead-form" class="rv-ad-form" method="post" action="/api/leads">
          <h2>خطوتك الأولى نحو استشارة تليق بك</h2>
          <p>اسمك ورقم جوالك يكفيان للبدء، وسيتواصل معك فريق ريجوفيرا لترتيب موعدك بكل ترحاب.</p>
          <input type="hidden" name="source" value="${escapeHtml(page.sourceLabel)}">
          <input type="hidden" name="serviceSlug" value="${escapeHtml(page.serviceSlug)}">
          <input type="hidden" name="service" value="${escapeHtml(page.serviceLabel)}">
          <input type="hidden" name="serviceName" value="${escapeHtml(page.serviceLabel)}">
          <input type="hidden" name="serviceLabel" value="${escapeHtml(page.serviceLabel)}">
          <input type="hidden" name="serviceTypeAr" value="${escapeHtml(page.serviceLabel)}">
          <input type="hidden" name="preferredLanguage" value="ar">
          <div class="rv-ad-field">
            <label for="${escapeHtml(page.slug)}-name">الاسم الكامل *</label>
            <input id="${escapeHtml(page.slug)}-name" name="fullName" type="text" required autocomplete="name" placeholder="اسمك الكريم">
          </div>
          <div class="rv-ad-field">
            <label for="${escapeHtml(page.slug)}-phone">رقم الجوال *</label>
            <input id="${escapeHtml(page.slug)}-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" dir="ltr" placeholder="05xxxxxxxx">
          </div>
          <button class="rv-ad-submit" type="submit">${imperative(page, "احجز استشارتك الخاصة الآن", "احجزي استشارتك الخاصة الآن")}</button>
          <p class="rv-ad-note">بياناتك بخصوصية تامة، ونستخدمها فقط للتواصل معك بشأن استشارتك.</p>
        </form>
        <div class="rv-ad-visual">
          <img src="${escapeHtml(page.image)}" alt="${escapeHtml(page.title)}" loading="eager" decoding="async">
          <div class="rv-ad-offer">${escapeHtml(page.offer)}</div>
        </div>
      </div>

      <div class="rv-ad-copy">
        <span class="rv-ad-eyebrow">${escapeHtml(page.eyebrow)}</span>
        <h1 class="rv-ad-title">${escapeHtml(page.headline)}</h1>
        <p class="rv-ad-intro">${escapeHtml(page.intro)}</p>
        <div class="rv-ad-actions">
          <a class="rv-ad-btn rv-ad-btn--primary" href="#lead-form">${imperative(page, "احجز استشارتك الخاصة", "احجزي استشارتك الخاصة")}</a>
          <a class="rv-ad-btn rv-ad-btn--ghost" href="tel:0114999959">${imperative(page, "تحدّث معنا هاتفيًا", "تحدّثي معنا هاتفيًا")}</a>
        </div>
        <div class="rv-ad-proof" aria-label="ما يميّز ريجوفيرا">
          <span>استشاريون متخصصون</span>
          <span>خصوصية تامة</span>
          <span>رعاية تواكبك</span>
        </div>
      </div>
    </div>
  </header>

  <section class="rv-ad-section rv-ad-section--white">
    <div class="rv-ad-shell">
      <div class="rv-ad-section__head">
        <div>
          <p class="rv-ad-kicker">تجربة ريجوفيرا</p>
          <h2 class="rv-ad-h2">تجربة تبدأ بالإنصات إليك</h2>
        </div>
      </div>
      <div class="rv-ad-grid">${renderCards(page.sections)}</div>
    </div>
  </section>

  <section class="rv-ad-section">
    <div class="rv-ad-shell rv-ad-split">
      <div class="rv-ad-panel">
        <p class="rv-ad-kicker">رحلتك معنا</p>
        <h2 class="rv-ad-h2">رحلة مريحة منذ أول تواصل</h2>
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
          <p class="rv-ad-kicker">أسئلة تهمّك</p>
          <h2 class="rv-ad-h2">إجابات تطمئنك قبل الحجز</h2>
        </div>
      </div>
      <div class="rv-ad-faqs">${renderFaqs(page.faqs)}</div>
    </div>
  </section>

  <section class="rv-ad-section">
    <div class="rv-ad-shell">
      <div class="rv-ad-bottom">
        <h2>${imperative(page, "ابدأ رحلتك بجلسة تليق بك", "ابدئي رحلتك بجلسة تليق بك")}</h2>
        <p>${imperative(page, "شاركنا بياناتك", "شاركينا بياناتك")}، وينسّق لك فريق ريجوفيرا جلسة استشارية خاصة مع الاستشاري الأنسب لك.</p>
        <a class="rv-ad-btn" href="#lead-form">${imperative(page, "احجز استشارتك الآن", "احجزي استشارتك الآن")}</a>
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
  if (force && (process.env.RENDER || process.env.RENDER_SERVICE_ID)) {
    throw new Error(
      "LANDING_SEED_FORCE is not permitted during Render deployment.",
    );
  }

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
        keywords: keywordPhrases(page),
        ogTitle: page.headline,
        ogDescription: page.intro,
        ogImage: page.image,
        noindex: false,
        status: "PUBLISHED",
        leadWebhookEnabled: false,
      },
      // Even if a page is created between the lookup and upsert, preserve it.
      update: force
        ? {
            titleAr: page.title,
            titleEn: page.titleEn,
            htmlContent: buildLandingPage(page),
            seoTitle: `${page.title} | Rejuvera Medical Center`,
            seoDescription: page.intro,
            metaTitle: `${page.title} | Rejuvera Center`,
            metaDescription: page.intro,
            keywords: keywordPhrases(page),
            ogTitle: page.headline,
            ogDescription: page.intro,
            ogImage: page.image,
            noindex: false,
            status: "PUBLISHED",
          }
        : {},
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
