import type { CustomPageRecord } from "@/lib/content-repository";
import { getSiteUrl } from "@/lib/seo";

type SeoOverride = {
  title: string;
  description: string;
};

const SEO_OVERRIDES: Record<string, SeoOverride> = {
  "body-contouring-riyadh": {
    title: "نحت الجسم وشفط الدهون في الرياض | ريجوفيرا",
    description:
      "تعرف على خيارات نحت الجسم وشفط الدهون في الرياض، وخطوات التقييم الطبي لاختيار الخطة المناسبة في مركز ريجوفيرا.",
  },
  "body-pro": {
    title: "دليل مناطق الجسم وخيارات التجميل | ريجوفيرا",
    description:
      "استكشف خيارات العناية والتجميل حسب منطقة الجسم، وتعرّف على الخطوة المناسبة لبدء تقييم طبي في مركز ريجوفيرا بالرياض.",
  },
  "breast-surgery-riyadh": {
    title: "جراحات الصدر التجميلية في الرياض | ريجوفيرا",
    description:
      "تعرف على خيارات تكبير وشد وتصغير الصدر في الرياض، وما تتضمنه الاستشارة والتقييم الطبي قبل اختيار الإجراء المناسب.",
  },
  "derma-offers": {
    title: "عروض الجلدية والتجميل في الرياض | ريجوفيرا",
    description:
      "اطلع على عروض الجلدية والعناية بالبشرة المتاحة في ريجوفيرا بالرياض، وسجّل طلبك ليؤكد الفريق التفاصيل ومدى ملاءمة الخدمة.",
  },
  "dr-eman-alzahrani": {
    title: "د. إيمان الزهراني | صحة المرأة وقاع الحوض بالرياض",
    description:
      "تعرفي على خدمات د. إيمان الزهراني في صحة المرأة والمسالك البولية النسائية وترميم قاع الحوض، واحجزي تقييمك في ريجوفيرا.",
  },
  "dr-karima-jamjoom": {
    title: "د. كريمة جمجوم | النساء والولادة في ريجوفيرا",
    description:
      "تعرفي على خدمات د. كريمة جمجوم في النساء والولادة وصحة المرأة، وابدئي بحجز تقييم طبي في مركز ريجوفيرا بالرياض.",
  },
  "dr-maher-alahdab": {
    title: "د. ماهر الأحدب | جراحة التجميل في ريجوفيرا",
    description:
      "تعرف على خبرات وخدمات د. ماهر الأحدب في جراحة التجميل، واحجز استشارتك لتقييم الحالة ومناقشة الخيارات المناسبة.",
  },
  "eid-offers": {
    title: "عروض ريجوفيرا التجميلية في الرياض | احجزي الآن",
    description:
      "اختاري من عروض ريجوفيرا للعناية بالبشرة والتجميل في الرياض، وأرسلي طلبك ليؤكد الفريق تفاصيل العرض وموعد الحجز.",
  },
  "exclusive-offers": {
    title: "عروض ريجوفيرا الحصرية في الرياض | سجلي اهتمامك",
    description:
      "سجلي اهتمامك بأحدث عروض ريجوفيرا في الرياض، وسيؤكد الفريق تفاصيل العرض والخدمة المناسبة قبل تثبيت الموعد.",
  },
  "facelift-riyadh": {
    title: "شد الوجه والرقبة في الرياض | ريجوفيرا",
    description:
      "تعرف على خيارات شد الوجه والرقبة في الرياض، ومراحل التقييم والاستشارة لاختيار الخطة المناسبة في مركز ريجوفيرا.",
  },
  "lipedema-riyadh": {
    title: "علاج الوذمة الشحمية في الرياض | ريجوفيرا",
    description:
      "تعرفي على تقييم الوذمة الشحمية وخيارات التعامل معها في الرياض، وابدئي باستشارة لتحديد الخطة المناسبة لحالتك.",
  },
  "lp-face-neck-lift": {
    title: "شد الوجه والرقبة في الرياض | احجز استشارتك",
    description:
      "تعرف على شد الوجه والرقبة، الحالات المناسبة وخطوات الحجز والمتابعة، وابدأ بتقييم طبي في ريجوفيرا بالرياض.",
  },
  "najwa-batarfi": {
    title: "د. نجوى بترفي | النساء والولادة في ريجوفيرا",
    description:
      "تعرفي على خدمات د. نجوى بترفي في النساء والولادة وصحة المرأة، واحجزي موعد تقييم في مركز ريجوفيرا بالرياض.",
  },
  "plastic-surgery-riyadh": {
    title: "جراحة التجميل في الرياض | مركز ريجوفيرا",
    description:
      "تعرف على خدمات جراحة التجميل في الرياض وخطوات التقييم قبل الإجراء، واحجز استشارتك في مركز ريجوفيرا.",
  },
  "prof-bandar-alharthi": {
    title: "بروف. بندر الحارثي | جراحة الثدي والغدد بالرياض",
    description:
      "تعرف على خدمات بروف. بندر الحارثي في جراحة الثدي والغدد، واحجز موعد تقييم في مركز ريجوفيرا بالرياض.",
  },
  "rejuvera-booking": {
    title: "حجز موعد في مركز ريجوفيرا بالرياض | تواصل الآن",
    description:
      "احجز استشارتك في مركز ريجوفيرا بالرياض، وأرسل بيانات التواصل ليؤكد الفريق الموعد ويوجهك إلى الخدمة المناسبة.",
  },
  "rejuvera-social-media": {
    title: "روابط وحجز مركز ريجوفيرا الطبي | الرياض",
    description:
      "تواصل مع مركز ريجوفيرا عبر الروابط الرسمية، أو أرسل طلب حجز ليؤكد الفريق الموعد والخدمة المناسبة في الرياض.",
  },
  "tiktok-customer": {
    title: "حجز استشارة تجميل في ريجوفيرا | الرياض",
    description:
      "احجز استشارة في مركز ريجوفيرا بالرياض، وتعرف على الفريق الطبي وخطوات التقييم قبل اختيار الخدمة المناسبة.",
  },
};

const DOCTOR_NAMES: Record<string, string> = {
  "dr-eman-alzahrani": "الدكتورة إيمان الزهراني",
  "dr-karima-jamjoom": "الدكتورة كريمة جمجوم",
  "dr-maher-alahdab": "الدكتور ماهر الأحدب",
  "najwa-batarfi": "الدكتورة نجوى بترفي",
  "prof-bandar-alharthi": "البروفيسور بندر الحارثي",
};

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateAtWord(value: string, maxLength: number) {
  const normalized = compact(value);
  if (normalized.length <= maxLength) return normalized;
  const contentLimit = Math.max(1, maxLength - 1);
  const clipped = normalized.slice(0, contentLimit + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > contentLimit * 0.65 ? lastSpace : contentLimit).trim()}…`;
}

function normalizeTitle(value: string) {
  const title = compact(value)
    .replace(/(?:\s*\|\s*Rejuvera Center){2,}$/i, " | Rejuvera Center")
    .replace(/(?:\s*\|\s*مركز ريجوفيرا الطبي){2,}$/i, " | مركز ريجوفيرا الطبي");
  return truncateAtWord(title, 60);
}

function fallbackDescription(page: CustomPageRecord) {
  const candidate = compact(
    page.metaDescription || page.seoDescription || page.titleEn || "",
  );
  if (candidate.length >= 70 && !/^Landing page\s*:/i.test(candidate)) {
    return candidate;
  }
  return `تعرف على ${page.titleAr} في مركز ريجوفيرا بالرياض، وابدأ بخطوة واضحة لحجز التقييم ومناقشة الخيارات المناسبة.`;
}

export function resolveCustomPageSeo(page: CustomPageRecord) {
  const override = SEO_OVERRIDES[page.slug];
  const rawTitle =
    override?.title || page.metaTitle || page.seoTitle || page.titleAr;
  const rawDescription = override?.description || fallbackDescription(page);

  return {
    title: normalizeTitle(rawTitle),
    description: truncateAtWord(rawDescription, 158),
  };
}

export function hasCustomPageH1(html: string) {
  return /<h1\b/i.test(html);
}

export function buildCustomPageJsonLd(input: {
  page: CustomPageRecord;
  title: string;
  description: string;
  canonicalUrl: string;
  image?: string | null | undefined;
}) {
  const siteUrl = getSiteUrl();
  const doctorName = DOCTOR_NAMES[input.page.slug];
  const pageId = `${input.canonicalUrl}#webpage`;
  const pageNode = {
    "@type": doctorName ? "ProfilePage" : "WebPage",
    "@id": pageId,
    url: input.canonicalUrl,
    name: input.title,
    headline: input.title,
    description: input.description,
    inLanguage: "ar-SA",
    isPartOf: { "@id": `${siteUrl}#website` },
    about: { "@id": `${siteUrl}#organization` },
    breadcrumb: { "@id": `${input.canonicalUrl}#breadcrumb` },
    ...(input.image ? { primaryImageOfPage: input.image } : {}),
    ...(doctorName
      ? {
          mainEntity: {
            "@type": "Physician",
            name: doctorName,
            url: input.canonicalUrl,
            worksFor: { "@id": `${siteUrl}#organization` },
          },
        }
      : {}),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      pageNode,
      {
        "@type": "BreadcrumbList",
        "@id": `${input.canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "ريجوفيرا",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: input.title,
            item: input.canonicalUrl,
          },
        ],
      },
    ],
  };
}
