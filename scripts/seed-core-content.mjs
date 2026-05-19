import { ContentStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CORE_SEED_VERSION = "2026-05-18-rejuvera-domain-hours-v2";

const images = {
  surgery:
    "/media/reference/legacy/WhatsApp-Image-2024-08-12-at-4.55.56-PM.jpeg",
  face: "/media/curated/service-injectables.webp",
  skin: "/media/curated/service-skin-rejuvenation.webp",
  laser: "/media/curated/service-laser-hair-removal.jpg",
  body: "/media/reference/legacy/88985959.webp",
  clinic: "/media/curated/clinic-treatment-room.jpeg",
};

const categories = [
  {
    slug: "plastic-surgery",
    nameAr: "قسم جراحة التجميل",
    nameEn: "Plastic Surgery Department",
    descriptionAr:
      "عمليات تجميل متكاملة لتحسين المظهر باستخدام أحدث الأساليب الجراحية الآمنة.",
    descriptionEn:
      "Comprehensive cosmetic procedures to enhance appearance with modern, safe surgical planning.",
  },
  {
    slug: "general-surgery",
    nameAr: "قسم الجراحة العامة",
    nameEn: "General Surgery Department",
    descriptionAr:
      "إجراء مختلف العمليات الجراحية العامة بأحدث الأساليب الطبية المنظمة.",
    descriptionEn:
      "General surgical care delivered with structured assessment and modern techniques.",
  },
  {
    slug: "female-aesthetics",
    nameAr: "قسم التجميل النسائي",
    nameEn: "Female Aesthetics Department",
    descriptionAr:
      "حلول تجميلية وعلاجية متخصصة لصحة وجمال المرأة بخصوصية ووضوح.",
    descriptionEn:
      "Specialized aesthetic and therapeutic solutions for women's health and confidence.",
  },
  {
    slug: "obstetrics-gynecology",
    nameAr: "قسم النساء والولادة",
    nameEn: "Obstetrics and Gynecology Department",
    descriptionAr:
      "رعاية شاملة للمرأة من متابعة الحمل حتى الخدمات النسائية المتخصصة.",
    descriptionEn:
      "Comprehensive women's care from pregnancy follow-up to specialized gynecology services.",
  },
  {
    slug: "men-health",
    nameAr: "قسم الصحة الذكورية",
    nameEn: "Men's Health Department",
    descriptionAr: "علاج مشاكل صحة الرجل والهرمونات والإنجاب بسرية وخطة واضحة.",
    descriptionEn:
      "Private, structured care for men's health, hormonal, and reproductive concerns.",
  },
  {
    slug: "non-surgical-body-contouring",
    nameAr: "قسم النحت غير الجراحي",
    nameEn: "Non-Surgical Body Contouring Department",
    descriptionAr:
      "تقنيات حديثة لتنسيق القوام بدون جراحة ونتائج متدرجة تناسب الحالة.",
    descriptionEn:
      "Modern non-surgical technologies for gradual, case-appropriate body contouring.",
  },
  {
    slug: "neurosurgery",
    nameAr: "قسم الجراحات العصبية",
    nameEn: "Neurosurgery Department",
    descriptionAr:
      "علاج أمراض المخ والأعصاب والعمود الفقري بتقنيات وخطط دقيقة.",
    descriptionEn:
      "Brain, nerve, and spine care based on precise diagnosis and treatment planning.",
  },
  {
    slug: "dermatology-aesthetic-procedures",
    nameAr: "قسم الإجراءات الجلدية والتجميل",
    nameEn: "Dermatology and Aesthetic Procedures Department",
    descriptionAr: "علاج مشاكل البشرة والشعر وتقديم خدمات تجميلية غير جراحية.",
    descriptionEn:
      "Skin, hair, and non-surgical aesthetic services guided by clinical assessment.",
  },
  {
    slug: "facial-plastic-surgery",
    nameAr: "قسم عمليات تجميل الوجه",
    nameEn: "Facial Plastic Surgery Department",
    descriptionAr: "حلول جراحية متقدمة لإعادة شباب الوجه وتحقيق تناسق طبيعي.",
    descriptionEn:
      "Advanced facial procedures for balanced, natural-looking rejuvenation.",
  },
];

const doctors = [
  {
    slug: "loai-alsalmi",
    nameAr: "د. لؤي السالمي",
    nameEn: "Dr. Loai Al-Salmi",
    titleAr: "استشاري جراحة التجميل والترميم",
    titleEn: "Consultant Plastic and Reconstructive Surgeon",
    specialtyAr: "جراحة التجميل والترميم",
    specialtyEn: "Plastic and Reconstructive Surgery",
    bioAr:
      "يقيّم الحالات الجراحية والتجميلية بمنهج يوازن بين السلامة الطبية ودقة التخطيط وتحديد ما يمكن تحقيقه فعليًا لكل حالة.",
    bioEn:
      "Evaluates aesthetic and reconstructive cases with a balanced approach to safety, planning, and realistic outcomes.",
    photoUrl: "/media/doctors/loai-alsalmi.webp",
    yearsExperience: 25,
    languages: ["العربية", "الإنجليزية"],
    isFeatured: true,
  },
  {
    slug: "maher-alahdab",
    nameAr: "د. ماهر الأحدب",
    nameEn: "Dr. Maher Al-Ahdab",
    titleAr: "استشاري جراحة التجميل والترميم",
    titleEn: "Consultant Plastic and Reconstructive Surgeon",
    specialtyAr: "جراحة التجميل والترميم",
    specialtyEn: "Plastic and Reconstructive Surgery",
    bioAr:
      "يتعامل مع الحالات الجراحية والترميمية من منظور يبدأ بالتشخيص وترتيب الأولويات العلاجية والجراحية وفق احتياج الحالة.",
    bioEn:
      "Approaches surgical and reconstructive cases through diagnosis, prioritization, and patient-specific planning.",
    photoUrl: "/media/doctors/maher-alahdab.webp",
    yearsExperience: 20,
    languages: ["العربية", "الإنجليزية"],
    isFeatured: false,
  },
  {
    slug: "saham-arfaj",
    nameAr: "د. سهام العرفج",
    nameEn: "Dr. Saham Al-Arfaj",
    titleAr: "استشارية جراحة التجميل والترميم",
    titleEn: "Consultant Plastic and Reconstructive Surgeon",
    specialtyAr: "جراحة التجميل والترميم",
    specialtyEn: "Plastic and Reconstructive Surgery",
    bioAr:
      "تقدم الاستشارات الجراحية والترميمية مع تركيز على السلامة ودقة التخطيط وتحديد الإجراء الأنسب للحالة.",
    bioEn:
      "Provides surgical and reconstructive consultations focused on safety, planning, and case-appropriate procedures.",
    photoUrl: "/media/doctors/saham-arfaj.webp",
    yearsExperience: 15,
    languages: ["العربية", "الإنجليزية"],
    isFeatured: false,
  },
  {
    slug: "sabah-alrashid",
    nameAr: "د. صباح الراشد",
    nameEn: "Dr. Sabah Al-Rashid",
    titleAr: "استشاري جراحة المخ والأعصاب والعمود الفقري",
    titleEn: "Consultant Neurosurgeon and Spine Surgeon",
    specialtyAr: "جراحة المخ والأعصاب والعمود الفقري",
    specialtyEn: "Neurosurgery and Spine Surgery",
    bioAr:
      "يعتمد على تقييم سريري دقيق في الحالات الجراحية المعقدة مع شرح واضح للمراجع قبل اختيار أي مسار علاجي.",
    bioEn:
      "Uses careful clinical assessment for complex neurosurgical and spine cases before choosing a treatment path.",
    photoUrl: "/media/doctors/sabah-alrashid.webp",
    yearsExperience: 30,
    languages: ["العربية", "الإنجليزية"],
    isFeatured: false,
  },
  {
    slug: "karima-jamjoom",
    nameAr: "د. كريمة جمجوم",
    nameEn: "Dr. Karima Jamjoom",
    titleAr: "أخصائية التجميل النسائي وطب النساء والولادة",
    titleEn: "Female Aesthetics, Obstetrics and Gynecology Specialist",
    specialtyAr: "التجميل النسائي وطب النساء والولادة",
    specialtyEn: "Female Aesthetics, Obstetrics and Gynecology",
    bioAr:
      "تقدم خدمات التجميل النسائي وطب النساء والولادة بمنهج يركز على الخصوصية ووضوح الخيارات المناسبة لكل حالة.",
    bioEn:
      "Provides female aesthetic and gynecology care with privacy, clarity, and case-specific planning.",
    photoUrl: "/media/doctors/karima-jamjoom.webp",
    yearsExperience: 15,
    languages: ["العربية", "الإنجليزية"],
    isFeatured: false,
  },
  {
    slug: "najwa-batarfi",
    nameAr: "د. نجوى باطرفي",
    nameEn: "Dr. Najwa Batarfi",
    titleAr: "استشارية التجميل النسائي",
    titleEn: "Consultant Female Aesthetics",
    specialtyAr: "التجميل النسائي",
    specialtyEn: "Female Aesthetics",
    bioAr:
      "تعتمد على تقييم واضح ومباشر في خدمات التجميل النسائي مع شرح منظم للخيارات وحدود كل إجراء.",
    bioEn:
      "Offers clear female aesthetic assessment with structured explanation of options and expected limits.",
    photoUrl: "/media/doctors/najwa-batarfi.webp",
    yearsExperience: 15,
    languages: ["العربية", "الإنجليزية"],
    isFeatured: false,
  },
  {
    slug: "natali-domloj",
    nameAr: "د. ناتالي دوملوج",
    nameEn: "Dr. Natali Domloj",
    titleAr: "استشارية الجلدية والتجميل",
    titleEn: "Consultant Dermatology and Aesthetics",
    specialtyAr: "الجلدية والتجميل",
    specialtyEn: "Dermatology and Aesthetics",
    bioAr:
      "تركز على التشخيص الواضح وضبط الخطة العلاجية وفق طبيعة البشرة واحتياج الحالة من إجراءات جلدية أو تجميلية.",
    bioEn:
      "Focuses on diagnosis-led skin and aesthetic planning tailored to skin type and patient goals.",
    photoUrl: "/media/doctors/natali-domloj.webp",
    yearsExperience: 20,
    languages: ["العربية", "الإنجليزية", "الفرنسية"],
    isFeatured: false,
  },
  {
    slug: "falwah-aljanoubi",
    nameAr: "د. فلوة الجنوبي",
    nameEn: "Dr. Falwah Al-Janoubi",
    titleAr: "أخصائية الجراحة العامة",
    titleEn: "General Surgery Specialist",
    specialtyAr: "الجراحة العامة",
    specialtyEn: "General Surgery",
    bioAr:
      "تقدم تقييمًا واضحًا في الجراحة العامة مع شرح الخطة العلاجية وتحديد احتياج التدخل الجراحي.",
    bioEn:
      "Provides general surgery assessment with clear treatment planning and surgical decision support.",
    photoUrl: "/media/doctors/falwah-aljanoubi.webp",
    yearsExperience: 5,
    languages: ["العربية", "الإنجليزية"],
    isFeatured: false,
  },
  {
    slug: "bandar-alharthi",
    nameAr: "البروفيسور بندر الحارثي",
    nameEn: "Prof. Bandar Al-Harthi",
    titleAr: "استشاري جراحة عامة وجراحة أورام الثدي والغدد الصماء",
    titleEn: "Consultant General, Breast Oncology and Endocrine Surgeon",
    specialtyAr: "جراحة عامة وجراحة أورام الثدي والغدد الصماء",
    specialtyEn: "General, Breast Oncology and Endocrine Surgery",
    bioAr:
      "يعتمد على منهج سريري دقيق في تقييم الحالات الجراحية وترتيب الخيارات العلاجية وشرحها بصورة واضحة.",
    bioEn:
      "Uses a precise clinical approach to surgical evaluation, treatment prioritization, and patient communication.",
    photoUrl: "/media/doctors/bandar-alharthi.webp",
    yearsExperience: 21,
    languages: ["العربية", "الإنجليزية"],
    isFeatured: false,
  },
  {
    slug: "ahmed-eldesouki",
    nameAr: "د. أحمد الدسوقي",
    nameEn: "Dr. Ahmed El-Desouki",
    titleAr: "نائب أول جراحة التجميل",
    titleEn: "Senior Registrar Plastic Surgery",
    specialtyAr: "جراحة التجميل",
    specialtyEn: "Plastic Surgery",
    bioAr:
      "يقدم استشارات جراحة التجميل بمنهج عملي يركز على تقييم الحالة وتحديد الإجراء المناسب وشرح الخطوات المتوقعة.",
    bioEn:
      "Provides practical plastic surgery consultations focused on assessment, procedure selection, and clear next steps.",
    photoUrl: "/media/doctors/ahmed-eldesouki.webp",
    yearsExperience: 7,
    languages: ["العربية", "الإنجليزية"],
    isFeatured: false,
  },
];

const plasticSurgeons = [
  "loai-alsalmi",
  "maher-alahdab",
  "saham-arfaj",
  "ahmed-eldesouki",
];
const breastTeam = [
  "loai-alsalmi",
  "maher-alahdab",
  "ahmed-eldesouki",
  "bandar-alharthi",
];
const dermatologyTeam = ["natali-domloj", "saham-arfaj"];
const femaleTeam = ["karima-jamjoom", "najwa-batarfi"];

const services = [
  {
    slug: "rhinoplasty",
    nameAr: "عمليات تجميل الأنف",
    nameEn: "Rhinoplasty",
    categorySlug: "facial-plastic-surgery",
    excerptAr: "أنف متناسق يبرز جمال ملامحك ويعزز ثقتك بنفسك.",
    excerptEn:
      "A balanced nose shape that supports facial harmony and confidence.",
    image: images.face,
    doctors: plasticSurgeons,
  },
  {
    slug: "breast-augmentation",
    nameAr: "عمليات تكبير الصدر",
    nameEn: "Breast Augmentation",
    categorySlug: "plastic-surgery",
    excerptAr: "امتلاء أنثوي جذاب يعزز تناسق الجسم والثقة.",
    excerptEn:
      "Feminine volume planned to suit body proportions and expectations.",
    image: images.surgery,
    doctors: breastTeam,
  },
  {
    slug: "breast-lift",
    nameAr: "عملية شد الصدر",
    nameEn: "Breast Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "استعادة شكل مرفوع ومشدود يمنحك مظهرًا أنثويًا شابًا بدون ترهل.",
    excerptEn:
      "Restores a lifted breast shape and improves sagging with careful planning.",
    image: images.surgery,
    doctors: breastTeam,
  },
  {
    slug: "liposuction",
    nameAr: "عمليات شفط الدهون",
    nameEn: "Liposuction",
    categorySlug: "plastic-surgery",
    excerptAr: "تخلص مدروس من الدهون العنيدة مع نحت أوضح للقوام.",
    excerptEn:
      "Targeted fat removal for clearer body definition in suitable cases.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "blepharoplasty",
    nameAr: "عملية تجميل الجفون (علوي / سفلي)",
    nameEn: "Upper and Lower Blepharoplasty",
    categorySlug: "facial-plastic-surgery",
    excerptAr: "عيون أكثر إشراقًا بدون ترهل أو انتفاخ واضح.",
    excerptEn:
      "Refreshes the eye area by addressing eyelid heaviness or puffiness.",
    image: images.face,
    doctors: plasticSurgeons,
  },
  {
    slug: "eyelid-lift",
    nameAr: "عملية شد الجفون",
    nameEn: "Eyelid Lift",
    categorySlug: "facial-plastic-surgery",
    excerptAr: "إزالة الجلد الزائد حول العين لمظهر شبابي وأكثر راحة.",
    excerptEn: "Removes excess eyelid skin for a brighter, more rested look.",
    image: images.face,
    doctors: plasticSurgeons,
  },
  {
    slug: "otoplasty",
    nameAr: "عملية تجميل الأذن",
    nameEn: "Otoplasty",
    categorySlug: "facial-plastic-surgery",
    excerptAr: "تصحيح بروز الأذن وتحسين شكلها بتخطيط جراحي دقيق.",
    excerptEn:
      "Improves prominent ear shape through precise surgical planning.",
    image: images.face,
    doctors: plasticSurgeons,
  },
  {
    slug: "tummy-tuck",
    nameAr: "عملية شد البطن",
    nameEn: "Tummy Tuck",
    categorySlug: "plastic-surgery",
    excerptAr: "بطن مسطح ومشدود بعد الحمل أو فقدان الوزن.",
    excerptEn: "Improves abdominal laxity after pregnancy or weight loss.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "body-sculpting-surgery",
    nameAr: "عملية نحت الجسم",
    nameEn: "Surgical Body Sculpting",
    categorySlug: "plastic-surgery",
    excerptAr: "إبراز تفاصيل الجسم بطريقة متناسقة وجذابة.",
    excerptEn: "Refines body contours through a case-specific surgical plan.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "breast-reduction",
    nameAr: "عملية تصغير الصدر",
    nameEn: "Breast Reduction",
    categorySlug: "plastic-surgery",
    excerptAr: "راحة أكبر وتناسق أفضل للجسم مع تحسين الشكل العام.",
    excerptEn:
      "Reduces breast size to improve comfort, balance, and proportions.",
    image: images.surgery,
    doctors: breastTeam,
  },
  {
    slug: "breast-implant-revision",
    nameAr: "عملية تغيير حشوات الصدر",
    nameEn: "Breast Implant Revision",
    categorySlug: "plastic-surgery",
    excerptAr: "تحديث الشكل أو الحجم بنتيجة أفضل وقرار طبي أوضح.",
    excerptEn:
      "Updates implant size or shape after medical and aesthetic assessment.",
    image: images.surgery,
    doctors: breastTeam,
  },
  {
    slug: "breast-implant-removal",
    nameAr: "عملية إزالة حشوات الصدر",
    nameEn: "Breast Implant Removal",
    categorySlug: "plastic-surgery",
    excerptAr: "عودة طبيعية لشكل الثدي بدون حشوات وفق خطة آمنة.",
    excerptEn:
      "Removes implants with a plan focused on safety and natural shape.",
    image: images.surgery,
    doctors: breastTeam,
  },
  {
    slug: "male-gynecomastia-surgery",
    nameAr: "عملية التثدي عند الرجال",
    nameEn: "Male Gynecomastia Surgery",
    categorySlug: "men-health",
    excerptAr: "صدر مسطح ومظهر رجولي بثقة أكبر.",
    excerptEn:
      "Improves male chest contour for a flatter, more confident appearance.",
    image: images.body,
    doctors: [
      "loai-alsalmi",
      "maher-alahdab",
      "ahmed-eldesouki",
      "bandar-alharthi",
    ],
  },
  {
    slug: "bbl",
    nameAr: "عملية تكبير الأرداف (BBL)",
    nameEn: "Brazilian Butt Lift (BBL)",
    categorySlug: "plastic-surgery",
    excerptAr: "امتلاء طبيعي وجذاب باستخدام الدهون الذاتية للحالات المناسبة.",
    excerptEn:
      "Uses fat transfer to enhance buttock fullness in suitable cases.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "buttock-lift",
    nameAr: "عملية شد الأرداف",
    nameEn: "Buttock Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "رفع وشد الأرداف لمظهر أكثر شبابًا وتناسقًا.",
    excerptEn: "Lifts and tightens buttock contour for improved proportions.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "back-lift",
    nameAr: "عملية شد الظهر",
    nameEn: "Back Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "تخلص من ترهلات الظهر لظهر مشدود وأكثر انسيابية.",
    excerptEn: "Addresses back laxity for a firmer, smoother contour.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "post-weight-loss-body-lift",
    nameAr: "عملية شد الترهلات",
    nameEn: "Post-Weight-Loss Body Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "استعادة قوام متناسق بعد نزول الوزن الكبير.",
    excerptEn:
      "Improves loose skin after major weight loss with staged planning.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "thigh-lift",
    nameAr: "عملية شد الفخذين",
    nameEn: "Thigh Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "تحسين شكل الفخذين وشد الجلد المترهل.",
    excerptEn: "Improves thigh contour by addressing skin laxity.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "arm-lift",
    nameAr: "عملية شد الذراعين",
    nameEn: "Arm Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "أذرع مشدودة بدون ترهل أو جلد زائد.",
    excerptEn: "Tightens upper arm laxity for a smoother arm profile.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "full-body-lift",
    nameAr: "شد الجسم الكامل",
    nameEn: "Full Body Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "حل شامل لترهلات الجسم بالكامل بنتيجة متناسقة.",
    excerptEn:
      "A comprehensive approach for body laxity and proportional improvement.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "buttock-reduction",
    nameAr: "عملية تصغير الأرداف",
    nameEn: "Buttock Reduction",
    categorySlug: "plastic-surgery",
    excerptAr: "تقليل الحجم للحصول على تناسق مثالي مع الجسم.",
    excerptEn: "Reduces buttock volume to improve overall body balance.",
    image: images.body,
    doctors: plasticSurgeons,
  },
  {
    slug: "skin-rejuvenation",
    nameAr: "تجديد البشرة المتقدم",
    nameEn: "Advanced Skin Rejuvenation",
    categorySlug: "dermatology-aesthetic-procedures",
    excerptAr: "خطة متدرجة لتحسين نضارة البشرة وتوحيد اللون واستعادة الإشراق.",
    excerptEn: "A staged plan to improve glow, tone, and skin clarity.",
    image: images.skin,
    doctors: dermatologyTeam,
  },
  {
    slug: "laser-hair-removal",
    nameAr: "إزالة الشعر بالليزر",
    nameEn: "Laser Hair Removal",
    categorySlug: "dermatology-aesthetic-procedures",
    excerptAr:
      "جلسات مدروسة لتقليل الشعر غير المرغوب فيه حسب نوع البشرة والشعر.",
    excerptEn:
      "Structured sessions tailored to skin type, hair density, and treatment area.",
    image: images.laser,
    doctors: ["natali-domloj"],
  },
  {
    slug: "injectable-harmony",
    nameAr: "تناغم الوجه بالحقن",
    nameEn: "Injectable Facial Harmony",
    categorySlug: "dermatology-aesthetic-procedures",
    excerptAr: "نهج تجميلي يبرز توازن الملامح ويحافظ على التعبير الطبيعي.",
    excerptEn:
      "A balanced injectable approach that supports natural facial expression.",
    image: images.face,
    doctors: dermatologyTeam,
  },
  {
    slug: "body-contouring",
    nameAr: "نحت القوام غير الجراحي",
    nameEn: "Non-Surgical Body Contouring",
    categorySlug: "non-surgical-body-contouring",
    excerptAr: "تقنيات حديثة لتحسين تناسق القوام بدون جراحة للحالات المناسبة.",
    excerptEn:
      "Modern non-surgical options to improve body contour in suitable cases.",
    image: images.body,
    doctors: ["loai-alsalmi", "ahmed-eldesouki"],
  },
  {
    slug: "dermatology-consultation",
    nameAr: "استشارات الجلدية والعناية بالبشرة",
    nameEn: "Dermatology and Skin Care Consultation",
    categorySlug: "dermatology-aesthetic-procedures",
    excerptAr: "تقييم طبي لحالة البشرة ووضع خطة علاجية أو تجميلية مناسبة.",
    excerptEn: "Medical skin assessment and treatment or aesthetic planning.",
    image: images.skin,
    doctors: dermatologyTeam,
  },
  {
    slug: "female-aesthetic-care",
    nameAr: "خدمات التجميل النسائي",
    nameEn: "Female Aesthetic Care",
    categorySlug: "female-aesthetics",
    excerptAr: "حلول نسائية تجميلية وعلاجية بخصوصية وخطة واضحة.",
    excerptEn:
      "Private female aesthetic care with clear, case-specific planning.",
    image: images.clinic,
    doctors: femaleTeam,
  },
  {
    slug: "obgyn-care",
    nameAr: "خدمات النساء والولادة",
    nameEn: "Obstetrics and Gynecology Care",
    categorySlug: "obstetrics-gynecology",
    excerptAr: "رعاية نسائية شاملة ومتابعة منظمة حسب احتياج كل حالة.",
    excerptEn: "Comprehensive women's care and structured follow-up.",
    image: images.clinic,
    doctors: ["karima-jamjoom"],
  },
  {
    slug: "general-surgery-consultation",
    nameAr: "استشارات الجراحة العامة",
    nameEn: "General Surgery Consultation",
    categorySlug: "general-surgery",
    excerptAr: "تقييم جراحي عام وشرح الخيارات العلاجية المناسبة.",
    excerptEn: "General surgical assessment with clear treatment options.",
    image: images.clinic,
    doctors: ["falwah-aljanoubi", "bandar-alharthi"],
  },
  {
    slug: "neurosurgery-spine-care",
    nameAr: "جراحة المخ والأعصاب والعمود الفقري",
    nameEn: "Neurosurgery and Spine Care",
    categorySlug: "neurosurgery",
    excerptAr: "تقييم وعلاج حالات المخ والأعصاب والعمود الفقري بخطة دقيقة.",
    excerptEn: "Assessment and care for brain, nerve, and spine conditions.",
    image: images.clinic,
    doctors: ["sabah-alrashid"],
  },
];

function descriptionForService(service) {
  return `${service.excerptAr} يبدأ المسار باستشارة طبية لتقييم الحالة، شرح الخيارات المناسبة، وتحديد الخطة الآمنة التي تحقق نتيجة طبيعية ومتناسقة داخل Rejuvera Medical Center.`;
}

function descriptionEnForService(service) {
  return `${service.excerptEn} The journey starts with a medical consultation to assess the case, explain suitable options, and define a safe plan at Rejuvera Medical Center.`;
}

async function upsertCategories() {
  for (const [index, category] of categories.entries()) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        status: ContentStatus.PUBLISHED,
        sortOrder: index + 1,
      },
      create: {
        slug: category.slug,
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        status: ContentStatus.PUBLISHED,
        sortOrder: index + 1,
      },
    });
  }
}

async function upsertDoctors() {
  for (const [index, doctor] of doctors.entries()) {
    const existing = await prisma.doctor.findUnique({
      where: { slug: doctor.slug },
      select: { id: true, photoUrl: true, coverImageUrl: true },
    });

    await prisma.doctor.upsert({
      where: { slug: doctor.slug },
      update: {
        nameAr: doctor.nameAr,
        nameEn: doctor.nameEn,
        titleAr: doctor.titleAr,
        titleEn: doctor.titleEn,
        specialtyAr: doctor.specialtyAr,
        specialtyEn: doctor.specialtyEn,
        bioAr: doctor.bioAr,
        bioEn: doctor.bioEn,
        languages: doctor.languages,
        yearsExperience: doctor.yearsExperience,
        status: ContentStatus.PUBLISHED,
        isFeatured: doctor.isFeatured,
        sortOrder: index + 1,
        publications: [doctor.bioAr.slice(0, 160)],
        achievements: [],
        education: [doctor.titleAr],
        photoUrl: existing?.photoUrl || doctor.photoUrl,
        coverImageUrl:
          existing?.coverImageUrl || existing?.photoUrl || doctor.photoUrl,
      },
      create: {
        slug: doctor.slug,
        nameAr: doctor.nameAr,
        nameEn: doctor.nameEn,
        titleAr: doctor.titleAr,
        titleEn: doctor.titleEn,
        specialtyAr: doctor.specialtyAr,
        specialtyEn: doctor.specialtyEn,
        bioAr: doctor.bioAr,
        bioEn: doctor.bioEn,
        languages: doctor.languages,
        yearsExperience: doctor.yearsExperience,
        status: ContentStatus.PUBLISHED,
        isFeatured: doctor.isFeatured,
        sortOrder: index + 1,
        publications: [doctor.bioAr.slice(0, 160)],
        achievements: [],
        education: [doctor.titleAr],
        photoUrl: doctor.photoUrl,
        coverImageUrl: doctor.photoUrl,
      },
    });
  }
}

async function upsertServices() {
  for (const [index, service] of services.entries()) {
    const category = await prisma.serviceCategory.findUnique({
      where: { slug: service.categorySlug },
      select: { id: true, nameAr: true },
    });
    const existing = await prisma.service.findUnique({
      where: { slug: service.slug },
      select: { id: true, coverImageUrl: true },
    });
    const doctorsToConnect = await prisma.doctor.findMany({
      where: { slug: { in: service.doctors } },
      select: { slug: true },
    });

    const common = {
      nameAr: service.nameAr,
      nameEn: service.nameEn,
      excerptAr: service.excerptAr,
      excerptEn: service.excerptEn,
      descriptionAr: descriptionForService(service),
      descriptionEn: descriptionEnForService(service),
      categoryKey: category?.nameAr ?? service.categorySlug,
      categoryId: category?.id ?? null,
      status: ContentStatus.PUBLISHED,
      isFeatured: index < 12,
      sortOrder: index + 1,
      coverImageUrl: existing?.coverImageUrl || service.image,
      seoTitleAr: `${service.nameAr} في الرياض | Rejuvera Medical Center`,
      seoTitleEn: `${service.nameEn} in Riyadh | Rejuvera Medical Center`,
      seoDescriptionAr: service.excerptAr,
      seoDescriptionEn: service.excerptEn,
    };

    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        ...common,
        doctors: {
          connect: doctorsToConnect.map((doctor) => ({ slug: doctor.slug })),
        },
      },
      create: {
        slug: service.slug,
        ...common,
        doctors: {
          connect: doctorsToConnect.map((doctor) => ({ slug: doctor.slug })),
        },
      },
    });
  }
}

async function updateBrandDefaults() {
  const brandSettings = [
    {
      groupKey: "brand",
      itemKey: "siteName",
      label: "اسم الموقع",
      value: "Rejuvera Center",
    },
    {
      groupKey: "brand",
      itemKey: "shortName",
      label: "الاسم المختصر",
      value: "Rejuvera",
    },
  ];

  for (const setting of brandSettings) {
    await prisma.siteSetting.upsert({
      where: { key: `${setting.groupKey}.${setting.itemKey}` },
      update: { value: setting.value, groupName: setting.groupKey },
      create: {
        key: `${setting.groupKey}.${setting.itemKey}`,
        groupName: setting.groupKey,
        value: setting.value,
      },
    });
  }
}

async function updateContactDefaults() {
  const contactSettings = [
    {
      groupKey: "contact",
      itemKey: "email",
      label: "البريد الرسمي",
      value: "info@rejuvera.sa",
    },
    {
      groupKey: "contact",
      itemKey: "emailSecondary",
      label: "البريد البديل",
      value: "info@rejuvera.sa",
    },
    {
      groupKey: "contact",
      itemKey: "domain",
      label: "النطاق الرسمي",
      value: "rejuvera.sa",
    },
    {
      groupKey: "contact",
      itemKey: "hoursWeekdays",
      label: "ساعات العمل (السبت — الخميس)",
      value: "السبت إلى الخميس: 2:00 م - 10:00 م",
    },
    {
      groupKey: "contact",
      itemKey: "hoursWeekend",
      label: "اليوم المغلق",
      value: "الجمعة: مغلق",
    },
    {
      groupKey: "contact",
      itemKey: "hoursWeekdaysEn",
      label: "Working hours (Sat – Thu, English)",
      value: "Saturday to Thursday: 2:00 PM - 10:00 PM",
    },
    {
      groupKey: "contact",
      itemKey: "hoursWeekendEn",
      label: "Closed day (English)",
      value: "Friday: Closed",
    },
  ];

  for (const setting of contactSettings) {
    await prisma.siteSetting.upsert({
      where: { key: `${setting.groupKey}.${setting.itemKey}` },
      update: { value: setting.value, groupName: setting.groupKey },
      create: {
        key: `${setting.groupKey}.${setting.itemKey}`,
        groupName: setting.groupKey,
        value: setting.value,
      },
    });
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[seed-core-content] DATABASE_URL is not set; skipping.");
    return;
  }

  const currentSeed = await prisma.siteSetting.findUnique({
    where: { key: "system.coreContentSeedVersion" },
    select: { value: true },
  });
  if (currentSeed?.value === CORE_SEED_VERSION) {
    const [existingCategories, existingServices, existingDoctors] =
      await Promise.all([
        prisma.serviceCategory.count({
          where: { slug: { in: categories.map((category) => category.slug) } },
        }),
        prisma.service.count({
          where: { slug: { in: services.map((service) => service.slug) } },
        }),
        prisma.doctor.count({
          where: { slug: { in: doctors.map((doctor) => doctor.slug) } },
        }),
      ]);
    if (
      existingCategories === categories.length &&
      existingServices === services.length &&
      existingDoctors === doctors.length
    ) {
      console.log(
        `[seed-core-content] Core content ${CORE_SEED_VERSION} already applied; skipping.`,
      );
      return;
    }
    console.log(
      `[seed-core-content] Core content ${CORE_SEED_VERSION} is marked applied, but records are missing; reconciling.`,
    );
  }

  await upsertCategories();
  await upsertDoctors();
  await upsertServices();
  await updateBrandDefaults();
  await updateContactDefaults();
  await prisma.siteSetting.upsert({
    where: { key: "system.coreContentSeedVersion" },
    update: { value: CORE_SEED_VERSION, groupName: "system" },
    create: {
      key: "system.coreContentSeedVersion",
      groupName: "system",
      value: CORE_SEED_VERSION,
    },
  });

  console.log(
    `[seed-core-content] Seeded ${categories.length} categories, ${services.length} services, and ${doctors.length} doctors.`,
  );
}

main()
  .catch((error) => {
    console.error("[seed-core-content] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
