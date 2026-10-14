import {
  CLINIC_PHONE_TEL,
  CLINIC_WHATSAPP_URL,
  LANDING_PAGE_WHATSAPP_MESSAGE,
  withGoogleWhatsappReferral,
} from "./clinic-contact.ts";

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/** Presentation only. Keep the CMS form, hidden fields and native POST intact. */
export function improveFaceliftLanding(html: string, slug: string): string {
  if (
    slug !== "facelift-riyadh" ||
    !/\brvx-form\b/.test(html) ||
    html.includes('data-facelift-optimized="1"')
  )
    return html;
  const forms = html.match(/<form\b[\s\S]*?<\/form>/gi) ?? [];
  if (
    forms.length !== 1 ||
    !/\bname=["']fullName["']/.test(forms[0]!) ||
    !/\bname=["']phone["']/.test(forms[0]!)
  )
    return html;

  const form = forms[0]!;
  // Reuse only the page's existing before/after assets, never manufacture cases.
  const gallery = html
    .match(/<section\b[^>]*>[\s\S]*?<\/section>/gi)
    ?.find((section) => section.includes("أمثلة توضيحية قبل وبعد"));
  const galleryImages = gallery?.match(/<img\b[^>]*>/gi)?.slice(0, 4) ?? [];
  const whatsapp = escapeAttr(
    withGoogleWhatsappReferral(
      `${CLINIC_WHATSAPP_URL}?text=${encodeURIComponent(LANDING_PAGE_WHATSAPP_MESSAGE)}`,
    ),
  );
  const contacts = `<a class="fl-button fl-button--outline" href="${CLINIC_PHONE_TEL}">اتصال مباشر</a><a class="fl-button fl-button--whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer">واتساب للمواعيد</a>`;
  const book =
    '<a class="fl-button" href="#consultation-form">احجز تقييمك مع د. لؤي</a>';
  const searchGuide = `<div class="fl-search-content" id="facelift-search-guide"><h2>عملية شد الوجه في الرياض: معلومات تساعدك تختار</h2><p>إذا كنت تبحث عن دكتور شد وجه بالرياض، ابدأ باستشارة تناقش فيها درجة ترهل الوجه والرقبة وما تريد تحسينه. في مركز ريجوفيرا، يمكنك طلب تقييم مع <a href="/doctors/loai-alsalmi">د. لؤي السالمي، استشاري جراحة التجميل والترميم</a>، ومناقشة الخيارات قبل اتخاذ قرار العملية.</p><h3>شد الوجه العميق أم الميني فيس لفت؟</h3><p>شد الوجه العميق، المعروف باسم ديب بلين، وشد الوجه المصغّر أو ميني فيس لفت ليسا خيارًا واحدًا لكل الحالات. اسأل أثناء تقييم <a href="/services/face-neck-lift">شد الوجه والرقبة</a> عن ملاءمة كل خيار لك، وعن ترهل الخدين وخط الفك، وهل تحتاج إلى <a href="/services/neck-lift-surgery">شد الرقبة</a> ضمن الخطة.</p><h3>ما الذي تسأل عنه قبل حجز عملية شد الوجه؟</h3><p>اسأل عن تكلفة عملية شد الوجه بالرياض، وما يشمله السعر، وخطة التعافي والمتابعة والمخاطر المحتملة. وإذا كان سؤالك «كيف أختار أفضل دكتور شد وجه؟»، قارن التخصص والخبرة ووضوح التقييم، وليس الوعود بنتائج مضمونة. <a href="#consultation-form">أرسل اسمك وجوالك والخدمة المطلوبة</a> لتنسيق موعد الاستشارة.</p></div>`;

  return `<div class="fl-page" dir="rtl" data-facelift-optimized="1">
  <nav class="fl-top fl-wrap" aria-label="روابط صفحة شد الوجه"><a class="fl-brand" href="/" aria-label="ريجوفيرا — الرئيسية"><img src="/media/brand/facelift-logo-02.png" alt="مركز ريجوفيرا الطبي" width="562" height="563"></a><span>الرياض · مركز ريجوفيرا الطبي</span><a href="#consultation-form">طلب استشارة ←</a></nav>
  <section class="fl-hero"><div class="fl-wrap fl-hero-grid">
    <div class="fl-intro"><p class="fl-eyebrow">استشارة جراحية مع د. لؤي السالمي</p><h1>شد الوجه والرقبة بالرياض<span>خطة تناسبك، وتحافظ على ملامحك.</span></h1><p class="fl-lead">تفكر في شد الوجه؟ ابدأ بتقييم مع د. لؤي السالمي لفهم الخيارات المناسبة لترهل الوجه والرقبة وخط الفك، والتكلفة والتعافي قبل اتخاذ القرار.</p><div class="fl-doctor"><img src="/media/doctors/loai-alsalmi.webp" alt="د. لؤي السالمي" width="88" height="102" loading="eager" decoding="async" fetchpriority="high"><div><strong>د. لؤي السالمي</strong><p>استشاري جراحة التجميل والترميم</p><span>25+ سنة خبرة · العربية والإنجليزية</span></div></div><div class="fl-actions">${contacts}</div><a class="fl-text-link" href="#facelift-options">شد عميق أم شد مصغّر؟ تعرف على الخيارات ↓</a></div>
    <div class="fl-form-card" id="consultation-form"><p class="fl-eyebrow">خطوتك الأولى</p><h2>احجز تقييمك مع د. لؤي</h2><p>اترك اسمك وجوالك، وفريقنا يتواصل معك لتنسيق الموعد والإجابة عن أسئلتك.</p>${form}</div>
  </div></section>
  <section class="fl-section" id="facelift-options"><div class="fl-wrap"><p class="fl-eyebrow">الاختيار يبدأ بالتقييم</p><h2>أي نوع من شد الوجه يناسب حالتك؟</h2><div class="fl-grid fl-options"><div class="fl-card"><span class="fl-number">01</span><h3>شد الوجه العميق</h3><p>ناقش مع الطبيب ملاءمة التعامل مع الأنسجة العميقة لدرجة الترهل وأهدافك. اسم التقنية وحده لا يحدد الخيار الأفضل.</p></div><div class="fl-card"><span class="fl-number">02</span><h3>شد الوجه المصغّر</h3><p>هل الميني فيس لفت مناسب لك؟ يوضح التقييم حدود هذا الخيار ومتى تحتاج خطة أشمل للوجه والرقبة.</p></div><div class="fl-card"><span class="fl-number">03</span><h3>شد الرقبة وخط الفك</h3><p>تقييم الجلد والعضلات ومنطقة أسفل الذقن لتحديد ما إذا كان شد الرقبة منفردًا أو مع شد الوجه مناسبًا.</p></div></div><p class="fl-note">ليس كل ترهل يحتاج جراحة، وليست هناك تقنية واحدة تناسب الجميع. يشرح الطبيب البدائل والمخاطر وحدود النتيجة قبل القرار.</p></div></section>
  <section class="fl-section fl-soft" id="facelift-gallery"><div class="fl-wrap"><p class="fl-eyebrow">شاهد وناقش توقعاتك</p><h2>أمثلة قبل وبعد من المعرض الحالي</h2><p>الصور للتوضيح فقط؛ النتائج تختلف حسب الحالة ولا تمثل ضمانًا لنتيجتك.</p>${galleryImages.length === 4 ? `<div class="fl-grid fl-gallery"><figure><div class="fl-pair"><div>${galleryImages[0]}<span>قبل</span></div><div>${galleryImages[1]}<span>بعد</span></div></div><figcaption>شد الوجه والرقبة</figcaption></figure><figure><div class="fl-pair"><div>${galleryImages[2]}<span>قبل</span></div><div>${galleryImages[3]}<span>بعد</span></div></div><figcaption>شد الوجه — زاوية أمامية</figcaption></figure></div>` : "<p>اطلب مشاهدة أمثلة مناسبة لحالتك أثناء الاستشارة.</p>"}</div></section>
  <section class="fl-section" id="facelift-cost"><div class="fl-wrap fl-cost"><div><p class="fl-eyebrow">سؤالك عن السعر مهم</p><h2>كم تكلفة شد الوجه والرقبة؟</h2><p>التكلفة تتحدد بعد التقييم حسب نوع الشد، مدى التدخل، التخدير والمتابعة. اطلب توضيحًا مكتوبًا للتكلفة وما تتضمنه قبل تأكيد الإجراء.</p></div><div class="fl-card"><h3>اسأل في الاستشارة عن:</h3><ul><li>الخيار المناسب لك، وليس الأغلى بالضرورة.</li><li>ما الذي يشمله السعر وما يُحسب بشكل منفصل.</li><li>خطة التعافي والمتابعة وأي فحوص مطلوبة.</li></ul>${book}</div></div></section>
  <section class="fl-section fl-soft" id="facelift-steps"><div class="fl-wrap"><h2>من أول استفسار إلى قرار واضح</h2><ol class="fl-grid fl-steps"><li><strong>أرسل طلبك</strong><p>اسمك وجوالك والخدمة التي تفكر فيها.</p></li><li><strong>نسّق موعدك</strong><p>الفريق يؤكد التوفر ويجيب عن أسئلة الحجز.</p></li><li><strong>ناقش خطتك مع الطبيب</strong><p>التقييم، التكلفة، التعافي والمخاطر قبل القرار.</p></li></ol></div></section>
  <section class="fl-section" id="facelift-questions"><div class="fl-wrap fl-faq"><p class="fl-eyebrow">إجابات مختصرة قبل الحجز</p><h2>أسئلة عن شد الوجه والتعافي</h2><details><summary>كيف أختار أفضل دكتور شد وجه لحالتي؟</summary><p>قارن تخصص الطبيب وخبرته، وناقش حالات مشابهة وخطة الجراحة والمتابعة. اسأل ما الذي يمكن تحسينه وما حدود الإجراء، بدل الاعتماد على كلمة «أفضل» وحدها.</p></details><details><summary>هل شد الوجه يغيّر ملامحي؟</summary><p>ناقش هدفك في الحفاظ على ملامحك مع الطبيب. النتيجة الممكنة تعتمد على حالتك والخطة؛ لا يمكن ضمان نتيجة محددة قبل التقييم.</p></details><details><summary>متى أقدر أرجع للعمل؟</summary><p>تختلف مدة التعافي حسب الإجراء وطبيعة العمل. اسأل عن التورم والكدمات، العودة للنشاط، وتعليمات المتابعة الخاصة بحالتك.</p></details><details><summary>ما المخاطر التي أحتاج أعرفها؟</summary><p>اطلب شرحًا واضحًا للمضاعفات المحتملة، الندبات، التخدير وخطة التعامل معها، وأخبر الطبيب عن الأدوية والعمليات السابقة أثناء الاستشارة.</p></details><div class="fl-final"><h3>جاهز تعرف الخيار المناسب لك؟</h3><p>احجز تقييمك مع د. لؤي السالمي في ريجوفيرا بالرياض.</p><div class="fl-actions">${book}${contacts}</div></div><p class="fl-note">معلومات عامة وليست تشخيصًا أو وعدًا بنتيجة. <a href="/doctors/loai-alsalmi">ملف د. لؤي السالمي</a> · <a href="https://www.plasticsurgery.org/cosmetic-procedures/facelift/questions" target="_blank" rel="noopener noreferrer">أسئلة الاستشارة — الجمعية الأمريكية لجراحي التجميل</a></p></div></section>
  <div class="fl-wrap fl-bottom-guide">${searchGuide}</div>
  <nav class="fl-sticky" aria-label="التواصل السريع"><div><a href="#consultation-form">احجز تقييمك</a><a href="${CLINIC_PHONE_TEL}">اتصال مباشر</a><a href="${whatsapp}" target="_blank" rel="noopener noreferrer">واتساب</a></div></nav>
  </div>`;
}
