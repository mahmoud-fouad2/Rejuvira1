import { ContentStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CORE_SEED_VERSION = "2026-05-19-service-tree-v2";

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

const deviceCatalog = [
  {
    slug: "ulthera-skin-lifting-device",
    nameAr: "جهاز ألثيرا لشد الوجه والرقبة بالموجات فوق الصوتية",
    nameEn: "Ulthera Face and Neck Ultrasound Lifting Device",
    excerptAr:
      "تقنية موجات فوق صوتية مركزة لدعم خطط شد الوجه والرقبة بدون جراحة في الحالات المناسبة.",
    excerptEn:
      "Focused ultrasound technology for non-surgical face and neck lifting plans.",
    descriptionAr:
      "يستخدم جهاز ألثيرا ضمن خطط شد الوجه والرقبة غير الجراحية بعد تقييم درجة الترهل وسماكة الجلد والتوقعات المناسبة لكل حالة.",
    descriptionEn:
      "Ulthera is used in non-surgical face and neck lifting plans after assessing laxity, skin quality, and realistic expectations.",
    image: images.clinic,
  },
  {
    slug: "emface-body-contouring-device",
    nameAr: "جهاز إمفيس لشد العضلات ونحت القوام",
    nameEn: "EMFACE Muscle Toning and Contouring Device",
    excerptAr:
      "تقنية داعمة لشد العضلات وتحسين التناسق ضمن مسارات غير جراحية مختارة.",
    excerptEn:
      "Supportive technology for muscle toning and contour refinement in selected non-surgical plans.",
    descriptionAr:
      "يدعم جهاز إمفيس خطط شد العضلات وتحسين التناسق في الحالات المناسبة، ويتم ربطه بالخدمة حسب الهدف العلاجي وخطة الجلسات.",
    descriptionEn:
      "EMFACE supports selected muscle-toning and contouring plans according to the treatment goal and session plan.",
    image: images.body,
  },
  {
    slug: "exion-skin-rejuvenation-device",
    nameAr: "جهاز إكزيون لتجديد البشرة وشد الجلد",
    nameEn: "EXION Skin Rejuvenation and Tightening Device",
    excerptAr:
      "تقنية مخصصة لتحسين نضارة البشرة وتماسك الجلد ضمن تقييم طبي واضح.",
    excerptEn:
      "Technology used to support skin rejuvenation and firmness after clinical assessment.",
    descriptionAr:
      "يستخدم إكزيون ضمن خطط تجديد البشرة وشد الجلد عندما تكون الحالة مناسبة للتقنيات غير الجراحية والتحسن التدريجي.",
    descriptionEn:
      "EXION is used in skin rejuvenation and tightening plans when non-surgical gradual improvement is appropriate.",
    image: images.skin,
  },
  {
    slug: "morpheus8-fractional-rf-device",
    nameAr: "جهاز مورفيوس 8 لتجديد البشرة وشد الجلد",
    nameEn: "Morpheus8 Fractional RF Skin Rejuvenation Device",
    excerptAr:
      "تقنية ترددات حرارية مجزأة لتحسين ملمس البشرة وشد الجلد وآثار الندبات والمسام.",
    excerptEn:
      "Fractional RF technology for texture, firmness, scars, and pores.",
    descriptionAr:
      "يدخل مورفيوس 8 في خطط تحسين ملمس البشرة وآثار الندبات والمسام وشد الجلد، حسب نوع البشرة واحتياج الحالة.",
    descriptionEn:
      "Morpheus8 supports plans for texture, pores, scars, and skin tightening according to skin type and case needs.",
    image: images.skin,
  },
  {
    slug: "emsculpt-body-contouring-device",
    nameAr: "جهاز إيم سكلبت لنحت القوام وتقوية العضلات",
    nameEn: "Emsculpt Body Contouring and Muscle Strengthening Device",
    excerptAr:
      "تقنية غير جراحية لدعم نحت القوام وتقوية العضلات في مناطق مختارة.",
    excerptEn:
      "Non-surgical technology supporting body contouring and muscle strengthening.",
    descriptionAr:
      "يستخدم إيم سكلبت ضمن مسارات نحت القوام وتقوية العضلات للحالات التي يناسبها التحفيز العضلي غير الجراحي.",
    descriptionEn:
      "Emsculpt is used in selected non-surgical contouring and muscle-strengthening programs.",
    image: images.body,
  },
  {
    slug: "emsella-pelvic-floor-therapy-device",
    nameAr: "جهاز إمسيلّا لتقوية عضلات الحوض",
    nameEn: "Emsella Pelvic Floor Strengthening Device",
    excerptAr:
      "تقنية غير جراحية لدعم تقوية عضلات قاع الحوض ضمن خطة التجميل النسائي.",
    excerptEn:
      "Non-surgical technology supporting pelvic floor strengthening in female aesthetic care.",
    descriptionAr:
      "يدعم إمسيلّا خدمات تقوية عضلات قاع الحوض بعد تقييم طبي نسائي يحدد ملاءمة الجلسات وهدفها.",
    descriptionEn:
      "Emsella supports pelvic floor strengthening after specialist assessment of suitability and goals.",
    image: images.clinic,
  },
];

const requestedCategorySlugs = [
  "plastic-surgery",
  "facial-plastic-surgery",
  "dermatology-aesthetic-procedures",
  "non-surgical-body-contouring",
  "female-aesthetics",
];

const requestedCategoryOverrides = new Map([
  ["plastic-surgery", { nameAr: "قسم جراحات التجميل" }],
  ["facial-plastic-surgery", { nameAr: "قسم عمليات تجميل الوجه" }],
]);

const requestedPlasticSurgeons = plasticSurgeons;
const nataliTeam = ["natali-domloj"];
const noDoctorTeam = [];

const requestedServiceTree = [
  {
    slug: "rhinoplasty",
    nameAr: "عمليات تجميل الأنف",
    nameEn: "Rhinoplasty",
    categorySlug: "plastic-surgery",
    excerptAr: "تحسين شكل الأنف وتناسقه مع ملامح الوجه بخطة جراحية دقيقة.",
    excerptEn:
      "Refines nose shape and facial harmony through surgical planning.",
    image: images.face,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "breast-augmentation",
    nameAr: "تكبير وتنسيق الصدر",
    nameEn: "Breast Augmentation and Shaping",
    categorySlug: "plastic-surgery",
    excerptAr: "تحسين امتلاء وتناسق الصدر بما يناسب شكل الجسم وتوقعات الحالة.",
    excerptEn:
      "Improves breast fullness and proportions according to the case.",
    image: images.surgery,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "breast-lift-reduction",
    nameAr: "شد وتصغير الصدر",
    nameEn: "Breast Lift and Reduction",
    categorySlug: "plastic-surgery",
    excerptAr: "رفع الصدر أو تقليل حجمه لتحسين الراحة والتناسق العام.",
    excerptEn: "Lifts or reduces breast size to improve comfort and balance.",
    image: images.surgery,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "breast-implant-revision-removal",
    nameAr: "تغيير أو إزالة حشوات الصدر",
    nameEn: "Breast Implant Revision or Removal",
    categorySlug: "plastic-surgery",
    excerptAr: "تحديث أو إزالة حشوات الصدر حسب الحاجة الطبية والجمالية.",
    excerptEn:
      "Updates or removes breast implants according to medical and aesthetic needs.",
    image: images.surgery,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "male-gynecomastia-surgery",
    nameAr: "علاج التثدي عند الرجال",
    nameEn: "Male Gynecomastia Treatment",
    categorySlug: "plastic-surgery",
    excerptAr: "تحسين مظهر الصدر لدى الرجال بخطة جراحية مناسبة للحالة.",
    excerptEn:
      "Improves male chest contour through suitable surgical planning.",
    image: images.body,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "liposuction-body-contouring",
    nameAr: "شفط الدهون ونحت الجسم",
    nameEn: "Liposuction and Body Contouring",
    categorySlug: "plastic-surgery",
    excerptAr: "إزالة الدهون الموضعية وتحسين خطوط القوام جراحياً.",
    excerptEn: "Removes localized fat and improves body contours surgically.",
    image: images.body,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "tummy-tuck",
    nameAr: "شد البطن",
    nameEn: "Tummy Tuck",
    categorySlug: "plastic-surgery",
    excerptAr: "تحسين ترهلات البطن وشد الجلد والأنسجة حسب احتياج الحالة.",
    excerptEn: "Improves abdominal laxity and contour according to the case.",
    image: images.body,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "buttock-augmentation-lift-reduction",
    nameAr: "تكبير وشد وتصغير الأرداف",
    nameEn: "Buttock Augmentation, Lift, and Reduction",
    categorySlug: "plastic-surgery",
    excerptAr: "تحسين شكل وحجم الأرداف بما يحقق تناسقاً أفضل للقوام.",
    excerptEn: "Improves buttock shape, lift, or volume for better balance.",
    image: images.body,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "arm-thigh-lift",
    nameAr: "شد الذراعين والفخذين",
    nameEn: "Arm and Thigh Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "شد ترهلات الذراعين والفخذين وتحسين شكل الجلد.",
    excerptEn: "Tightens arm and thigh laxity and improves contour.",
    image: images.body,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "back-laxity-lift",
    nameAr: "شد الظهر والترهلات",
    nameEn: "Back and Laxity Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "معالجة ترهلات الظهر والجلد الزائد ضمن خطة جراحية مناسبة.",
    excerptEn: "Addresses back laxity and excess skin with surgical planning.",
    image: images.body,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "full-body-lift",
    nameAr: "شد الجسم الكامل",
    nameEn: "Full Body Lift",
    categorySlug: "plastic-surgery",
    excerptAr: "خطة شاملة لتحسين ترهلات الجسم وتناسق القوام.",
    excerptEn: "A comprehensive plan for body laxity and contour balance.",
    image: images.body,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "blepharoplasty",
    nameAr: "تجميل الجفون وشدها",
    nameEn: "Eyelid Surgery and Lift",
    categorySlug: "facial-plastic-surgery",
    excerptAr: "تحسين ترهل الجفون والانتفاخ حول العين لمظهر أكثر إشراقاً.",
    excerptEn: "Improves eyelid laxity and puffiness for a refreshed look.",
    image: images.face,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "otoplasty",
    nameAr: "تجميل الأذن",
    nameEn: "Otoplasty",
    categorySlug: "facial-plastic-surgery",
    excerptAr: "تصحيح بروز الأذن وتحسين شكلها بخطة جراحية دقيقة.",
    excerptEn: "Corrects prominent ears and improves ear shape surgically.",
    image: images.face,
    doctors: requestedPlasticSurgeons,
    deviceSlugs: [],
  },
  {
    slug: "non-surgical-face-neck-lift",
    nameAr: "شد الوجه والرقبة بدون جراحة",
    nameEn: "Non-Surgical Face and Neck Lift",
    categorySlug: "facial-plastic-surgery",
    excerptAr:
      "تحسين شد الوجه والرقبة بدون جراحة باستخدام أجهزة مناسبة للحالة.",
    excerptEn:
      "Improves face and neck firmness with selected non-surgical devices.",
    image: images.face,
    doctors: nataliTeam,
    deviceSlugs: [
      "ulthera-skin-lifting-device",
      "emface-body-contouring-device",
    ],
  },
  {
    slug: "skin-rejuvenation-tightening",
    nameAr: "تجديد البشرة وشد الجلد",
    nameEn: "Skin Rejuvenation and Tightening",
    categorySlug: "dermatology-aesthetic-procedures",
    excerptAr: "تحسين نضارة البشرة وتماسك الجلد بخطة أجهزة متدرجة.",
    excerptEn: "Improves glow and firmness through a staged device plan.",
    image: images.skin,
    doctors: nataliTeam,
    deviceSlugs: [
      "exion-skin-rejuvenation-device",
      "morpheus8-fractional-rf-device",
    ],
  },
  {
    slug: "skin-texture-scars-pores",
    nameAr: "تحسين ملمس البشرة وآثار الندبات والمسام",
    nameEn: "Skin Texture, Scars, and Pores",
    categorySlug: "dermatology-aesthetic-procedures",
    excerptAr: "تحسين ملمس البشرة وآثار الندبات والمسام باستخدام مورفيوس 8.",
    excerptEn: "Improves skin texture, scars, and pores using Morpheus8.",
    image: images.skin,
    doctors: nataliTeam,
    deviceSlugs: ["morpheus8-fractional-rf-device"],
  },
  {
    slug: "muscle-body-contouring",
    nameAr: "نحت القوام وتقوية العضلات",
    nameEn: "Body Contouring and Muscle Strengthening",
    categorySlug: "non-surgical-body-contouring",
    excerptAr: "دعم نحت القوام وتقوية العضلات باستخدام إيم سكلبت.",
    excerptEn: "Supports contouring and muscle strengthening using Emsculpt.",
    image: images.body,
    doctors: noDoctorTeam,
    deviceSlugs: ["emsculpt-body-contouring-device"],
  },
  {
    slug: "muscle-toning-body-harmony",
    nameAr: "شد العضلات وتحسين تناسق القوام",
    nameEn: "Muscle Toning and Body Harmony",
    categorySlug: "non-surgical-body-contouring",
    excerptAr: "تحسين شد العضلات وتناسق القوام باستخدام إمفيس وإيم سكلبت.",
    excerptEn:
      "Improves muscle tone and body harmony using EMFACE and Emsculpt.",
    image: images.body,
    doctors: noDoctorTeam,
    deviceSlugs: [
      "emface-body-contouring-device",
      "emsculpt-body-contouring-device",
    ],
  },
  {
    slug: "pelvic-floor-strengthening",
    nameAr: "تقوية عضلات قاع الحوض",
    nameEn: "Pelvic Floor Strengthening",
    categorySlug: "female-aesthetics",
    excerptAr: "تقوية عضلات قاع الحوض ضمن خدمات التجميل النسائي المتخصصة.",
    excerptEn:
      "Pelvic floor strengthening within specialist female aesthetic care.",
    image: images.clinic,
    doctors: femaleTeam,
    deviceSlugs: ["emsella-pelvic-floor-therapy-device"],
  },
];

const requestedServiceSlugs = new Set(
  requestedServiceTree.map((service) => service.slug),
);

const legacyServiceSlugsToArchive = Array.from(
  new Set([
    ...services.map((service) => service.slug),
    "eyelid-lift-eye-rejuvenation",
    "body-contouring-buttock-augmentation",
    "breast-augmentation-reshaping",
    "rhinoplasty-nose-reshaping",
  ]),
).filter((slug) => !requestedServiceSlugs.has(slug));

function descriptionForService(service) {
  return `${service.excerptAr} يبدأ المسار باستشارة طبية لتقييم الحالة، شرح الخيارات المناسبة، وتحديد الخطة الآمنة التي تحقق نتيجة طبيعية ومتناسقة داخل Rejuvera Medical Center.`;
}

function descriptionEnForService(service) {
  return `${service.excerptEn} The journey starts with a medical consultation to assess the case, explain suitable options, and define a safe plan at Rejuvera Medical Center.`;
}

async function upsertCategories() {
  const requestedCategories = categories.filter((category) =>
    requestedCategorySlugs.includes(category.slug),
  );

  for (const [index, category] of requestedCategories.entries()) {
    const override = requestedCategoryOverrides.get(category.slug) ?? {};
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        nameAr: override.nameAr ?? category.nameAr,
        nameEn: category.nameEn,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        status: ContentStatus.PUBLISHED,
        sortOrder: index + 1,
      },
      create: {
        slug: category.slug,
        nameAr: override.nameAr ?? category.nameAr,
        nameEn: category.nameEn,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        status: ContentStatus.PUBLISHED,
        sortOrder: index + 1,
      },
    });
  }

  await prisma.serviceCategory.updateMany({
    where: {
      slug: {
        in: categories
          .map((category) => category.slug)
          .filter((slug) => !requestedCategorySlugs.includes(slug)),
      },
    },
    data: { status: ContentStatus.ARCHIVED },
  });
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

async function upsertDevices() {
  for (const [index, device] of deviceCatalog.entries()) {
    const existing = await prisma.device.findUnique({
      where: { slug: device.slug },
      select: { id: true, gallery: true },
    });
    const data = {
      nameAr: device.nameAr,
      nameEn: device.nameEn,
      excerptAr: device.excerptAr,
      excerptEn: device.excerptEn,
      descriptionAr: device.descriptionAr,
      descriptionEn: device.descriptionEn,
      gallery: existing?.gallery ?? [device.image],
      certifications: ["تقنية معتمدة", "مرتبطة بالخدمات المحددة"],
      status: ContentStatus.PUBLISHED,
      isFeatured: index < 4,
      sortOrder: index + 1,
    };

    await prisma.device.upsert({
      where: { slug: device.slug },
      update: data,
      create: {
        slug: device.slug,
        ...data,
      },
    });
  }
}

async function upsertServices() {
  for (const [index, service] of requestedServiceTree.entries()) {
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
    const devicesToConnect = await prisma.device.findMany({
      where: { slug: { in: service.deviceSlugs } },
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
          set: doctorsToConnect.map((doctor) => ({ slug: doctor.slug })),
        },
        devices: {
          set: devicesToConnect.map((device) => ({ slug: device.slug })),
        },
      },
      create: {
        slug: service.slug,
        ...common,
        doctors: {
          connect: doctorsToConnect.map((doctor) => ({ slug: doctor.slug })),
        },
        devices: {
          connect: devicesToConnect.map((device) => ({ slug: device.slug })),
        },
      },
    });
  }

  await prisma.service.updateMany({
    where: { slug: { in: legacyServiceSlugsToArchive } },
    data: { status: ContentStatus.ARCHIVED, isFeatured: false },
  });
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

  if (process.env.SEED_CORE_FORCE === "1") {
    console.log(
      `[seed-core-content] SEED_CORE_FORCE=1 — reconciling ${CORE_SEED_VERSION}.`,
    );
  } else {
    const currentSeed = await prisma.siteSetting.findUnique({
      where: { key: "system.coreContentSeedVersion" },
      select: { value: true },
    });
    if (currentSeed?.value === CORE_SEED_VERSION) {
      const [
        existingCategories,
        existingServices,
        existingDoctors,
        existingDevices,
      ] = await Promise.all([
        prisma.serviceCategory.count({
          where: { slug: { in: requestedCategorySlugs } },
        }),
        prisma.service.count({
          where: {
            slug: {
              in: requestedServiceTree.map((service) => service.slug),
            },
          },
        }),
        prisma.doctor.count({
          where: { slug: { in: doctors.map((doctor) => doctor.slug) } },
        }),
        prisma.device.count({
          where: { slug: { in: deviceCatalog.map((device) => device.slug) } },
        }),
      ]);
      if (
        existingCategories === requestedCategorySlugs.length &&
        existingServices === requestedServiceTree.length &&
        existingDoctors === doctors.length &&
        existingDevices === deviceCatalog.length
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
  }

  await upsertCategories();
  await upsertDoctors();
  await upsertDevices();
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
    `[seed-core-content] Seeded ${requestedCategorySlugs.length} categories, ${requestedServiceTree.length} services, ${deviceCatalog.length} devices, and ${doctors.length} doctors.`,
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
