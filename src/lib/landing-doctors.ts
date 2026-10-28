/** Doctor facts shown on the focused landing pages.
 * Keep this list to claims with a public source (named per entry) so the doctor
 * can document every line; remove an entry rather than soften it if unconfirmed. */
export type LandingCredential = { title: string; detail: string };

const loaiCredentials: readonly LandingCredential[] = [
  {
    // dralsalmi.com: «حاصل على البورد الكندي والزمالة الأمريكية في جراحة التجميل»
    title: "البورد الكندي والزمالة الأمريكية",
    detail: "في جراحة التجميل",
  },
  {
    // Penn Medicine, Microvascular Reconstructive Surgery fellows page (listed 2012).
    title: "زمالة الجراحة الترميمية المجهرية",
    detail: "جامعة بنسلفانيا، الولايات المتحدة",
  },
  {
    // UT Southwestern Hand Surgery Fellowship alumni table (2011, listed at KFMC Riyadh).
    title: "زمالة جراحة اليد",
    detail: "مركز جامعة تكساس ساوث وسترن الطبي (UT Southwestern)، دالاس",
  },
  {
    // UT Southwestern alumni listing (King Fahad Medical City, Riyadh); the
    // clinic's doctor page lists him as consultant at Rejuvera today.
    title: "خبرة في مدينة الملك فهد الطبية",
    detail: "سبق له العمل فيها بالرياض، ويستقبل مرضاه اليوم في ريجوفيرا",
  },
  {
    // Ajel newspaper, 20 Feb 2020: seminar «عمليات التجميل الخارجية تحت المجهر».
    title: "حضور علمي",
    detail: "متحدث في ملتقى الطب التجميلي الرابع (2020)",
  },
];

export const LOAI_ALSALMI = {
  name: "د. لؤي السالمي",
  title: "استشاري جراحة التجميل والترميم",
  // Portrait supplied by the clinic (2026-10-28); the jacket carries his own name.
  // /media/doctors/loai-alsalmi.webp stays for the rest of the site.
  photo: "/media/doctors/loai-alsalmi-portrait.webp",
  profile: "/doctors/loai-alsalmi",
  // Mirrors the clinic's own doctor record (yearsExperience: 25). It fits total
  // medical experience since graduation (~2001-2002) but not specialist practice,
  // which public records date from ~2010 (a third-party profile says "15+ years").
  // Keep the wording generic ("خبرة") and confirm the figure with the doctor.
  experience: "25+ سنة خبرة",
  languages: "العربية والإنجليزية",
  credentials: loaiCredentials,
};

// Colleagues shown on the booking page: names, titles and focus exactly as the
// clinic publishes them on their own landing pages; no further claims added.
export const MAHER_ALAHDAB = {
  name: "د. ماهر الأحدب",
  title: "استشاري جراحة التجميل والترميم",
  photo: "/media/doctors/maher-alahdab.webp",
  profile: "/doctors/maher-alahdab",
  page: "/p/dr-maher-alahdab",
  focus: "تجميل وتنسيق الأنف",
};

export const NATALI_DOMLOJ = {
  name: "د. ناتالي دوملوج",
  title: "استشارية الجلدية والتجميل",
  photo: "/media/doctors/natali-domloj.webp",
  profile: "/doctors/natali-domloj",
  page: "/p/dr-natali-domloj",
  focus: "نضارة البشرة والهيدرافيشيال والفراكشنال ليزر",
};

export const NAJWA_BATARFI = {
  name: "د. نجوى باطرفي",
  title: "استشارية التجميل النسائي",
  photo: "/media/doctors/najwa-batarfi.webp",
  profile: "/doctors/najwa-batarfi",
  page: "/p/najwa-batarfi",
  focus: "رعاية متخصصة في التجميل النسائي بتقييم واضح ومباشر",
};

export const SAHAM_ARFAJ = {
  name: "د. سهام العرفج",
  title: "استشارية جراحة التجميل والترميم",
  photo: "/media/doctors/saham-arfaj.webp",
  profile: "/doctors/saham-arfaj",
  // Text and figure as published on the CMS body-contouring page.
  experience: "15+ سنة خبرة",
  summary:
    "تخطيط متكامل للجراحات التجميلية مع اهتمام بالخصوصية والتناسق والمتابعة بعد الإجراء.",
};
