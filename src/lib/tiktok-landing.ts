import { bookingServices } from "./booking-landing.ts";
import { isTeamLanding } from "./landing-team.ts";
import {
  checkList,
  extractAnyLeadForm,
  faqSection,
  finalBand,
  formCard,
  journey,
  landingLinks,
  pageShell,
  polishForm,
  searchGuide,
  serviceLinks,
  stickyBar,
  teamTiles,
  topBar,
  trustStrip,
  type TeamMember,
} from "./landing-blocks.ts";

// Existing attribution/layout IDs stay stable; visible copy is channel-neutral.
export const TIKTOK_MARKER = 'data-focused-landing="tiktok"';
const RELEASE = 'data-team-release="2026-11-02"';

const tips = [
  [
    "ابدأ بما يشغلك",
    "خط الفك، تناسق الجسم، أو العناية بالبشرة. أخبرنا بالخدمة التي تبحث عنها، وسنرتّب لك الخطوة الأولى.",
  ],
  [
    "تعرّف على طبيبك",
    "استعرض الفريق وتخصصاته، واختر الطبيب الذي ترغب في زيارته. ويساعدك فريقنا في تنسيق الموعد.",
  ],
  [
    "اعرف تفاصيل زيارتك",
    "موعد الاستشارة، وما تحتاجه قبل الحضور، وتكلفتها. كل التفاصيل تصلك من فريق ريجوفيرا مباشرة.",
  ],
] as const;

const faqItems = [
  [
    "كيف أحجز موعدًا؟",
    "اترك اسمك ورقم جوالك واختر الخدمة من النموذج، أو تواصل معنا مباشرة عبر الاتصال أو واتساب. سيتولى فريقنا ترتيب الموعد معك.",
  ],
  [
    "هل أقدر أختار الطبيب؟",
    "نعم. تعرّف على أطبائنا وتخصصاتهم في هذه الصفحة، وأخبر الفريق باسم الطبيب الذي ترغب في زيارته عند تنسيق موعدك.",
  ],
  [
    "ما الخدمات المتوفرة في المركز؟",
    "جراحات التجميل للوجه والجسم والصدر، والجلدية والليزر والعناية بالبشرة، وصحة المرأة والتجميل النسائي. ستجد روابط الخدمات والفريق الطبي هنا لتتعرف عليها أكثر.",
  ],
  [
    "ماذا تشمل الاستشارة؟",
    "لقاء مع الطبيب لمناقشة ما ترغب في تحسينه، والفحص، والتعرّف على الخيارات المناسبة لك. وتعرف خلاله تفاصيل الإجراء والتعافي والمتابعة.",
  ],
  [
    "كيف أعرف التكلفة؟",
    "يطلعك الفريق على تكلفة الاستشارة عند الحجز. أما تكلفة الإجراء فتتضح بعد معرفة تفاصيله والخطة التي يناقشها معك الطبيب.",
  ],
  [
    "أين يقع مركز ريجوفيرا؟",
    "نستقبلك في الرياض. تواصل معنا وسيرسل لك الفريق الموقع وتفاصيل الوصول مع موعد زيارتك.",
  ],
] as const;

const searchGuideHtml = `<h2>ريجوفيرا: جراحة التجميل والجلدية في الرياض</h2><p>من شد الوجه والرقبة إلى نحت الجسم والعناية بالبشرة، تجد في ريجوفيرا تخصصات متعددة وفريقًا تتعرّف عليه قبل زيارتك. استعرض الخدمات وأطبائها، ثم احجز موعدك بالتواصل المباشر مع المركز.</p><h3>طبيبك وخدمتك في مكان واحد</h3><p>تعرّف على <a href="/doctors">الفريق الطبي كاملًا</a>، أو <a href="#consultation-form">احجز موعد استشارتك</a>. وإذا كان لديك سؤال عن الخدمة أو التوقيت، يسعد فريق ريجوفيرا بمساعدتك.</p>`;

/** Reuse the original CMS form; never rebuild its fields or attribution. */
export function improveTiktokLanding(
  html: string,
  slug: string,
  team?: readonly TeamMember[],
): string {
  if (!isTeamLanding(slug) || (html.includes(RELEASE) && team === undefined))
    return html;
  const form = extractAnyLeadForm(html);
  if (!form) return html;
  const { whatsapp, contacts, book } = landingLinks();
  const members = team ?? [];

  const hero = `<section class="fl-hero"><div class="fl-wrap fl-hero-grid"><div class="fl-intro"><p class="fl-eyebrow">ريجوفيرا · الرياض</p><h1>خبرة تطمئن لها.<span>واهتمام يليق بك.</span></h1><p class="fl-lead">تفاصيل الوجه، تناسق الجسم، وصحة البشرة… لكل منها طبيب يعرفها جيدًا. في ريجوفيرا تجد فريقًا يجمع جراحة التجميل والجلدية وصحة المرأة، لتختار خدمتك وطبيبك في مكان واحد.</p>${checkList(
    [
      "جراحة التجميل والترميم والجلدية وصحة المرأة",
      "عناية تبدأ بالاستشارة وتستمر مع المتابعة",
      "تواصل مباشر مع فريق المركز في الرياض",
    ],
  )}<div class="fl-actions">${contacts}</div><a class="fl-text-link" href="#tiktok-team">تعرّف على أطباء ريجوفيرا ↓</a></div>${formCard(
    "يسعدنا استقبالك",
    "موعدك يبدأ من هنا",
    "اختر خدمتك واترك رقمك. فريق ريجوفيرا سيتواصل معك لترتيب الموعد والإجابة عن أسئلتك.",
    polishForm(form, "احجز موعدك الآن ←"),
  )}</div></section>`;

  const teamSection = `<section class="fl-section fl-soft" id="tiktok-team"><div class="fl-wrap"><p class="fl-eyebrow">الفريق الطبي</p><h2>تعرّف على أطباء ريجوفيرا</h2><p class="fl-intro-text">خبرات متنوعة، يجمعها الاهتمام بالتفاصيل. استعرض تخصص كل طبيب وتعرّف عليه أكثر قبل زيارتك.</p>${members.length ? teamTiles(members) : '<a class="fl-button" href="/doctors">استعرض الفريق الطبي</a>'}</div></section>`;
  const servicesSection = `<section class="fl-section" id="booking-services"><div class="fl-wrap"><p class="fl-eyebrow">خدمات ريجوفيرا</p><h2>وجه، جسم، وبشرة… عناية تجمع التفاصيل</h2><p class="fl-intro-text">تعرّف على الخدمة التي تهمّك، واكتشف ما يقدّمه أطباؤنا فيها.</p>${serviceLinks(bookingServices)}<div class="fl-actions fl-actions--center">${book("احجز موعد استشارتك")}</div></div></section>`;
  const tipsSection = `<section class="fl-section" id="tiktok-tips"><div class="fl-wrap"><p class="fl-eyebrow">قبل زيارتك</p><h2>نرتّب التفاصيل معك</h2><div class="fl-grid fl-options">${tips.map(([title, text], index) => `<div class="fl-card"><span class="fl-number">0${index + 1}</span><h3>${title}</h3><p>${text}</p></div>`).join("")}</div></div></section>`;

  return pageShell(
    `${TIKTOK_MARKER} ${RELEASE}`,
    [
      topBar("روابط ريجوفيرا"),
      hero,
      trustStrip("ريجوفيرا", [
        ["تخصصات متعددة", "جراحة التجميل والجلدية وصحة المرأة"],
        ["فريق طبي", "تعرّف على طبيبك قبل الزيارة"],
        ["تنسيق مباشر", "حجز ومتابعة مع فريق المركز"],
        ["في الرياض", "نرحّب بك في ريجوفيرا"],
      ]),
      teamSection,
      servicesSection,
      tipsSection,
      journey("tiktok-steps", "من الحجز إلى لقائك بالطبيب", [
        ["اختر خدمتك", "حدّد الخدمة واترك وسيلة للتواصل معك."],
        ["نرتّب موعدك", "يتواصل معك الفريق لتأكيد وقت الزيارة والطبيب."],
        ["قابل طبيبك", "ناقش تفاصيلك وأسئلتك وتعرّف على الخيارات."],
        ["متابعة معك", "تعرف الخطوة التالية وكيف تتواصل مع فريقك الطبي."],
      ]),
      faqSection({
        id: "tiktok-questions",
        eyebrow: "أسئلتك تهمّنا",
        heading: "قبل أن تحجز",
        items: faqItems,
        after: finalBand(
          "نرحّب بك في ريجوفيرا",
          "اختر طبيبك، واترك لنا ترتيب الموعد.",
          `${book("احجز موعدك الآن")}${contacts}`,
        ),
      }),
      searchGuide("tiktok-search-guide", searchGuideHtml),
      stickyBar(whatsapp),
    ].join(""),
  );
}
