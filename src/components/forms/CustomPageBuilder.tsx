"use client";

import { useMemo, useState } from "react";

import { ImagePicker } from "@/components/admin/ImagePicker";
import {
  GENERAL_INQUIRY_SERVICE_AR,
  GENERAL_INQUIRY_SERVICE_VALUE,
  isGeneralInquiryService,
} from "@/lib/general-inquiry";
import {
  SAUDI_MOBILE_INPUT_PATTERN,
  SAUDI_MOBILE_INPUT_TITLE,
} from "@/lib/saudi-phone";

type BlockKind =
  | "hero"
  | "campaignHero"
  | "text"
  | "image"
  | "stats"
  | "services"
  | "doctors"
  | "devices"
  | "gallery"
  | "beforeAfter"
  | "trustBar"
  | "comparison"
  | "pricing"
  | "offerGrid"
  | "faq"
  | "steps"
  | "offer"
  | "mediaMosaic"
  | "seoArticle"
  | "testimonial"
  | "video"
  | "leadForm"
  | "contact"
  | "cta";

type Tone = "light" | "soft" | "dark";
type Align = "right" | "center" | "left";
type FontSize = "sm" | "md" | "lg" | "xl";
type FormServiceMode = "hidden" | "select" | "custom" | "none";
type ImageSize = "small" | "medium" | "large" | "full";
type ImageAspect = "wide" | "square" | "portrait" | "natural";
type ImageFit = "cover" | "contain";
type SectionWidth = "contained" | "wide" | "full";
type SectionSpacing = "compact" | "normal" | "airy";
type ButtonStyle = "solid" | "outline";
type FormFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio";

type BuilderBlock = {
  id: string;
  kind: BlockKind;
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  buttonLabel?: string;
  buttonHref?: string;
  accent?: string;
  tone?: Tone;
  align?: Align;
  fontSize?: FontSize;
  titleColor?: string;
  textColor?: string;
  imageSize?: ImageSize;
  imageAspect?: ImageAspect;
  imageFit?: ImageFit;
  sectionWidth?: SectionWidth;
  spacing?: SectionSpacing;
  buttonStyle?: ButtonStyle;
  serviceSlug?: string;
  serviceName?: string;
  formServiceMode?: FormServiceMode;
  formServiceOptions?: string;
  formEmailMode?: "hidden" | "optional" | "required";
  formShowMessage?: boolean;
  formFields?: string;
  formActionUrl?: string;
  webhookToken?: string;
};

type WebhookOption = {
  token: string;
  name: string;
  isActive: boolean;
};

type ServiceOption = {
  slug: string;
  name: string;
  nameEn?: string | null;
  category?: string | null;
};

type BlockLibraryItem = {
  kind: BlockKind;
  label: string;
  hint: string;
};

type BlockLibraryGroup = {
  label: string;
  hint: string;
  kinds: BlockKind[];
};

type TemplateBlockSpec =
  | BlockKind
  | {
      kind: BlockKind;
      patch?: Partial<Omit<BuilderBlock, "id" | "kind">>;
    };

type PageTemplate = {
  id: string;
  label: string;
  hint: string;
  badge: string;
  blocks: TemplateBlockSpec[];
};

type SectionPattern = {
  id: string;
  label: string;
  hint: string;
  blocks: TemplateBlockSpec[];
};

const blockLibrary: BlockLibraryItem[] = [
  { kind: "hero", label: "Hero", hint: "واجهة أولى مع صورة وزر" },
  { kind: "campaignHero", label: "Hero + Form", hint: "واجهة حملة بفورم فوري" },
  { kind: "text", label: "Text", hint: "محتوى طبي منظم" },
  { kind: "image", label: "Image", hint: "صورة أو حالة بصرية" },
  { kind: "stats", label: "Stats", hint: "أرقام ومؤشرات" },
  { kind: "services", label: "Services", hint: "كروت خدمات" },
  { kind: "doctors", label: "Doctors", hint: "أطباء أو فريق طبي" },
  { kind: "devices", label: "Devices", hint: "أجهزة مرتبطة بالخدمة" },
  { kind: "gallery", label: "Gallery", hint: "صور متعددة" },
  { kind: "beforeAfter", label: "Before/After", hint: "حالات قبل وبعد" },
  { kind: "trustBar", label: "Trust Bar", hint: "اعتمادات ومؤشرات ثقة" },
  { kind: "comparison", label: "Comparison", hint: "مقارنة خيارات أو باقات" },
  { kind: "pricing", label: "Packages", hint: "باقات حملة أو عروض" },
  { kind: "offerGrid", label: "Offer Grid", hint: "كروت عروض بأسعار ومزايا" },
  { kind: "faq", label: "FAQ", hint: "أسئلة شائعة" },
  { kind: "steps", label: "Steps", hint: "مسار زيارة أو علاج" },
  { kind: "offer", label: "Offer", hint: "عرض أو باقة للحملة" },
  {
    kind: "mediaMosaic",
    label: "Media Mosaic",
    hint: "صور كبيرة وصغيرة بتنسيق فاخر",
  },
  { kind: "seoArticle", label: "SEO Article", hint: "مقال/نص طويل منسق للسيو" },
  { kind: "testimonial", label: "Review", hint: "اقتباس وتجربة عميل" },
  { kind: "video", label: "Video", hint: "فيديو أو صورة معاينة" },
  { kind: "leadForm", label: "نموذج طلب", hint: "اسم ورقم جوال للمتابعة" },
  { kind: "contact", label: "Contact", hint: "بيانات تواصل" },
  { kind: "cta", label: "CTA", hint: "دعوة للحجز" },
];

const blockLibraryByKind = new Map(
  blockLibrary.map((item) => [item.kind, item] as const),
);

const blockGroups: BlockLibraryGroup[] = [
  {
    label: "حملات وتحويل",
    hint: "Hero، عروض، فورم، ودعوة للحجز",
    kinds: ["campaignHero", "offerGrid", "pricing", "offer", "leadForm", "cta"],
  },
  {
    label: "محتوى وثقة",
    hint: "نصوص، خطوات، أسئلة، مؤشرات وثقة",
    kinds: [
      "text",
      "stats",
      "steps",
      "trustBar",
      "comparison",
      "faq",
      "seoArticle",
    ],
  },
  {
    label: "ميديا ونتائج",
    hint: "صور، معرض، قبل/بعد، فيديو",
    kinds: ["image", "gallery", "mediaMosaic", "beforeAfter", "video"],
  },
  {
    label: "طبي وتنظيم",
    hint: "خدمات، أطباء، أجهزة، تواصل",
    kinds: ["hero", "services", "doctors", "devices", "testimonial", "contact"],
  },
];

const presets: Record<BlockKind, Omit<BuilderBlock, "id" | "kind">> = {
  hero: {
    title: "خطة علاجية مصممة بعناية",
    subtitle: "ريجوفيرا",
    body: "صفحة مخصصة تعرض الخدمة أو العرض الطبي بلغة واضحة وتصميم متوازن يساعد الزائر على اتخاذ القرار.",
    imageUrl: "/media/curated/clinic-treatment-room.jpeg",
    buttonLabel: "احجزي موعدك",
    buttonHref: "/contact",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
  },
  campaignHero: {
    title: "اختاري عرضك الآن وسيتم التواصل معك خلال دقائق",
    subtitle: "عروض ريجوفيرا",
    body: "ابدئي بطلب تواصل بسيط، وسيقوم فريق ريجوفيرا بتأكيد التفاصيل وتوجيهك للخيار الأنسب لحالتك.\nاختاري العرض أو الخدمة المناسبة لك واتركي بياناتك ليتم التواصل معك.",
    imageUrl: "/media/curated/clinic-treatment-room.jpeg",
    buttonLabel: "إرسال طلب",
    buttonHref: "#lead-form",
    accent: "#4a2476",
    tone: "dark",
    align: "right",
    fontSize: "lg",
    formServiceMode: "hidden",
    formEmailMode: "hidden",
    formShowMessage: false,
    formServiceOptions: `${GENERAL_INQUIRY_SERVICE_AR}|${GENERAL_INQUIRY_SERVICE_VALUE}`,
  },
  text: {
    title: "لماذا هذه الصفحة؟",
    body: "اكتبي هنا شرحًا واضحًا للميزة أو الخدمة. اجعلي الفقرة قصيرة ومباشرة ومرتبطة بما يحتاجه الزائر قبل التواصل.",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  image: {
    title: "صورة داعمة",
    body: "وصف قصير للصورة أو الحالة.",
    imageUrl: "/media/curated/service-skin-rejuvenation.webp",
    accent: "#4a2476",
    tone: "light",
    align: "center",
    imageSize: "large",
    imageAspect: "wide",
    imageFit: "cover",
  },
  stats: {
    title: "مؤشرات الثقة",
    body: "سنوات خبرة|12+\nأطباء متخصصون|10\nخدمات متقدمة|24\nمتابعة منظمة|100%",
    accent: "#4a2476",
    tone: "light",
    align: "center",
  },
  services: {
    title: "خدمات مرتبطة",
    body: "تجديد البشرة المتقدم|خطة متدرجة لتحسين نضارة البشرة\nإزالة الشعر بالليزر|جلسات منظمة حسب نوع البشرة\nتناغم الوجه بالحقن|تحسين محسوب يحافظ على الملامح",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  doctors: {
    title: "فريق طبي مناسب للخطة",
    body: "د. لؤي السالمي|استشاري جراحة التجميل والترميم\nد. ناتالي دوملوج|استشارية الجلدية والتجميل\nد. سهام العرفج|استشارية جراحة التجميل والترميم",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
  },
  devices: {
    title: "الأجهزة المستخدمة",
    body: "اسم الجهاز|وصف مختصر للجهاز ودوره في الخطة العلاجية",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  gallery: {
    title: "لمحة بصرية",
    body: "/media/reference/legacy/18.png|نتيجة علاجية\n/media/reference/legacy/56549.webp|تنسيق القوام\n/media/curated/service-laser-hair-removal.jpg|جلسات الليزر",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  beforeAfter: {
    title: "قبل وبعد",
    body: "الحالة الأولى|||أضيفي صور قبل وبعد الحقيقية من محرر الصفحة قبل إطلاق الإعلان",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
  },
  trustBar: {
    title: "لماذا يثق العملاء في ريجوفيرا؟",
    body: "تقييم طبي واضح|شرح الخيارات المناسبة قبل الحجز\nفريق متخصص|أطباء وخبرات متعددة داخل المركز\nمتابعة منظمة|تواصل واضح بعد إرسال الطلب\nخصوصية وراحة|تجربة هادئة وسرية",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  comparison: {
    title: "اختاري الخطة الأنسب",
    body: "الهدف|استشارة سريعة|خطة متكاملة\nالمناسب لـ|سؤال محدد أو بداية قرار|حالة تحتاج تقييم وربط خدمة وطبيب\nالمتابعة|تواصل أولي|متابعة منظمة مع الفريق\nالنتيجة|توجيه مبدئي|مسار أوضح قبل الحجز",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
  },
  pricing: {
    title: "باقات الحملة",
    subtitle: "قابلة للتعديل حسب العرض",
    body: "استشارة أولية|تقييم مناسب للحالة|ابدئي الآن\nخطة علاجية|ربط الخدمة بالطبيب والمتابعة|الأكثر طلبًا\nمتابعة خاصة|تنسيق أولويات ومواعيد|تواصلي معنا",
    buttonLabel: "طلب تفاصيل الباقة",
    buttonHref: "#lead-form",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  offerGrid: {
    title: "اختاري العرض المناسب لك",
    subtitle: "عروض قابلة للتعديل",
    body: "700|فوتونا|فوتونا للبشرة الصافية|نضارة للبشرة والتصبغات وآثار الشباب|تفتيح المسام,تحسين اللون,جلسة سريعة\n1500|مورفيوس|جلسة مورفيوس|لتحسين المسام وآثار حب الشباب|تحسين المسام,ملمس البشرة,تحفيز الكولاجين\n2000|باقة متكاملة|فوتونا + تنظيف طبي + ماسك الذهب|باقة عناية للبشرة المناسبة قبل المناسبات|تنظيف عميق,نضارة فورية,شد لطيف للبشرة\n3000|إمسكالبّت|إمسكالبّت نيو للبطن|نحت وتقوية عضلات بدون جراحة|تقوية العضلات,شد الترهلات,جلسة مريحة",
    buttonLabel: "اختيار العرض",
    buttonHref: "#lead-form",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  faq: {
    title: "أسئلة شائعة",
    body: "هل أحتاج إلى استشارة قبل الإجراء؟|نعم، التقييم يساعد على اختيار الخطة الأنسب.\nمتى تظهر النتيجة؟|يختلف ذلك حسب الإجراء وطبيعة الحالة.\nماذا يحدث بعد إرسال الطلب؟|يتواصل معك فريق ريجوفيرا لتأكيد البيانات وتوضيح الخطوة التالية.",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  steps: {
    title: "مسار الزيارة",
    body: "تقييم الحالة|نراجع الاحتياج والتوقعات قبل اختيار الخطة\nاختيار الإجراء|نقارن الخيارات المناسبة للحالة بوضوح\nالمتابعة|نوضح التعليمات والمتابعة بعد الزيارة",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  offer: {
    title: "عرض الحملة",
    subtitle: "مناسب لفترة محدودة",
    body: "استشارة أولية|تقييم طبي وخطة مناسبة\nجلسة متابعة|مراجعة التعليمات والنتيجة\nأولوية حجز|تنسيق موعد مناسب مع الفريق",
    buttonLabel: "احجزي العرض",
    buttonHref: "#lead-form",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
  },
  mediaMosaic: {
    title: "صور من مركز ريجوفيرا الطبي",
    subtitle: "بيئة طبية هادئة ومنظمة",
    body: "/media/curated/clinic-treatment-room.jpeg|غرف علاج مجهزة|خصوصية وراحة أثناء الزيارة\n/media/curated/clinic-reception.jpeg|استقبال وتنظيم|رحلة واضحة من أول تواصل\n/media/curated/service-skin-rejuvenation.webp|تقنيات حديثة|أجهزة وخطط علاجية متكاملة",
    imageUrl: "/media/curated/clinic-treatment-room.jpeg",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
    imageFit: "cover",
  },
  seoArticle: {
    title: "معلومات مهمة قبل الحجز",
    subtitle: "محتوى قابل للتعديل للسيو والحملات",
    body: "في ريجوفيرا يبدأ القرار بتقييم واضح للحالة وفهم التوقعات قبل اختيار الإجراء المناسب. نركز على شرح الخيارات المتاحة، حدود كل إجراء، وما يناسب المظهر الطبيعي والمتوازن.\nبعد إرسال الطلب، يتواصل فريق ريجوفيرا لتأكيد البيانات وترتيب الخطوة التالية حسب الخدمة المطلوبة. الهدف هو تجربة هادئة، واضحة، ومناسبة لاحتياج كل حالة.\nيمكنك الاعتماد على هذه الصفحة لمعرفة أهم المعلومات قبل الحجز، مع تجنب الوعود المبالغ فيها والتركيز على خطة واقعية وآمنة.",
    buttonLabel: "طلب استشارة",
    buttonHref: "#lead-form",
    accent: "#4a2476",
    tone: "light",
    align: "right",
  },
  testimonial: {
    title: "تجربة مراجعة",
    subtitle: "نورة",
    body: "الشرح كان واضحًا قبل البدء، والفريق وضح لي الخيارات المناسبة دون استعجال.",
    accent: "#4a2476",
    tone: "light",
    align: "center",
  },
  video: {
    title: "فيديو تعريفي",
    body: "استخدمي رابط صورة معاينة أو ارفعي صورة مؤقتة حتى إضافة الفيديو النهائي.",
    imageUrl: "/media/curated/clinic-treatment-room.jpeg",
    buttonLabel: "مشاهدة التفاصيل",
    buttonHref: "/contact",
    accent: "#4a2476",
    tone: "dark",
    align: "center",
  },
  leadForm: {
    title: "احجزي استشارتك",
    subtitle: "طلب تواصل",
    body: "اكتبي اسمك ورقم جوالك فقط، وسيتم التواصل معك لتأكيد التفاصيل.",
    buttonLabel: "إرسال الطلب",
    buttonHref: "/api/leads",
    accent: "#4a2476",
    tone: "soft",
    align: "right",
    formServiceMode: "hidden",
    formEmailMode: "hidden",
    formShowMessage: false,
  },
  contact: {
    title: "ابدئي بخطوة واضحة",
    body: "الهاتف|0114999959\nواتساب|9200 17403\nالبريد|info@rejuvera.sa",
    buttonLabel: "افتحي صفحة التواصل",
    buttonHref: "/contact",
    accent: "#4a2476",
    tone: "dark",
    align: "center",
  },
  cta: {
    title: "اعرفي الخيار الأنسب لحالتك",
    body: "تواصلي مع الفريق لترتيب استشارة واضحة ومناسبة.",
    buttonLabel: "التواصل والحجز",
    buttonHref: "/contact",
    accent: "#4a2476",
    tone: "soft",
    align: "center",
  },
};

const templates: PageTemplate[] = [
  {
    id: "conversion-campaign",
    label: "صفحة حملة احترافية",
    hint: "فورم في البداية، خدمات، ثقة، نتائج، أطباء وأسئلة شائعة.",
    badge: "الأكثر اكتمالًا",
    blocks: [
      {
        kind: "campaignHero",
        patch: {
          title: "ابدئي بخطوة بسيطة نحو الخطة المناسبة لك",
          subtitle: "استشارة ريجوفيرا",
          body: "اكتبي اسمك ورقم جوالك، وسيتواصل معك الفريق لتأكيد التفاصيل وفهم احتياجك.",
          sectionWidth: "full",
          spacing: "airy",
        },
      },
      "services",
      "offerGrid",
      "mediaMosaic",
      "trustBar",
      "beforeAfter",
      "doctors",
      "steps",
      "faq",
      "seoArticle",
      "cta",
    ],
  },
  {
    id: "seasonal-offers",
    label: "عروض موسمية",
    hint: "Hero بفورم، شبكة عروض، صور، مزايا وأسئلة قبل إرسال الطلب.",
    badge: "للإعلانات",
    blocks: [
      {
        kind: "campaignHero",
        patch: {
          title: "اختاري عرضك وسيتم التواصل معك لتأكيد التفاصيل",
          subtitle: "عروض ريجوفيرا",
          sectionWidth: "full",
          spacing: "airy",
        },
      },
      "offerGrid",
      "mediaMosaic",
      "trustBar",
      "faq",
      "seoArticle",
      "cta",
    ],
  },
  {
    id: "medical-service",
    label: "صفحة خدمة",
    hint: "تعريف الخدمة مع فورم مبكر، خطوات، نتائج، أطباء وأجهزة.",
    badge: "طبية",
    blocks: [
      "hero",
      {
        kind: "leadForm",
        patch: { sectionWidth: "contained", tone: "soft" },
      },
      "stats",
      "steps",
      "services",
      "doctors",
      "devices",
      "beforeAfter",
      "trustBar",
      "comparison",
      "faq",
      "cta",
    ],
  },
  {
    id: "fast-lead",
    label: "صفحة طلب سريعة",
    hint: "صفحة خفيفة للحملات المباشرة مع أقل عدد من الخطوات.",
    badge: "سريعة",
    blocks: [
      {
        kind: "campaignHero",
        patch: {
          title: "ارسلي طلبك الآن وسيقوم الفريق بالتواصل معك",
          body: "الاسم ورقم الجوال فقط للمتابعة وتأكيد الخدمة المناسبة.",
          sectionWidth: "full",
        },
      },
      "trustBar",
      "steps",
      "faq",
      "cta",
    ],
  },
  {
    id: "visual-results",
    label: "حملة نتائج وصور",
    hint: "مناسبة للحملات التي تعتمد على الصور وحالات قبل وبعد.",
    badge: "بصرية",
    blocks: [
      "hero",
      "beforeAfter",
      "mediaMosaic",
      "testimonial",
      "leadForm",
      "faq",
      "cta",
    ],
  },
  {
    id: "medical-introduction",
    label: "تعريف طبي",
    hint: "صفحة هادئة لشرح خدمة أو تقنية مع فيديو ومحتوى طويل.",
    badge: "محتوى",
    blocks: [
      "hero",
      "text",
      "video",
      "services",
      "seoArticle",
      "leadForm",
      "cta",
    ],
  },
];

const sectionPatterns: SectionPattern[] = [
  {
    id: "form-trust",
    label: "فورم + ثقة",
    hint: "طلب سريع يتبعه مؤشرات تطمئن الزائر.",
    blocks: ["leadForm", "trustBar"],
  },
  {
    id: "service-proof",
    label: "خدمة + نتائج",
    hint: "عرض المزايا ثم حالات قبل وبعد.",
    blocks: ["services", "beforeAfter"],
  },
  {
    id: "clinic-story",
    label: "صور المركز + أطباء",
    hint: "موزاييك بصري يليه الفريق الطبي.",
    blocks: ["mediaMosaic", "doctors"],
  },
  {
    id: "offer-close",
    label: "عرض + أسئلة + CTA",
    hint: "ختام متكامل للعرض قبل إرسال الطلب.",
    blocks: ["offerGrid", "faq", "cta"],
  },
];

function uid() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function trackingHiddenInputs() {
  return [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "utmContent",
  ]
    .map((name) => `<input type="hidden" name="${name}" value="">`)
    .join("");
}

function safeFieldName(value: string, fallback: string) {
  const normalized = value
    .trim()
    .replace(/[^\w\u0600-\u06ff-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function parseFieldType(value: string): FormFieldType {
  const normalized = value.trim().toLowerCase();
  if (normalized === "tel") return "phone";
  if (
    [
      "text",
      "email",
      "phone",
      "textarea",
      "select",
      "checkbox",
      "radio",
    ].includes(normalized)
  ) {
    return normalized as FormFieldType;
  }
  return "text";
}

function parseOptions(value = "") {
  return value
    .split(/[,\n؛;،]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [label = "", rawValue = ""] = item.split(":");
      const optionLabel = label.trim();
      return {
        label: optionLabel,
        value: (rawValue.trim() || optionLabel).trim(),
      };
    })
    .filter((item) => item.label);
}

function validationAttributes(value = "", disabled = "") {
  const attrs: string[] = [];
  value
    .split(/[;,،]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((rule) => {
      const [key = "", raw = ""] = rule.split(":");
      const name = key.trim().toLowerCase();
      const val = raw.trim();
      if (!val) return;
      if (["min", "minlength"].includes(name)) {
        attrs.push(` minlength="${escapeHtml(val)}"`);
      }
      if (["max", "maxlength"].includes(name)) {
        attrs.push(` maxlength="${escapeHtml(val)}"`);
      }
      if (name === "pattern") {
        attrs.push(` pattern="${escapeHtml(val)}"`);
      }
    });
  return disabled ? "" : attrs.join("");
}

function phoneInputAttributes(disabled = "") {
  return disabled
    ? ""
    : ` inputmode="tel" autocomplete="tel" minlength="10" maxlength="13" pattern="${escapeHtml(SAUDI_MOBILE_INPUT_PATTERN)}" title="${escapeHtml(SAUDI_MOBILE_INPUT_TITLE)}" dir="ltr"`;
}

function renderExtraFormFields(value = "", disabled: string) {
  return value
    .split(/\n+/)
    .map((line, index) => {
      const [
        label = "",
        rawName = "",
        rawType = "text",
        rawRequired = "",
        rawPlaceholder = "",
        rawOptions = "",
        rawValidation = "",
      ] = line.split("|");
      const safeLabel = label.trim();
      if (!safeLabel) return "";
      const name = escapeHtml(safeFieldName(rawName, `extraField${index + 1}`));
      const type = parseFieldType(rawType);
      const isRequired =
        rawRequired.trim().toLowerCase() === "required" ||
        rawRequired.trim() === "مطلوب";
      const required = isRequired && !disabled ? " required" : "";
      const placeholder = rawPlaceholder.trim()
        ? ` placeholder="${escapeHtml(rawPlaceholder.trim())}"`
        : "";
      const validation = validationAttributes(rawValidation, disabled);
      if (type === "textarea") {
        return `<label><span>${escapeHtml(safeLabel)}</span><textarea name="${name}" rows="3"${required}${placeholder}${validation}${disabled}></textarea></label>`;
      }
      if (type === "select") {
        const options = parseOptions(rawOptions)
          .map(
            (option) =>
              `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`,
          )
          .join("");
        return `<label><span>${escapeHtml(safeLabel)}</span><select name="${name}"${required}${disabled}><option value="">اختاري</option>${options}</select></label>`;
      }
      if (type === "radio" || type === "checkbox") {
        const options = parseOptions(rawOptions);
        if (options.length === 0 && type === "checkbox") {
          return `<label class="rv-builder-check-field"><input name="${name}" type="checkbox" value="yes"${required}${disabled}><span>${escapeHtml(safeLabel)}</span></label>`;
        }
        const controls = options
          .map(
            (option) =>
              `<label class="rv-builder-option-field"><input name="${name}" type="${type}" value="${escapeHtml(option.value)}"${required}${disabled}><span>${escapeHtml(option.label)}</span></label>`,
          )
          .join("");
        return `<fieldset class="rv-builder-choice-group"><legend>${escapeHtml(safeLabel)}</legend>${controls}</fieldset>`;
      }
      const inputType =
        type === "email" ? "email" : type === "phone" ? "tel" : "text";
      const phoneAttrs = type === "phone" ? phoneInputAttributes(disabled) : "";
      return `<label><span>${escapeHtml(safeLabel)}</span><input name="${name}" type="${inputType}"${phoneAttrs}${required}${placeholder}${validation}${disabled}></label>`;
    })
    .join("");
}

function paragraphHtml(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function parsePairs(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", body = ""] = line.split("|");
      return { title: title.trim(), body: body.trim() };
    })
    .filter((item) => item.title);
}

function parseBeforeAfter(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", before = "", after = "", body = ""] = line.split("|");
      return {
        title: title.trim(),
        before: before.trim(),
        after: after.trim(),
        body: body.trim(),
      };
    })
    .filter((item) => item.title);
}

function parseOfferCards(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [price = "", badge = "", title = "", body = "", perks = ""] =
        line.split("|");
      return {
        price: price.trim(),
        badge: badge.trim(),
        title: title.trim(),
        body: body.trim(),
        perks: perks
          .split(/[,\n،]+/)
          .map((item) => item.trim())
          .filter(Boolean),
      };
    })
    .filter((item) => item.title);
}

function parseMediaItems(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [image = "", title = "", body = ""] = line.split("|");
      return {
        image: image.trim(),
        title: title.trim(),
        body: body.trim(),
      };
    })
    .filter((item) => item.image || item.title);
}

function parseServiceOptions(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = "", slug = ""] = line.split("|");
      const safeLabel = label.trim();
      return {
        label: safeLabel,
        slug: (slug.trim() || safeLabel).trim(),
      };
    })
    .filter((item) => item.label);
}

type FormServiceOption = ReturnType<typeof parseServiceOptions>[number];

function withGeneralInquiryFormOption(options: FormServiceOption[]) {
  return options.some((option) => isGeneralInquiryService(option.slug))
    ? options
    : [
        {
          label: GENERAL_INQUIRY_SERVICE_AR,
          slug: GENERAL_INQUIRY_SERVICE_VALUE,
        },
        ...options,
      ];
}

function serviceOptionLine(option: ServiceOption) {
  return `${option.name}|${option.slug}`;
}

const generalInquiryServiceOption: ServiceOption = {
  slug: GENERAL_INQUIRY_SERVICE_VALUE,
  name: GENERAL_INQUIRY_SERVICE_AR,
};

function withGeneralInquiryOption(options: ServiceOption[]) {
  return options.some((option) => isGeneralInquiryService(option.slug))
    ? options
    : [generalInquiryServiceOption, ...options];
}

function mergeServiceOptionLines(current = "", additions: string[]) {
  const lines = [...current.split(/\n+/), ...additions]
    .map((line) => line.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  return lines
    .filter((line) => {
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n");
}

function cssHexColor(value?: string) {
  const color = value?.trim();
  return color && /^#[0-9a-f]{6}$/i.test(color) ? color : "";
}

function mediaSlot(src: string, label: string) {
  const safeSrc = escapeHtml(src);
  const safeLabel = escapeHtml(label);
  if (
    safeSrc &&
    (/^(\/|https?:\/\/)/i.test(safeSrc) || safeSrc.startsWith("data:image/"))
  ) {
    return `<img src="${safeSrc}" alt="${safeLabel}" loading="lazy" decoding="async">`;
  }
  return `<span>${safeLabel}</span>`;
}

function classes(block: BuilderBlock, base: string) {
  return [
    base,
    `is-${block.tone ?? "light"}`,
    `align-${block.align ?? "right"}`,
    `font-${block.fontSize ?? "md"}`,
    `image-size-${block.imageSize ?? "large"}`,
    `image-aspect-${block.imageAspect ?? "wide"}`,
    `image-fit-${block.imageFit ?? "cover"}`,
    `width-${block.sectionWidth ?? "wide"}`,
    `spacing-${block.spacing ?? "normal"}`,
    `button-${block.buttonStyle ?? "solid"}`,
  ].join(" ");
}

function renderBlock(block: BuilderBlock, mode: "html" | "preview" = "html") {
  const accent = escapeHtml(block.accent || "#4a2476");
  const titleColor = cssHexColor(block.titleColor);
  const textColor = cssHexColor(block.textColor);
  const title = escapeHtml(block.title);
  const subtitle = escapeHtml(block.subtitle || "");
  const body = block.body || "";
  const image = escapeHtml(
    block.imageUrl || "/media/curated/clinic-treatment-room.jpeg",
  );
  const buttonLabel = escapeHtml(block.buttonLabel || "احجزي موعدك");
  const buttonHref = escapeHtml(block.buttonHref || "/contact");
  const styleVars = [
    `--builder-accent:${accent}`,
    titleColor ? `--builder-title-color:${titleColor}` : "",
    textColor ? `--builder-text-color:${textColor}` : "",
  ]
    .filter(Boolean)
    .join(";");
  const style = `style="${styleVars}"${titleColor ? ' data-title-color="true"' : ""}${textColor ? ' data-text-color="true"' : ""}`;

  if (block.kind === "hero") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-hero")}" ${style}><div><small>${subtitle}</small><h1>${title}</h1>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></div><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"></figure></section>`;
  }

  if (block.kind === "campaignHero") {
    const tag = mode === "preview" ? "div" : "form";
    const formAction = "/api/leads";
    const disabled = mode === "preview" ? " disabled" : "";
    const required = mode === "preview" ? "" : " required";
    const formAttrs =
      mode === "preview"
        ? `class="rv-builder-campaign-form" aria-label="Campaign lead form preview"`
        : `class="rv-builder-campaign-form" action="${formAction}" method="post"`;
    const emailMode = block.formEmailMode ?? "hidden";
    const showMessage = block.formShowMessage ?? false;
    const serviceMode = block.formServiceMode ?? "hidden";
    const serviceOptions = withGeneralInquiryFormOption(
      parseServiceOptions(block.formServiceOptions),
    );
    const selectedService = block.serviceSlug || block.serviceName || "";
    const serviceSelectOptions = serviceOptions
      .map((option) => {
        const value = option.slug || option.label;
        const isSelected =
          selectedService &&
          (selectedService === option.slug || selectedService === option.label);
        return `<option value="${escapeHtml(value)}"${isSelected ? " selected" : ""}>${escapeHtml(option.label)}</option>`;
      })
      .join("");
    const hiddenServiceSlug = serviceMode === "hidden" ? block.serviceSlug : "";
    const hiddenServiceName = serviceMode === "hidden" ? block.serviceName : "";
    const serviceControl =
      serviceMode === "select"
        ? `<label><span>الخدمة المطلوبة</span><select name="serviceSlug"${required}${disabled}><option value="">اختاري الخدمة</option>${serviceSelectOptions}</select></label>`
        : serviceMode === "custom"
          ? `<label><span>الخدمة المطلوبة</span><input name="serviceName" autocomplete="off"${required}${disabled} placeholder="اكتبي الخدمة المطلوبة" value="${mode === "preview" ? escapeHtml(block.serviceName || "") : ""}"></label>`
          : "";
    const hiddenInputs =
      mode === "preview"
        ? ""
        : `<input type="hidden" name="source" value="${title} - صفحة هبوط"><input type="hidden" name="preferredLanguage" value="ar">${trackingHiddenInputs()}${hiddenServiceSlug ? `<input type="hidden" name="serviceSlug" value="${escapeHtml(hiddenServiceSlug)}">` : ""}${hiddenServiceName ? `<input type="hidden" name="service" value="${escapeHtml(hiddenServiceName)}"><input type="hidden" name="serviceName" value="${escapeHtml(hiddenServiceName)}"><input type="hidden" name="serviceLabel" value="${escapeHtml(hiddenServiceName)}"><input type="hidden" name="serviceType" value="${escapeHtml(hiddenServiceName)}"><input type="hidden" name="serviceTypeAr" value="${escapeHtml(hiddenServiceName)}">` : ""}`;
    const formControls =
      hiddenInputs +
      `<div class="rv-builder-campaign-form__head"><small>${subtitle || "طلب تواصل"}</small><strong>اتركي بياناتك وسيتواصل معك الفريق</strong></div>` +
      `<label><span>الاسم الكامل</span><input name="fullName" autocomplete="name"${required}${disabled} placeholder="الاسم الثلاثي"></label>` +
      `<label><span>رقم الجوال</span><input name="phone" type="tel"${phoneInputAttributes(disabled)}${required}${disabled} placeholder="05xxxxxxxx"></label>` +
      serviceControl +
      (emailMode === "hidden"
        ? ""
        : `<label><span>البريد الإلكتروني</span><input name="email" type="email" autocomplete="email"${emailMode === "required" ? required : ""}${disabled} placeholder="name@example.com"></label>`) +
      (showMessage
        ? `<label class="rv-builder-campaign-form__wide"><span>تفاصيل الطلب</span><textarea name="message" rows="3"${disabled} placeholder="اكتبي أي تفاصيل مهمة"></textarea></label>`
        : "") +
      renderExtraFormFields(block.formFields, disabled) +
      `<button type="${mode === "preview" ? "button" : "submit"}">${buttonLabel}</button>`;
    return `<section class="${classes(block, "rv-builder-section rv-builder-campaign-hero")}" ${style}><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"></figure><div class="rv-builder-campaign-hero__copy"><small>${subtitle}</small><h1>${title}</h1>${paragraphHtml(body)}<div class="rv-builder-campaign-actions"><a href="${buttonHref}">${buttonLabel}</a><a href="#lead-form">تواصلي معنا</a></div></div><${tag} id="lead-form" ${formAttrs}>${formControls}</${tag}></section>`;
  }

  if (block.kind === "text") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-text")}" ${style}><h2>${title}</h2><div>${paragraphHtml(body)}</div></section>`;
  }

  if (block.kind === "seoArticle") {
    return `<article class="${classes(block, "rv-builder-section rv-builder-seo-article")}" ${style}><header><small>${subtitle}</small><h2>${title}</h2></header><div>${paragraphHtml(body)}</div>${buttonLabel ? `<a href="${buttonHref}">${buttonLabel}</a>` : ""}</article>`;
  }

  if (block.kind === "image") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-image")}" ${style}><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"><figcaption>${title}${body ? ` - ${escapeHtml(body)}` : ""}</figcaption></figure></section>`;
  }

  if (block.kind === "stats") {
    const stats = parsePairs(body)
      .map(
        (item) =>
          `<article><strong>${escapeHtml(item.body)}</strong><span>${escapeHtml(item.title)}</span></article>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-stats")}" ${style}><h2>${title}</h2><div>${stats}</div></section>`;
  }

  if (block.kind === "services" || block.kind === "doctors") {
    const cards = parsePairs(body)
      .map(
        (item) =>
          `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
      )
      .join("");
    return `<section class="${classes(block, `rv-builder-section rv-builder-${block.kind}`)}" ${style}><h2>${title}</h2><div>${cards}</div></section>`;
  }

  if (block.kind === "devices") {
    const cards = parsePairs(body)
      .map(
        (item) =>
          `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-devices")}" ${style}><h2>${title}</h2><div>${cards}</div></section>`;
  }

  if (block.kind === "beforeAfter") {
    const cases = parseBeforeAfter(body)
      .map(
        (item) =>
          `<article><div><figure><small>قبل</small>${mediaSlot(item.before, `${item.title} قبل`)}</figure><figure><small>بعد</small>${mediaSlot(item.after, `${item.title} بعد`)}</figure></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body || "أضيفي وصف الحالة الحقيقي قبل إطلاق الحملة.")}</p></article>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-before-after")}" ${style}><h2>${title}</h2><div>${cases}</div></section>`;
  }

  if (block.kind === "trustBar") {
    const items = parsePairs(body)
      .map(
        (item) =>
          `<article><span>✓</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-trust")}" ${style}><h2>${title}</h2><div>${items}</div></section>`;
  }

  if (block.kind === "comparison") {
    const rows = body
      .split(/\n+/)
      .map((line) => line.split("|").map((cell) => cell.trim()))
      .filter((cells) => cells.length >= 2 && cells[0])
      .map(
        (cells, index) =>
          `<tr>${cells
            .map((cell) => {
              const tag = index === 0 ? "th" : "td";
              return `<${tag}>${escapeHtml(cell)}</${tag}>`;
            })
            .join("")}</tr>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-comparison")}" ${style}><h2>${title}</h2><div><table>${rows}</table></div></section>`;
  }

  if (block.kind === "pricing") {
    const cards = body
      .split(/\n+/)
      .map((line) => line.split("|").map((part) => part.trim()))
      .filter(([name]) => name)
      .map(([name = "", description = "", badge = ""], index) => {
        return `<article class="${index === 1 ? "is-featured" : ""}">${badge ? `<small>${escapeHtml(badge)}</small>` : ""}<h3>${escapeHtml(name)}</h3><p>${escapeHtml(description)}</p><a href="${buttonHref}">${buttonLabel}</a></article>`;
      })
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-pricing")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2></div><div>${cards}</div></section>`;
  }

  if (block.kind === "offerGrid") {
    const cards = parseOfferCards(body)
      .map((item) => {
        const perks = item.perks
          .map((perk) => `<li><span>✓</span>${escapeHtml(perk)}</li>`)
          .join("");
        return `<article>${item.badge ? `<small>${escapeHtml(item.badge)}</small>` : ""}${item.price ? `<strong>${escapeHtml(item.price)}<em> ريال</em></strong>` : ""}<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p>${perks ? `<ul>${perks}</ul>` : ""}<a href="${buttonHref}">${buttonLabel}</a></article>`;
      })
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-offer-grid")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2></div><div>${cards}</div></section>`;
  }

  if (block.kind === "steps") {
    const steps = parsePairs(body)
      .map(
        (item, index) =>
          `<article><span>${index + 1}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-steps")}" ${style}><h2>${title}</h2><div>${steps}</div></section>`;
  }

  if (block.kind === "offer") {
    const perks = parsePairs(body)
      .map(
        (item) =>
          `<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></li>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-offer")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2><ul>${perks}</ul></div><a href="${buttonHref}">${buttonLabel}</a></section>`;
  }

  if (block.kind === "testimonial") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-testimonial")}" ${style}><blockquote>${paragraphHtml(body)}</blockquote><strong>${title}</strong>${subtitle ? `<span>${subtitle}</span>` : ""}</section>`;
  }

  if (block.kind === "video") {
    return `<section class="${classes(block, "rv-builder-section rv-builder-video")}" ${style}><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"><span>▶</span></figure><div><h2>${title}</h2>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></div></section>`;
  }

  if (block.kind === "gallery") {
    const images = parsePairs(body)
      .map(
        (item) =>
          `<figure><img src="${escapeHtml(item.title)}" alt="${escapeHtml(item.body || title)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(item.body)}</figcaption></figure>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-gallery")}" ${style}><h2>${title}</h2><div>${images}</div></section>`;
  }

  if (block.kind === "mediaMosaic") {
    const items = parseMediaItems(body);
    const featured = items[0];
    const smallItems = items.slice(1, 5);
    const featuredHtml = featured
      ? `<figure class="is-featured">${mediaSlot(featured.image, featured.title || title)}<figcaption><strong>${escapeHtml(featured.title || title)}</strong>${featured.body ? `<span>${escapeHtml(featured.body)}</span>` : ""}</figcaption></figure>`
      : `<figure class="is-featured">${mediaSlot(image, title)}<figcaption><strong>${title}</strong></figcaption></figure>`;
    const smallHtml = smallItems
      .map(
        (item) =>
          `<figure>${mediaSlot(item.image, item.title || title)}<figcaption><strong>${escapeHtml(item.title)}</strong>${item.body ? `<span>${escapeHtml(item.body)}</span>` : ""}</figcaption></figure>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-media-mosaic")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2></div><div>${featuredHtml}${smallHtml}</div></section>`;
  }

  if (block.kind === "faq") {
    const faqs = parsePairs(body)
      .map(
        (item) =>
          `<details><summary>${escapeHtml(item.title)}</summary><p>${escapeHtml(item.body)}</p></details>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-faq")}" ${style}><h2>${title}</h2><div>${faqs}</div></section>`;
  }

  if (block.kind === "contact") {
    const rows = parsePairs(body)
      .map(
        (item) =>
          `<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></li>`,
      )
      .join("");
    return `<section class="${classes(block, "rv-builder-section rv-builder-contact")}" ${style}><h2>${title}</h2><ul>${rows}</ul><a href="${buttonHref}">${buttonLabel}</a></section>`;
  }

  if (block.kind === "leadForm") {
    const tag = mode === "preview" ? "div" : "form";
    const formAction = "/api/leads";
    const attrs =
      mode === "preview"
        ? `class="rv-builder-lead-form-fields" aria-label="Lead form preview"`
        : `class="rv-builder-lead-form-fields" action="${formAction}" method="post"`;
    const disabled = mode === "preview" ? " disabled" : "";
    const required = mode === "preview" ? "" : " required";
    const emailMode = block.formEmailMode ?? "hidden";
    const showMessage = block.formShowMessage ?? false;
    const serviceMode =
      block.formServiceMode ??
      (block.serviceSlug || block.serviceName ? "hidden" : "custom");
    const serviceOptions = withGeneralInquiryFormOption(
      parseServiceOptions(block.formServiceOptions),
    );
    const selectedService = block.serviceSlug || block.serviceName || "";
    const serviceSelectOptions = serviceOptions
      .map((option) => {
        const value = option.slug || option.label;
        const isSelected =
          selectedService &&
          (selectedService === option.slug || selectedService === option.label);
        return `<option value="${escapeHtml(value)}"${isSelected ? " selected" : ""}>${escapeHtml(option.label)}</option>`;
      })
      .join("");
    const visibleServiceControl =
      serviceMode === "select"
        ? `<label><span>الخدمة المطلوبة</span><select name="serviceSlug"${required}${disabled}><option value="">اختاري الخدمة</option>${serviceSelectOptions}</select></label>`
        : serviceMode === "custom"
          ? `<label><span>الخدمة المطلوبة</span><input name="serviceName" autocomplete="off"${required}${disabled} placeholder="اكتبي الخدمة المطلوبة" value="${mode === "preview" ? escapeHtml(block.serviceName || "") : ""}"></label>`
          : "";
    const hiddenServiceSlug = serviceMode === "hidden" ? block.serviceSlug : "";
    const hiddenServiceName = serviceMode === "hidden" ? block.serviceName : "";
    let controls =
      (mode === "preview"
        ? ""
        : `<input type="hidden" name="source" value="${title} - صفحة هبوط"><input type="hidden" name="preferredLanguage" value="ar">${trackingHiddenInputs()}${hiddenServiceSlug ? `<input type="hidden" name="serviceSlug" value="${escapeHtml(hiddenServiceSlug)}">` : ""}${hiddenServiceName ? `<input type="hidden" name="service" value="${escapeHtml(hiddenServiceName)}"><input type="hidden" name="serviceName" value="${escapeHtml(hiddenServiceName)}"><input type="hidden" name="serviceLabel" value="${escapeHtml(hiddenServiceName)}"><input type="hidden" name="serviceType" value="${escapeHtml(hiddenServiceName)}"><input type="hidden" name="serviceTypeAr" value="${escapeHtml(hiddenServiceName)}">` : ""}`) +
      `<label><span>الاسم الكامل</span><input name="fullName" autocomplete="name"${required}${disabled} placeholder="الاسم الثلاثي"></label>` +
      `<label><span>رقم الجوال</span><input name="phone" type="tel"${phoneInputAttributes(disabled)}${required}${disabled} placeholder="05xxxxxxxx"></label>` +
      (emailMode === "hidden"
        ? ""
        : `<label><span>البريد الإلكتروني</span><input name="email" type="email" autocomplete="email"${emailMode === "required" ? required : ""}${disabled} placeholder="name@example.com"></label>`) +
      (showMessage
        ? `<label><span>تفاصيل الطلب</span><textarea name="message" rows="4"${disabled} placeholder="اكتبي الخدمة أو التفاصيل المهمة"></textarea></label>`
        : "") +
      renderExtraFormFields(block.formFields, disabled) +
      `<button type="${mode === "preview" ? "button" : "submit"}">${buttonLabel}</button>`;
    if (visibleServiceControl) {
      const phoneIndex = controls.indexOf('name="phone"');
      const insertAfter =
        phoneIndex >= 0 ? controls.indexOf("</label>", phoneIndex) : -1;
      if (insertAfter >= 0) {
        controls =
          controls.slice(0, insertAfter + "</label>".length) +
          visibleServiceControl +
          controls.slice(insertAfter + "</label>".length);
      }
    }
    return `<section id="lead-form" class="${classes(block, "rv-builder-section rv-builder-lead-form")}" ${style}><div><small>${subtitle}</small><h2>${title}</h2>${paragraphHtml(body)}</div><${tag} ${attrs}>${controls}</${tag}></section>`;
  }

  return `<section class="${classes(block, "rv-builder-section rv-builder-cta")}" ${style}><h2>${title}</h2>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></section>`;
}

function renderPage(blocks: BuilderBlock[]) {
  const encodedBlocks = encodeURIComponent(JSON.stringify(blocks));
  return `<div class="rv-builder-page" data-blocks="${encodedBlocks}">${blocks.map((block) => renderBlock(block)).join("")}</div>`;
}

function createBlock(kind: BlockKind): BuilderBlock {
  return { id: uid(), kind, ...presets[kind] };
}

function createTemplate(specs: TemplateBlockSpec[]) {
  return specs.map((spec) => {
    if (typeof spec === "string") return createBlock(spec);
    return { ...createBlock(spec.kind), ...spec.patch };
  });
}

function initialBlocks(html?: string): BuilderBlock[] {
  if (html?.includes("rv-builder-page")) {
    const encoded = html.match(/data-blocks="([^"]+)"/)?.[1];
    if (encoded) {
      try {
        const parsed = JSON.parse(
          decodeURIComponent(encoded),
        ) as BuilderBlock[];
        const valid = parsed.filter(
          (block) => block.id && block.kind && block.title,
        );
        if (valid.length) return valid;
      } catch {
        return createTemplate(["hero", "text", "cta"]);
      }
    }
    return createTemplate(["hero", "text", "leadForm", "cta"]);
  }
  if (html?.trim()) {
    return [
      {
        ...createBlock("text"),
        title: "محتوى الصفحة الحالي",
        body: "تم الاحتفاظ بالمحتوى الحالي في قاعدة البيانات. ابنِ نسخة احترافية بالبلوكات واحفظها عند الجاهزية.",
      },
    ];
  }
  return createTemplate([
    "hero",
    "stats",
    "steps",
    "services",
    "faq",
    "leadForm",
    "cta",
  ]);
}

export function CustomPageBuilder({
  name,
  defaultValue = "",
  webhooks = [],
  serviceOptions = [],
}: {
  name: string;
  defaultValue?: string;
  webhooks?: WebhookOption[];
  serviceOptions?: ServiceOption[];
}) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(() =>
    initialBlocks(defaultValue),
  );
  const [selectedId, setSelectedId] = useState(blocks[0]?.id ?? "");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showCode, setShowCode] = useState(false);
  const [elementSearch, setElementSearch] = useState("");
  const [galleryDraftImage, setGalleryDraftImage] = useState("");
  const [beforeDraftImage, setBeforeDraftImage] = useState("");
  const [afterDraftImage, setAfterDraftImage] = useState("");
  const selected = blocks.find((block) => block.id === selectedId) ?? blocks[0];
  const selectedLibraryItem = selected
    ? blockLibraryByKind.get(selected.kind)
    : undefined;
  const html = useMemo(() => renderPage(blocks), [blocks]);
  const groupedBlockLibrary = useMemo(() => {
    const query = elementSearch.trim().toLowerCase();
    return blockGroups
      .map((group) => ({
        ...group,
        items: group.kinds
          .map((kind) => blockLibraryByKind.get(kind))
          .filter((item): item is BlockLibraryItem => Boolean(item))
          .filter((item) => {
            if (!query) return true;
            return `${item.kind} ${item.label} ${item.hint} ${group.label}`
              .toLowerCase()
              .includes(query);
          }),
      }))
      .filter((group) => group.items.length > 0);
  }, [elementSearch]);
  const visibleBlockCount = groupedBlockLibrary.reduce(
    (total, group) => total + group.items.length,
    0,
  );
  const builderServiceOptions = useMemo(
    () => withGeneralInquiryOption([...serviceOptions]),
    [serviceOptions],
  );
  const allServiceLines = useMemo(
    () => builderServiceOptions.map(serviceOptionLine),
    [builderServiceOptions],
  );

  function add(kind: BlockKind) {
    const next = createBlock(kind);
    setBlocks((current) => [...current, next]);
    setSelectedId(next.id);
  }

  function replaceWithTemplate(template: PageTemplate) {
    if (
      blocks.length > 0 &&
      !window.confirm(
        `سيتم استبدال ${blocks.length} مكونًا بالقالب «${template.label}». هل تريد المتابعة؟`,
      )
    ) {
      return;
    }
    const next = createTemplate(template.blocks);
    setBlocks(next);
    setSelectedId(next[0]?.id ?? "");
  }

  function appendBlocks(specs: TemplateBlockSpec[]) {
    const next = createTemplate(specs);
    setBlocks((current) => [...current, ...next]);
    setSelectedId(next[0]?.id ?? "");
  }

  function update(id: string, patch: Partial<BuilderBlock>) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id ? { ...block, ...patch } : block,
      ),
    );
  }

  function selectLinkedService(slug: string) {
    if (!selected) return;
    const service = builderServiceOptions.find((item) => item.slug === slug);
    update(selected.id, {
      serviceSlug: service?.slug ?? "",
      serviceName: service?.name ?? "",
    });
  }

  function addSelectedServiceToFormOptions() {
    if (!selected?.serviceSlug) return;
    const service = builderServiceOptions.find(
      (item) => item.slug === selected.serviceSlug,
    );
    const line = service
      ? serviceOptionLine(service)
      : `${selected.serviceName || selected.serviceSlug}|${selected.serviceSlug}`;
    update(selected.id, {
      formServiceOptions: mergeServiceOptionLines(selected.formServiceOptions, [
        line,
      ]),
    });
  }

  function addAllServicesToFormOptions() {
    if (!selected || allServiceLines.length === 0) return;
    update(selected.id, {
      formServiceOptions: mergeServiceOptionLines(
        selected.formServiceOptions,
        allServiceLines,
      ),
    });
  }

  function appendGalleryImage() {
    if (
      !selected ||
      !["gallery", "mediaMosaic"].includes(selected.kind) ||
      !galleryDraftImage
    ) {
      return;
    }
    update(selected.id, {
      body: [selected.body, `${galleryDraftImage}|صورة الحملة`]
        .filter(Boolean)
        .join("\n"),
    });
    setGalleryDraftImage("");
  }

  function appendBeforeAfterCase() {
    if (
      !selected ||
      selected.kind !== "beforeAfter" ||
      (!beforeDraftImage && !afterDraftImage)
    ) {
      return;
    }
    update(selected.id, {
      body: [
        selected.body,
        `حالة جديدة|${beforeDraftImage}|${afterDraftImage}|وصف مختصر للحالة`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    setBeforeDraftImage("");
    setAfterDraftImage("");
  }

  function duplicate(id: string) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const source = current[index];
      if (!source) return current;
      const copy = { ...source, id: uid(), title: `${source.title} - نسخة` };
      const next = [...current];
      next.splice(index + 1, 0, copy);
      setSelectedId(copy.id);
      return next;
    });
  }

  function remove(id: string) {
    setBlocks((current) => {
      const next = current.filter((block) => block.id !== id);
      setSelectedId(next[0]?.id ?? "");
      return next;
    });
  }

  function move(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (!item) return current;
      next.splice(target, 0, item);
      return next;
    });
  }

  function dropOn(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    setBlocks((current) => {
      const dragged = current.find((block) => block.id === draggedId);
      if (!dragged) return current;
      const without = current.filter((block) => block.id !== draggedId);
      const targetIndex = without.findIndex((block) => block.id === targetId);
      if (targetIndex < 0) return current;
      const next = [...without];
      next.splice(targetIndex, 0, dragged);
      return next;
    });
    setDraggedId(null);
  }

  return (
    <div className="pagecraft-admin">
      <input type="hidden" name={name} value={html} />
      <aside className="pagecraft-panel">
        <div className="pagecraft-panel__header">قوالب صفحات كاملة</div>
        <div className="pagecraft-templates">
          {templates.map((template) => (
            <article key={template.id} className="pagecraft-template-card">
              <div>
                <span>{template.badge}</span>
                <strong>{template.label}</strong>
                <p>{template.hint}</p>
                <small>{template.blocks.length} أقسام قابلة للتعديل</small>
              </div>
              <div className="pagecraft-template-card__actions">
                <button
                  type="button"
                  onClick={() => replaceWithTemplate(template)}
                  title="استبدال محتوى المحرر الحالي بهذا القالب"
                >
                  استخدام القالب
                </button>
                <button
                  type="button"
                  onClick={() => appendBlocks(template.blocks)}
                  title="إضافة أقسام القالب أسفل الصفحة الحالية"
                >
                  <span aria-hidden>+</span>
                  إضافة للصفحة
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="pagecraft-panel__header">مجموعات جاهزة</div>
        <div className="pagecraft-patterns">
          {sectionPatterns.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              onClick={() => appendBlocks(pattern.blocks)}
            >
              <span className="pagecraft-patterns__mark" aria-hidden>
                +
              </span>
              <span>
                <strong>{pattern.label}</strong>
                <small>{pattern.hint}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="pagecraft-panel__header">العناصر</div>
        <div className="pagecraft-library-search">
          <input
            value={elementSearch}
            onChange={(event) => setElementSearch(event.target.value)}
            placeholder="بحث عن مكون..."
            aria-label="بحث عن مكون PageCraft"
          />
          <span>{visibleBlockCount} مكون متاح</span>
        </div>
        <div className="pagecraft-elements pagecraft-elements--grouped">
          {groupedBlockLibrary.map((group) => (
            <section key={group.label} className="pagecraft-element-group">
              <div className="pagecraft-element-group__head">
                <strong>{group.label}</strong>
                <span>{group.hint}</span>
              </div>
              <div className="pagecraft-element-group__grid">
                {group.items.map((item) => (
                  <button
                    key={item.kind}
                    type="button"
                    onClick={() => add(item.kind)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.hint}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
          {visibleBlockCount === 0 ? (
            <p className="pagecraft-empty">
              لا توجد مكونات مطابقة للبحث الحالي.
            </p>
          ) : null}
        </div>

        <div className="pagecraft-panel__header">هيكل الصفحة</div>
        <div className="pagecraft-outline">
          {blocks.map((block, index) => (
            <button
              key={block.id}
              type="button"
              className={selectedId === block.id ? "is-active" : ""}
              onClick={() => setSelectedId(block.id)}
            >
              <span>{index + 1}</span>
              <span>
                <strong>
                  {blockLibraryByKind.get(block.kind)?.label ?? block.kind}
                </strong>
                <small>{block.title}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="pagecraft-panel__header">المعاينة</div>
        <div className="pagecraft-devices">
          {(["desktop", "tablet", "mobile"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={mode === item ? "is-active" : ""}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="pagecraft-code-toggle"
          onClick={() => setShowCode((value) => !value)}
        >
          {showCode ? "إخفاء HTML" : "فحص HTML"}
        </button>
      </aside>

      <main className="pagecraft-canvas-wrap">
        <div className="pagecraft-canvas-toolbar" aria-live="polite">
          <span>{blocks.length} بلوك</span>
          <span>{mode}</span>
          {selectedLibraryItem ? (
            <strong>{selectedLibraryItem.label}</strong>
          ) : null}
        </div>
        {showCode ? (
          <textarea className="pagecraft-code" readOnly value={html} />
        ) : (
          <div className={`pagecraft-canvas is-${mode}`}>
            {blocks.map((block, index) => (
              <section
                key={block.id}
                draggable
                onDragStart={() => setDraggedId(block.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropOn(block.id)}
                onClick={() => setSelectedId(block.id)}
                className={`pagecraft-block ${selectedId === block.id ? "is-selected" : ""}`}
              >
                <div className="pagecraft-block__tools">
                  <button
                    type="button"
                    onClick={() => move(block.id, -1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(block.id, 1)}
                    disabled={index === blocks.length - 1}
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => duplicate(block.id)}>
                    نسخ
                  </button>
                  <button type="button" onClick={() => remove(block.id)}>
                    حذف
                  </button>
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderBlock(block, "preview"),
                  }}
                />
              </section>
            ))}
          </div>
        )}
      </main>

      <aside className="pagecraft-panel">
        <div className="pagecraft-panel__header">الخصائص</div>
        {selected ? (
          <div className="pagecraft-props">
            <div className="pagecraft-selected-card">
              <strong>{selectedLibraryItem?.label ?? selected.kind}</strong>
              <span>
                {selectedLibraryItem?.hint ??
                  "مكون قابل للتعديل من لوحة الخصائص."}
              </span>
            </div>
            <label>
              <span>العنوان</span>
              <input
                value={selected.title}
                onChange={(event) =>
                  update(selected.id, { title: event.target.value })
                }
              />
            </label>
            <label>
              <span>وصف قصير</span>
              <input
                value={selected.subtitle ?? ""}
                onChange={(event) =>
                  update(selected.id, { subtitle: event.target.value })
                }
              />
            </label>
            <label>
              <span>
                المحتوى
                {selected.kind === "beforeAfter"
                  ? " (سطر لكل حالة: عنوان|صورة قبل|صورة بعد|وصف)"
                  : selected.kind === "services" ||
                      selected.kind === "doctors" ||
                      selected.kind === "devices" ||
                      selected.kind === "stats" ||
                      selected.kind === "gallery" ||
                      selected.kind === "faq" ||
                      selected.kind === "steps" ||
                      selected.kind === "offer" ||
                      selected.kind === "contact"
                    ? " (سطر لكل عنصر: عنوان|وصف)"
                    : ""}
              </span>
              <textarea
                value={selected.body ?? ""}
                rows={
                  [
                    "services",
                    "doctors",
                    "devices",
                    "stats",
                    "gallery",
                    "beforeAfter",
                    "faq",
                    "steps",
                    "offer",
                    "offerGrid",
                    "contact",
                    "mediaMosaic",
                    "seoArticle",
                  ].includes(selected.kind)
                    ? 8
                    : 5
                }
                onChange={(event) =>
                  update(selected.id, { body: event.target.value })
                }
              />
            </label>

            {selected.kind === "gallery" || selected.kind === "mediaMosaic" ? (
              <div className="pagecraft-mini-panel">
                <ImagePicker
                  name={`builder-${selected.id}-gallery-draft`}
                  label="إضافة صورة للمعرض"
                  defaultValue={galleryDraftImage}
                  namespace="pages"
                  aspect={16 / 10}
                  onChange={setGalleryDraftImage}
                />
                <div className="pagecraft-inline-actions">
                  <button
                    type="button"
                    onClick={appendGalleryImage}
                    disabled={!galleryDraftImage}
                  >
                    إضافة الصورة للمعرض
                  </button>
                </div>
                <small>
                  سيتم إضافة سطر جاهز في المحتوى، ويمكنك تعديل الوصف بعد
                  الإضافة.
                </small>
              </div>
            ) : null}

            {selected.kind === "beforeAfter" ? (
              <div className="pagecraft-mini-panel">
                <ImagePicker
                  name={`builder-${selected.id}-before-draft`}
                  label="صورة قبل"
                  defaultValue={beforeDraftImage}
                  namespace="pages"
                  aspect={4 / 5}
                  onChange={setBeforeDraftImage}
                />
                <ImagePicker
                  name={`builder-${selected.id}-after-draft`}
                  label="صورة بعد"
                  defaultValue={afterDraftImage}
                  namespace="pages"
                  aspect={4 / 5}
                  onChange={setAfterDraftImage}
                />
                <div className="pagecraft-inline-actions">
                  <button
                    type="button"
                    onClick={appendBeforeAfterCase}
                    disabled={!beforeDraftImage && !afterDraftImage}
                  >
                    إضافة حالة قبل/بعد
                  </button>
                </div>
                <small>
                  سيتم إضافة الحالة كسطر جاهز: العنوان | قبل | بعد | الوصف.
                </small>
              </div>
            ) : null}

            {selected.kind === "hero" ||
            selected.kind === "campaignHero" ||
            selected.kind === "image" ||
            selected.kind === "video" ? (
              <ImagePicker
                name={`builder-${selected.id}-image`}
                label="الصورة"
                defaultValue={selected.imageUrl ?? ""}
                namespace="pages"
                aspect={16 / 9}
                onChange={(url) => update(selected.id, { imageUrl: url })}
              />
            ) : null}

            {selected.kind === "hero" ||
            selected.kind === "campaignHero" ||
            selected.kind === "image" ||
            selected.kind === "video" ? (
              <div className="pagecraft-mini-panel">
                <label>
                  <span>حجم الصورة</span>
                  <select
                    value={selected.imageSize ?? "large"}
                    onChange={(event) =>
                      update(selected.id, {
                        imageSize: event.target.value as ImageSize,
                      })
                    }
                  >
                    <option value="small">صغير</option>
                    <option value="medium">متوسط</option>
                    <option value="large">كبير</option>
                    <option value="full">عرض كامل</option>
                  </select>
                </label>
                <label>
                  <span>نسبة الصورة</span>
                  <select
                    value={selected.imageAspect ?? "wide"}
                    onChange={(event) =>
                      update(selected.id, {
                        imageAspect: event.target.value as ImageAspect,
                      })
                    }
                  >
                    <option value="wide">16:10 عريضة</option>
                    <option value="square">مربعة</option>
                    <option value="portrait">طولية</option>
                    <option value="natural">طبيعية</option>
                  </select>
                </label>
                <label>
                  <span>ملء الصورة</span>
                  <select
                    value={selected.imageFit ?? "cover"}
                    onChange={(event) =>
                      update(selected.id, {
                        imageFit: event.target.value as ImageFit,
                      })
                    }
                  >
                    <option value="cover">تملأ المساحة</option>
                    <option value="contain">تظهر كاملة</option>
                  </select>
                </label>
              </div>
            ) : null}

            {selected.kind === "hero" ||
            selected.kind === "campaignHero" ||
            selected.kind === "cta" ||
            selected.kind === "contact" ||
            selected.kind === "offer" ||
            selected.kind === "offerGrid" ||
            selected.kind === "seoArticle" ||
            selected.kind === "video" ||
            selected.kind === "leadForm" ? (
              <div className="grid gap-2">
                <label>
                  <span>نص الزر</span>
                  <input
                    value={selected.buttonLabel ?? ""}
                    onChange={(event) =>
                      update(selected.id, { buttonLabel: event.target.value })
                    }
                  />
                </label>
                <label>
                  <span>رابط الزر</span>
                  <input
                    dir="ltr"
                    value={selected.buttonHref ?? ""}
                    onChange={(event) =>
                      update(selected.id, { buttonHref: event.target.value })
                    }
                  />
                </label>
              </div>
            ) : null}

            {selected.kind === "leadForm" ||
            selected.kind === "campaignHero" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3">
                <label>
                  <span>حالة البريد الإلكتروني</span>
                  <select
                    value={selected.formEmailMode ?? "hidden"}
                    onChange={(event) =>
                      update(selected.id, {
                        formEmailMode: event.target.value as
                          | "hidden"
                          | "optional"
                          | "required",
                      })
                    }
                  >
                    <option value="optional">اختياري</option>
                    <option value="required">إجباري</option>
                    <option value="hidden">إخفاء الخانة</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={selected.formShowMessage ?? false}
                    onChange={(event) =>
                      update(selected.id, {
                        formShowMessage: event.target.checked,
                      })
                    }
                  />
                  <span>إظهار تفاصيل الطلب</span>
                </label>
                <label>
                  <span>طريقة ظهور الخدمة داخل الفورم</span>
                  <select
                    value={selected.formServiceMode ?? "hidden"}
                    onChange={(event) =>
                      update(selected.id, {
                        formServiceMode: event.target.value as FormServiceMode,
                      })
                    }
                  >
                    <option value="custom">حقل كتابة للزائر</option>
                    <option value="select">قائمة اختيار خدمات</option>
                    <option value="hidden">خدمة مخفية مرتبطة بالصفحة</option>
                    <option value="none">إخفاء الخدمة بالكامل</option>
                  </select>
                </label>
                <label>
                  <span>الخدمة المرتبطة</span>
                  <select
                    value={selected.serviceSlug ?? ""}
                    onChange={(event) =>
                      selectLinkedService(event.target.value)
                    }
                  >
                    <option value="">بدون خدمة محددة</option>
                    {builderServiceOptions.map((service) => (
                      <option key={service.slug} value={service.slug}>
                        {service.name}
                        {service.category ? ` · ${service.category}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {(selected.formServiceMode ??
                  (selected.serviceSlug || selected.serviceName
                    ? "hidden"
                    : "custom")) === "select" ? (
                  <div className="pagecraft-mini-panel">
                    <div className="pagecraft-inline-actions">
                      <button
                        type="button"
                        onClick={addSelectedServiceToFormOptions}
                        disabled={!selected.serviceSlug}
                      >
                        إضافة الخدمة المختارة
                      </button>
                      <button
                        type="button"
                        onClick={addAllServicesToFormOptions}
                        disabled={allServiceLines.length === 0}
                      >
                        إضافة كل الخدمات
                      </button>
                    </div>
                    <label>
                      <span>خيارات قائمة الخدمات</span>
                      <textarea
                        value={selected.formServiceOptions ?? ""}
                        rows={5}
                        onChange={(event) =>
                          update(selected.id, {
                            formServiceOptions: event.target.value,
                          })
                        }
                        placeholder="تجميل الأنف|rhinoplasty"
                      />
                    </label>
                    <small>كل سطر: اسم الخدمة للزائر | slug الخدمة.</small>
                  </div>
                ) : null}
                <details className="pagecraft-mini-panel">
                  <summary>إعدادات الخدمة اليدوية</summary>
                  <label>
                    <span>Slug الخدمة</span>
                    <input
                      dir="ltr"
                      value={selected.serviceSlug ?? ""}
                      onChange={(event) =>
                        update(selected.id, { serviceSlug: event.target.value })
                      }
                      placeholder="rhinoplasty"
                    />
                  </label>
                  <label>
                    <span>اسم الخدمة العربي</span>
                    <input
                      value={selected.serviceName ?? ""}
                      onChange={(event) =>
                        update(selected.id, { serviceName: event.target.value })
                      }
                      placeholder="تجميل الأنف"
                    />
                  </label>
                </details>
                <label>
                  <span>Webhook داخلي</span>
                  <select
                    value={selected.webhookToken ?? ""}
                    onChange={(event) =>
                      update(selected.id, {
                        webhookToken: event.target.value,
                        formActionUrl: event.target.value
                          ? ""
                          : (selected.formActionUrl ?? ""),
                      })
                    }
                  >
                    <option value="">CRM الافتراضي /api/leads</option>
                    {webhooks
                      .filter((webhook) => webhook.isActive)
                      .map((webhook) => (
                        <option key={webhook.token} value={webhook.token}>
                          {webhook.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  <span>Action مباشر قديم - استخدم Webhook الصفحة بالأعلى</span>
                  <input
                    dir="ltr"
                    value={selected.formActionUrl ?? ""}
                    readOnly
                    disabled
                    placeholder="https://hook.eu2.make.com/..."
                  />
                  <small>
                    للحملات الجديدة اترك هذا الحقل فارغًا، وضع رابط Make في
                    إعدادات الصفحة حتى يتم الإرسال بعد حفظ الليد في CRM.
                  </small>
                </label>
                <label>
                  <span>حقول إضافية ديناميكية</span>
                  <textarea
                    value={selected.formFields ?? ""}
                    rows={5}
                    onChange={(event) =>
                      update(selected.id, { formFields: event.target.value })
                    }
                    placeholder="العمر|age|text||مثال: 35| |min:1&#10;طريقة التواصل|contact_method|select|مطلوب|اختاري|واتساب,اتصال&#10;هل لديك حساسية؟|allergy|radio|| |نعم,لا"
                  />
                  <small>
                    الصيغة:
                    label|name|type|required|placeholder|options|validation.
                    الأنواع: text, email, phone, textarea, select, checkbox,
                    radio.
                  </small>
                </label>
              </div>
            ) : null}

            <div className="pagecraft-mini-panel">
              <label>
                <span>عرض القسم</span>
                <select
                  value={selected.sectionWidth ?? "wide"}
                  onChange={(event) =>
                    update(selected.id, {
                      sectionWidth: event.target.value as SectionWidth,
                    })
                  }
                >
                  <option value="contained">محتوى مركز</option>
                  <option value="wide">عريض</option>
                  <option value="full">عرض الصفحة</option>
                </select>
              </label>
              <label>
                <span>المسافات الداخلية</span>
                <select
                  value={selected.spacing ?? "normal"}
                  onChange={(event) =>
                    update(selected.id, {
                      spacing: event.target.value as SectionSpacing,
                    })
                  }
                >
                  <option value="compact">مضغوطة</option>
                  <option value="normal">متوازنة</option>
                  <option value="airy">واسعة</option>
                </select>
              </label>
              <div className="pagecraft-segment pagecraft-segment--two">
                {(["solid", "outline"] as const).map((buttonStyle) => (
                  <button
                    key={buttonStyle}
                    type="button"
                    className={
                      (selected.buttonStyle ?? "solid") === buttonStyle
                        ? "is-active"
                        : ""
                    }
                    onClick={() => update(selected.id, { buttonStyle })}
                  >
                    {buttonStyle === "solid" ? "زر ممتلئ" : "زر بإطار"}
                  </button>
                ))}
              </div>
            </div>

            <div className="pagecraft-segment">
              {(["right", "center", "left"] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  className={
                    (selected.align ?? "right") === align ? "is-active" : ""
                  }
                  onClick={() => update(selected.id, { align })}
                >
                  {align}
                </button>
              ))}
            </div>
            <div className="pagecraft-segment">
              {(["light", "soft", "dark"] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  className={
                    (selected.tone ?? "light") === tone ? "is-active" : ""
                  }
                  onClick={() => update(selected.id, { tone })}
                >
                  {tone}
                </button>
              ))}
            </div>

            <div className="pagecraft-mini-panel">
              <label>
                <span>حجم الخط</span>
                <select
                  value={selected.fontSize ?? "md"}
                  onChange={(event) =>
                    update(selected.id, {
                      fontSize: event.target.value as FontSize,
                    })
                  }
                >
                  <option value="sm">صغير</option>
                  <option value="md">افتراضي</option>
                  <option value="lg">كبير</option>
                  <option value="xl">كبير جدًا</option>
                </select>
              </label>
              <div className="pagecraft-color-grid">
                <label>
                  <span>لون العناوين</span>
                  <input
                    type="color"
                    value={selected.titleColor ?? "#1f1040"}
                    onChange={(event) =>
                      update(selected.id, { titleColor: event.target.value })
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() => update(selected.id, { titleColor: "" })}
                >
                  افتراضي
                </button>
              </div>
              <div className="pagecraft-color-grid">
                <label>
                  <span>لون النص</span>
                  <input
                    type="color"
                    value={selected.textColor ?? "#5b4c7a"}
                    onChange={(event) =>
                      update(selected.id, { textColor: event.target.value })
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() => update(selected.id, { textColor: "" })}
                >
                  افتراضي
                </button>
              </div>
            </div>

            <label>
              <span>لون الهوية</span>
              <input
                type="color"
                value={selected.accent ?? "#4a2476"}
                onChange={(event) =>
                  update(selected.id, { accent: event.target.value })
                }
              />
            </label>
          </div>
        ) : (
          <p className="pagecraft-empty">اختاري بلوك للتعديل.</p>
        )}
      </aside>
    </div>
  );
}
