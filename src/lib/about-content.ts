export const ABOUT_SECTION_DEFAULTS = {
  eyebrowAr: "قيادة وفريق ريجوفيرا",
  eyebrowEn: "Rejuvera Leadership & Teams",
  titleAr: "تعرفي على من يقود التجربة الطبية والتنظيمية داخل المركز.",
  titleEn: "Meet the people shaping the clinical and operational experience.",
  descriptionAr:
    "تجمع صفحة من نحن بين القيادة، الإدارة، الفريق الطبي، وطاقم التمريض حتى تظهر هوية المركز بشكل واضح وقابل للتحديث من لوحة التحكم.",
  descriptionEn:
    "The about page brings leadership, management, doctors, and nursing teams together in editable sections managed from the admin panel.",
} as const;

export const ABOUT_PROFILE_DEFAULTS = [
  {
    key: "ceo",
    labelAr: "الرئيس التنفيذي",
    labelEn: "Chief Executive Officer (CEO)",
    nameAr: "د. لؤي السالمي",
    nameEn: "Dr. Loai Al-Salmi",
    titleAr: "كلمة الإدارة التنفيذية",
    titleEn: "Executive message",
    descriptionAr:
      "نؤمن أن تجربة ريجوفيرا تبدأ من وضوح الخطة، احترام توقعات المراجع، وتقديم رعاية طبية منظمة في كل خطوة.",
    descriptionEn:
      "We believe the Rejuvera experience starts with a clear plan, respect for patient expectations, and organized care at every step.",
    imageUrl: "/media/curated/about-loai-al-salmi.webp",
  },
  {
    key: "gm",
    labelAr: "المدير العام",
    labelEn: "General Manager",
    nameAr: "عمرو الشيمي",
    nameEn: "Amr El-Sheimi",
    titleAr: "إدارة التشغيل وتجربة المراجعين",
    titleEn: "Operations and patient experience",
    descriptionAr:
      "نعمل على أن تكون رحلة المراجع واضحة من أول تواصل حتى المتابعة، مع تنظيم المواعيد والخدمات والردود بشكل عملي.",
    descriptionEn:
      "We organize the patient journey from first contact through follow-up, with clear scheduling, service coordination, and communication.",
    imageUrl: "/media/curated/about-amr-el-sheimi.webp",
  },
  {
    key: "medicalTeam",
    labelAr: "طاقم الدكاترة",
    labelEn: "Doctors Team",
    nameAr: "الفريق الطبي",
    nameEn: "Medical Team",
    titleAr: "أطباء متخصصون وخطط علاجية واضحة",
    titleEn: "Specialized doctors and clear treatment plans",
    descriptionAr:
      "يضم المركز نخبة من الأطباء في التجميل والجراحة والجلدية والتخصصات المرتبطة، مع ربط واضح بين الطبيب والخدمة المناسبة.",
    descriptionEn:
      "The center brings together doctors across aesthetics, surgery, dermatology, and related specialties with clear service matching.",
    imageUrl: "/media/curated/doctor-team.jpg",
  },
  {
    key: "nursingTeam",
    labelAr: "طاقم التمريض",
    labelEn: "Nursing Team",
    nameAr: "طاقم التمريض",
    nameEn: "Nursing Team",
    titleAr: "رعاية مساندة ومتابعة دقيقة",
    titleEn: "Supportive care and careful follow-up",
    descriptionAr:
      "يدعم طاقم التمريض تجربة المراجع قبل الإجراء وبعده، مع عناية بالتعليمات، الخصوصية، وراحة المراجع داخل المركز.",
    descriptionEn:
      "The nursing team supports patients before and after procedures with clear instructions, privacy, and comfort inside the center.",
    imageUrl: "/media/curated/doctor-candidate-1.jpg",
  },
] as const;

export type AboutProfileKey = (typeof ABOUT_PROFILE_DEFAULTS)[number]["key"];

const [ceoProfile, gmProfile] = ABOUT_PROFILE_DEFAULTS;
const legacyLeadershipImageBase =
  "https://pub-b17e8d423eac407cac34ee7a7904132f.r2.dev/media/uploads/";

// Replace only the known legacy values so later admin edits remain authoritative.
export const ABOUT_LEGACY_LEADERSHIP_FIELDS = new Map<
  string,
  readonly [string, string]
>([
  ["ceoNameAr", ["CEO", ceoProfile.nameAr]],
  ["ceoNameEn", ["CEO Team", ceoProfile.nameEn]],
  [
    "ceoImageUrl",
    [
      `${legacyLeadershipImageBase}53756a2e87ccd4fd-image-1780250306140.webp`,
      ceoProfile.imageUrl,
    ],
  ],
  ["gmNameAr", ["General Manager", gmProfile.nameAr]],
  ["gmNameEn", ["General Manager", gmProfile.nameEn]],
  [
    "gmImageUrl",
    [
      `${legacyLeadershipImageBase}497704242f30e6fd-image-1780250049248.webp`,
      gmProfile.imageUrl,
    ],
  ],
]);
