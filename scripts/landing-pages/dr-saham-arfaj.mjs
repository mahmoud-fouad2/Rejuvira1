/** Content is created from the published physician record and its published services. */
import { buildSahamWhatsappBubble } from "./saham-whatsapp.mjs";

export const SAHAM_LANDING_SLUG = "dr-saham-arfaj";
export const SAHAM_DOCTOR_SLUG = "saham-arfaj";

const serviceTopics = [
  [
    "tummy-tuck",
    "شد البطن بعد الحمل أو تغير الوزن",
    "هل المشكلة في الجلد الزائد، شكل البطن، أم أكثر من عامل؟ ابدئي بمناقشة ما يزعجك وما ترغبين في تغييره قبل تحديد الخطة.",
  ],
  [
    "sagging-skin-tightening-surgery",
    "شد الترهلات بعد نزول الوزن",
    "حددي المناطق التي تحتاج إلى تقييم، واسألي عن نطاق العملية، موضع الندبات المتوقع وكيف تُرتب مراحل العلاج إن لزم الأمر.",
  ],
  [
    "full-body-lift",
    "شد الجسم وتناسق القوام",
    "ناقشي أولوياتك عندما توجد ترهلات في أكثر من منطقة، وما يمكن تقييمه في جلسة الاستشارة قبل اتخاذ قرار بإجراء واحد أو عدة مراحل.",
  ],
  [
    "breast-lift",
    "شد الصدر وتقييم الترهل",
    "وضحي هل هدفك رفع الصدر، تعديل الشكل، أم تغيير الحجم أيضًا. اسألي عن الخيارات والندبات والمتابعة المناسبة لحالتك.",
  ],
  [
    "breast-reduction",
    "تصغير الصدر والتناسق مع الجسم",
    "ناقشي الحجم الذي ترغبين فيه، أسباب طلب التصغير وتوقعاتك من العملية، واطلبي شرحًا لحدود التغيير قبل اختيار الإجراء.",
  ],
  [
    "breast-augmentation-reshaping",
    "تكبير وتنسيق الصدر",
    "ابدئي من هدفك وتناسق الصدر مع القوام، ثم اسألي عن الخيارات المتاحة وما تتضمنه المتابعة قبل تحديد الحجم أو نوع التدخل.",
  ],
  [
    "neck-lift-surgery",
    "شد الرقبة وتقييم خط الفك",
    "إذا كان ما يشغلك ترهل الرقبة أو شكل المنطقة تحت الذقن، ناقشي موضع المشكلة وخيارات تقييمها، ومدى الحاجة إلى إجراء جراحي.",
  ],
  [
    "eyelid-lift-eye-rejuvenation",
    "شد الجفون وتجديد مظهر العين",
    "وضحي ما يزعجك في الجفون العلوية أو السفلية، واسألي عن نطاق الإجراء المتوقع والبدائل والمتابعة قبل اتخاذ القرار.",
  ],
  [
    "rhinoplasty-nose-reshaping",
    "تجميل الأنف وتناسق الملامح",
    "حددي هل ترغبين في تقييم الشكل العام، الأرنبة أو الجسر، واذكري أي مشكلة في التنفس أو عملية سابقة أثناء الاستشارة.",
  ],
];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function sahamLandingServices(doctor) {
  return serviceTopics.flatMap(([slug, heading, description]) => {
    const service = doctor.services.find(
      (item) => item.slug === slug && item.status === "PUBLISHED",
    );
    return service ? [{ ...service, heading, description }] : [];
  });
}

export function buildSahamLandingPage(doctor) {
  const name = escapeHtml(doctor.nameAr);
  const title = escapeHtml(doctor.titleAr);
  const services = sahamLandingServices(doctor);
  const hasService = (slug) =>
    services.some((service) => service.slug === slug);
  const photo = escapeHtml(
    doctor.photoUrl || "/media/doctors/saham-arfaj.webp",
  );
  const whatsapp = `https://wa.me/966114999959?text=${encodeURIComponent(`مرحبًا، أرغب في حجز استشارة مع ${doctor.nameAr} في مركز ريجوفيرا بالرياض.`)}`;
  const faqs = [
    [
      "كيف أختار أفضل دكتورة تجميل في الرياض لحالتي؟",
      "ابدئي بالتخصص المناسب للإجراء الذي تفكرين فيه، وتحققي من المؤهلات والتسجيل المهني، ثم اسألي عن خبرة الطبيبة في حالات مشابهة، الخيارات البديلة والمخاطر والمتابعة. المقارنة المفيدة تقوم على معلومات واضحة واستشارة تناسب حالتك؛ ولا يكفي وصف إعلاني وحده لاتخاذ القرار.",
    ],
    [
      "أبحث عن أحسن دكتورة تجميل؛ ما الأسئلة التي أسألها في الاستشارة؟",
      "اسألي: هل الإجراء مناسب لي؟ ما البدائل؟ ما حدود النتيجة المتوقعة؟ أين يُجرى التدخل ومن يتولى التخدير عند الحاجة؟ ما المخاطر المحتملة وكيف تتم المتابعة؟ خذي وقتك لفهم الإجابات قبل الموافقة على أي إجراء.",
    ],
    [
      "كيف أحجز موعدًا مع الدكتورة سهام العرفج في الرياض؟",
      "أرسلي الاسم ورقم الجوال من نموذج هذه الصفحة، واختاري موضوع الاستشارة أو استفسارًا عامًا. يمكنك أيضًا الاتصال أو التواصل عبر واتساب. يتواصل فريق ريجوفيرا لتأكيد الموعد والتفاصيل وفق التوفر؛ إرسال الطلب وحده لا يثبت الحجز.",
    ],
    [
      "كم سعر استشارة الدكتورة سهام العرفج وتكلفة العملية؟",
      "اطلبي من فريق المركز تأكيد رسوم الاستشارة الحالية. أما تكلفة العملية فتحتاج تحديد الإجراء ونطاقه بعد التقييم. اسألي عما يشمله السعر، مثل التخدير والمنشأة والمتابعة، وما قد يُحسب بصورة منفصلة، قبل تأكيد الحجز.",
    ],
    ...(hasService("tummy-tuck")
      ? [
          [
            "أبحث عن أفضل دكتورة شد بطن بعد الولادة؛ من أين أبدأ؟",
            "ابدئي باستشارة لتقييم المشكلة التي ترغبين في تحسينها، واذكري أي عمليات سابقة وخطط حمل مستقبلية. ناقشي الخيارات، موضع الندبات المتوقع، التعافي والمتابعة. الاختيار يعتمد على ملاءمة الخطة لحالتك وعلى فهمك لما يمكن تحقيقه.",
          ],
        ]
      : []),
    ...(hasService("neck-lift-surgery")
      ? [
          [
            "ما أفضل حل لشد الوجه والرقبة: عملية أم إجراء غير جراحي؟",
            "تحديد الخيار يحتاج فحصًا لموضع الترهل ودرجته ومناقشة هدفك والتاريخ الطبي. اسألي عن الفرق بين الخيارات، حدود التحسن المتوقع والمخاطر وفترة التعافي. لا يمكن اختيار أفضل حل لحالتك من الاسم أو الصور وحدهما.",
          ],
        ]
      : []),
    ...(hasService("breast-lift")
      ? [
          [
            "هل أحتاج شد الصدر أم تكبيره أم تصغيره؟",
            "اشرحي ما يزعجك في الشكل والحجم والترهل، ثم ناقشي الفرق بين الإجراءات وما يناسب هدفك بعد الفحص. اسألي أيضًا عن الندبات والمتابعة وتأثير خطط الحمل المستقبلية في القرار، بدل اختيار اسم العملية مسبقًا.",
          ],
        ]
      : []),
    ...(hasService("eyelid-lift-eye-rejuvenation")
      ? [
          [
            "كيف أختار دكتورة لشد الجفون في الرياض؟",
            "تحققي من التخصص والخبرة في الإجراء، واشرحي هل المشكلة في الجفون العلوية أم السفلية وما تتوقعينه من التغيير. ناقشي حدود الإجراء، المخاطر، التعافي والبدائل، واذكري أي أعراض أو علاجات سابقة للعين أثناء التقييم.",
          ],
        ]
      : []),
    [
      "متى أرجع إلى العمل بعد عملية التجميل؟",
      "اطلبي تقديرًا خاصًا بالإجراء وحالتك وطبيعة عملك، واسألي عن المساعدة التي قد تحتاجين إليها ومواعيد المتابعة. مدة التعافي واستقرار النتيجة تختلف بين الإجراءات والحالات؛ لذلك يوضح الطبيب تعليماتك وخطتك الفردية.",
    ],
    [
      "هل أقدر أعرف النتيجة من صور قبل وبعد؟",
      "الصور قد تساعدك على توضيح ما ترغبين فيه ومناقشة توقعاتك، لكنها لا تضمن تكرار نتيجة شخص آخر. اسألي عن الحالات المشابهة وحدود التغيير الممكنة لحالتك وعن المتابعة إذا كانت النتيجة مختلفة عن توقعاتك.",
    ],
  ];

  return `<section id="rv-saham" lang="ar" dir="rtl" data-uploaded-html="true" data-layout="canvas" data-header="false" data-footer="false" data-campaign-page="dr-saham-arfaj">
<style>
#rv-saham{--ink:#28133e;--text:#43384f;--muted:#716779;--purple:#5d2f94;--gold:#cda26f;--line:#e7deeb;--soft:#faf7fc;display:block;width:100%;direction:rtl;text-align:right;background:#fff;color:var(--text);font-family:"IBM Plex Sans Arabic",Tahoma,Arial,sans-serif;line-height:1.85}
#rv-saham *{box-sizing:border-box;min-width:0}
#rv-saham h1,#rv-saham h2,#rv-saham h3{font-family:"IBM Plex Sans Arabic",Tahoma,Arial,sans-serif!important}
#rv-saham .s-wrap{width:calc(100% - 40px);max-width:1180px;margin-inline:auto}
#rv-saham a{text-underline-offset:4px}
#rv-saham .s-hero{padding:34px 0 58px;background:radial-gradient(circle at 10% 5%,rgba(205,162,111,.18),transparent 27%),radial-gradient(circle at 88% 15%,rgba(93,47,148,.12),transparent 33%),linear-gradient(145deg,#fff,#f8f3fb 68%,#fff)}
#rv-saham .s-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,410px);grid-template-areas:"copy form" "profile form";gap:28px 38px;align-items:start}
#rv-saham .s-copy{grid-area:copy}
#rv-saham .s-brand{display:inline-flex;padding:10px 16px;border:1px solid var(--line);border-radius:18px;background:#fff;box-shadow:0 10px 30px rgba(40,19,62,.06)}
#rv-saham .s-brand img{display:block;width:170px;height:58px;object-fit:contain;margin:0}
#rv-saham .s-kicker{margin:22px 0 8px;color:var(--purple);font-size:13px;font-weight:700}
#rv-saham .s-title{margin:10px 0 16px;color:var(--ink);font-size:clamp(34px,4.3vw,58px);font-weight:800;line-height:1.35}
#rv-saham .s-title span{display:block;color:var(--purple)}
#rv-saham .s-intro{margin:0;color:var(--muted);font-size:16px;line-height:1.95}
#rv-saham .s-points{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 0;padding:0;list-style:none}
#rv-saham .s-points li{margin:0;padding:7px 12px;border:1px solid var(--line);border-radius:999px;background:#fff;font-size:12px;color:var(--purple)}
#rv-saham .s-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
#rv-saham .s-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 20px;border-radius:14px;background:var(--purple);color:#fff!important;font-size:14px;font-weight:700;text-decoration:none}
#rv-saham .s-btn--light{border:1px solid var(--line);background:#fff;color:var(--purple)!important}
#rv-saham a:focus-visible,#rv-saham summary:focus-visible,#rv-saham button:focus-visible{outline:3px solid var(--gold);outline-offset:4px}
#rv-saham .s-profile{grid-area:profile;display:flex;gap:22px;align-items:center;padding:24px;border-radius:24px;background:linear-gradient(135deg,#321847,#5d2f94);color:#fff}
#rv-saham .s-profile img{display:block;width:120px;height:150px;flex:0 0 120px;object-fit:cover;object-position:top;border-radius:18px;margin:0;background:#f3edf7}
#rv-saham .s-profile h2{margin:0 0 8px;color:#fff!important;font-size:23px;line-height:1.5;font-weight:700}
#rv-saham .s-profile p{margin:0 0 8px;color:#eee3f7!important;font-size:13px;line-height:1.9}
#rv-saham .s-profile a{color:#fff!important;font-size:12px}
#rv-saham .s-form-card{grid-area:form;padding:26px;border:1px solid var(--line);border-radius:28px;background:#fff;box-shadow:0 24px 65px rgba(40,19,62,.12);scroll-margin-top:20px}
#rv-saham .s-form-kicker{margin:0 0 8px;color:var(--purple);font-size:12px;font-weight:700}
#rv-saham .s-form-title{margin:0 0 10px;color:var(--ink);font-size:25px;line-height:1.5;font-weight:800}
#rv-saham .s-form-desc{margin:0 0 22px;color:var(--muted);font-size:13px;line-height:1.8}
#rv-saham .s-form{display:grid;gap:14px}
#rv-saham .s-field{display:grid;gap:7px}
#rv-saham .s-field label{color:var(--ink);font-size:12px;font-weight:700}
#rv-saham .s-field input,#rv-saham .s-field select{width:100%;min-height:49px;padding:11px 12px;border:1px solid #dcd2e5;border-radius:13px;background:#fff;color:var(--ink);font:inherit;font-size:13px}
#rv-saham .s-field input:focus,#rv-saham .s-field select:focus{outline:2px solid var(--purple);outline-offset:2px}
#rv-saham .s-submit{width:100%;min-height:52px;padding:13px 15px;border:0;border-radius:14px;background:linear-gradient(135deg,#5d2f94,#7b4ab0);color:#fff;font:inherit;font-size:14px;font-weight:700;cursor:pointer}
#rv-saham .s-privacy{margin:0;color:var(--muted);font-size:11px;line-height:1.9}
#rv-saham .s-form-contact{padding-top:18px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:12px;color:var(--purple)}
#rv-saham .s-section{padding:clamp(36px,6vw,72px) 0;scroll-margin-top:20px}
#rv-saham .s-section--soft{background:var(--soft)}
#rv-saham .s-section .s-kicker{margin:0 0 8px}
#rv-saham .s-h2{margin:0 0 16px;color:var(--ink);font-size:clamp(26px,3vw,40px);font-weight:800;line-height:1.5}
#rv-saham .s-section-intro{max-width:840px;margin:0 0 28px;color:var(--muted);font-size:14px;line-height:1.95}
#rv-saham .s-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
#rv-saham .s-card{display:flex;flex-direction:column;padding:24px;border:1px solid var(--line);border-radius:22px;background:#fff}
#rv-saham .s-card-number{margin-bottom:16px;color:var(--gold);font-size:20px;font-weight:700}
#rv-saham .s-card h3{margin:0 0 12px;color:var(--ink);font-size:18px;font-weight:700;line-height:1.6}
#rv-saham .s-card p{margin:0 0 20px;color:var(--muted);font-size:13px;line-height:1.95}
#rv-saham .s-card a{margin-top:auto;color:var(--purple);font-size:12px;font-weight:700}
#rv-saham .s-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;align-items:start}
#rv-saham .s-panel{padding:28px;border:1px solid var(--line);border-radius:24px;background:#fff}
#rv-saham .s-panel h3{margin:0 0 16px;color:var(--ink);font-size:22px;line-height:1.6;font-weight:700}
#rv-saham .s-panel ul{margin:0;padding-inline-start:22px}
#rv-saham .s-panel li{margin:10px 0;color:var(--muted);font-size:14px;line-height:1.9}
#rv-saham .s-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin:0;padding:0;list-style:none}
#rv-saham .s-steps li{margin:0}
#rv-saham .s-step-number{display:grid;place-items:center;width:42px;height:42px;margin-bottom:16px;border-radius:14px;background:#efe5f8;color:var(--purple);font-size:18px;font-weight:700}
#rv-saham .s-steps h3{margin:0 0 8px;font-size:17px;color:var(--ink);font-weight:700}
#rv-saham .s-steps p{margin:0;color:var(--muted);font-size:13px;line-height:1.9}
#rv-saham .s-faqs{display:grid;gap:12px}
#rv-saham .s-faq{padding:0 22px;border:1px solid var(--line);border-radius:16px;background:#fff}
#rv-saham .s-faq summary{padding:19px 0;color:var(--ink);font-size:14px;font-weight:700;cursor:pointer;line-height:1.8}
#rv-saham .s-faq p{margin:0 0 20px;color:var(--muted);font-size:14px;line-height:1.95}
#rv-saham .s-sources{margin-top:24px;color:var(--muted);font-size:12px;line-height:1.9}
#rv-saham .s-sources a{color:var(--purple)}
#rv-saham .s-bottom{padding:40px 28px;border-radius:28px;background:linear-gradient(135deg,#321847,#5d2f94);text-align:center;color:#fff}
#rv-saham .s-bottom h2{margin:0 0 14px;color:#fff!important;font-size:clamp(26px,3vw,38px);line-height:1.6;font-weight:700}
#rv-saham .s-bottom p{max-width:700px;margin:0 auto 22px;color:#eee3f7!important;font-size:14px;line-height:1.9}
#rv-saham .s-bottom .s-actions{justify-content:center}
#rv-saham .s-footer{padding:0 0 28px;color:var(--muted);font-size:12px}
#rv-saham .s-footer .s-wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:14px}
#rv-saham .s-footer a{color:var(--purple)}
@media(max-width:960px){#rv-saham .s-hero-grid{grid-template-columns:1fr;grid-template-areas:"copy" "profile" "form"}#rv-saham .s-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#rv-saham .s-steps{grid-template-columns:repeat(2,minmax(0,1fr))}#rv-saham .s-two{grid-template-columns:1fr}}
@media(max-width:560px){#rv-saham .s-wrap{width:calc(100% - 28px)}#rv-saham .s-hero{padding:24px 0 36px}#rv-saham .s-title{font-size:34px}#rv-saham .s-intro{font-size:14px}#rv-saham .s-profile{padding:20px;gap:16px}#rv-saham .s-profile img{width:85px;height:115px;flex-basis:85px}#rv-saham .s-profile h2{font-size:18px}#rv-saham .s-form-card{padding:22px}#rv-saham .s-grid{grid-template-columns:1fr}#rv-saham .s-card,#rv-saham .s-panel{padding:22px}#rv-saham .s-actions .s-btn{flex:1 1 140px}#rv-saham .s-h2{font-size:26px}#rv-saham .s-faq{padding-inline:16px}}
</style>
<header class="s-hero"><div class="s-wrap s-hero-grid">
  <div class="s-copy">
    <a class="s-brand" href="/" aria-label="مركز ريجوفيرا الطبي"><img src="/media/brand/logo-light-header.png" width="170" height="58" alt="مركز ريجوفيرا الطبي" loading="eager" decoding="async"></a>
    <p class="s-kicker">${title} · مركز ريجوفيرا، الرياض</p>
    <h1 class="s-title">دكتورة جراحة تجميل في الرياض <span>${name}</span></h1>
    <p class="s-intro">ابدئي باستشارة تفهم ما ترغبين في تغييره، وتوضح الخيارات التي تناسب حالتك وحدود النتيجة المتوقعة. ناقشي أسئلتك عن تجميل الوجه والجسم، وخذي قرارك بعد تقييم طبي وخطة واضحة.</p>
    <ul class="s-points"><li>استشارة مع الدكتورة سهام</li><li>مناقشة الخيارات والبدائل</li><li>خطة للتعافي والمتابعة</li></ul>
    <div class="s-actions"><a class="s-btn" href="#saham-consultation">اطلبي استشارة مع الدكتورة</a><a class="s-btn s-btn--light" href="#saham-services">استكشفي موضوعات الاستشارة</a></div>
  </div>
  <aside class="s-form-card" id="saham-consultation" aria-label="طلب استشارة مع الدكتورة سهام العرفج">
    <p class="s-form-kicker">طلب موعد · الدكتورة سهام العرفج</p>
    <h2 class="s-form-title">خطوتك الأولى نحو قرار أوضح</h2>
    <p class="s-form-desc">اتركي بيانات التواصل واختاري موضوع استشارتك. يتواصل فريق ريجوفيرا معك لتأكيد التفاصيل والموعد وفق التوفر.</p>
    <form class="s-form" method="post" action="/api/leads">
      <input type="hidden" name="source" value="صفحة الدكتورة سهام العرفج - طلب استشارة">
      <input type="hidden" name="message" value="طلب استشارة مع الدكتورة سهام العرفج">
      <input type="hidden" name="preferredLanguage" value="ar">
      <div class="s-field"><label for="saham-name">الاسم الكامل *</label><input id="saham-name" name="fullName" type="text" required minlength="3" maxlength="120" autocomplete="name" placeholder="اكتبي اسمك الكامل"></div>
      <div class="s-field"><label for="saham-phone">رقم الجوال *</label><input id="saham-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" dir="ltr" placeholder="05xxxxxxxx"></div>
      <div class="s-field"><label for="saham-service">موضوع الاستشارة *</label><select id="saham-service" name="serviceSlug" required><option value="" disabled selected>اختاري موضوع الاستشارة</option>${services.map((service) => `<option value="${escapeHtml(service.slug)}">${escapeHtml(service.nameAr)}</option>`).join("")}<option value="general-inquiry">استشارة عامة مع الدكتورة سهام — لم أحدد الإجراء</option></select></div>
      <button class="s-submit" type="submit">إرسال طلب استشارة مع الدكتورة سهام</button>
      <p class="s-privacy">إرسال الطلب لا يثبت الموعد تلقائيًا؛ يؤكده الفريق بعد التواصل. بإرسال الطلب، أنت توافقين على استخدام بياناتك للتواصل وفق <a href="/privacy">سياسة الخصوصية</a>.</p>
    </form>
    <div class="s-form-contact"><a href="tel:0553999514">اتصال مباشر <span dir="ltr">0553999514</span></a><a href="${whatsapp}" target="_blank" rel="noopener noreferrer">استفسري عبر واتساب</a></div>
  </aside>
  <div class="s-profile"><img src="${photo}" width="120" height="150" alt="${name}، ${title}" loading="eager" decoding="async"><div><h2>تعرّفي على ${name}</h2><p>${title}. تبدأ الاستشارة من فهم احتياجك ومناقشة القرار الجراحي والخطوات والمتابعة المتوقعة.</p><a href="/doctors/saham-arfaj">اطلعي على الملف الطبي للدكتورة ←</a></div></div>
</div></header>
${services.length ? `<section class="s-section" id="saham-services"><div class="s-wrap"><p class="s-kicker">الوجه والجسم · موضوعات للاستشارة</p><h2 class="s-h2">ما الذي ترغبين في تقييمه مع الدكتورة سهام؟</h2><p class="s-section-intro">هذه موضوعات مرتبطة بالخدمات المنشورة في ملف الدكتورة بالمركز. استعرضي دليل الخدمة، ثم اطلبي استشارة لمناقشة ملاءمتها لحالتك؛ تحديد الإجراء وإمكانية إجرائه يأتي بعد التقييم.</p><div class="s-grid">${services.map((service, index) => `<article class="s-card"><span class="s-card-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(service.heading)}</h3><p>${escapeHtml(service.description)}</p><a href="/services/${encodeURIComponent(service.slug)}">دليل ${escapeHtml(service.nameAr)} ←</a></article>`).join("")}</div></div></section>` : ""}
<section class="s-section s-section--soft"><div class="s-wrap"><p class="s-kicker">قبل اختيار الطبيبة أو العملية</p><h2 class="s-h2">تبحثين عن أفضل دكتورة تجميل في الرياض؟</h2><p class="s-section-intro">حوّلي البحث إلى أسئلة محددة: ما التخصص المناسب؟ هل توجد خبرة في الإجراء الذي تفكرين فيه؟ وهل فهمتِ الخيارات والمخاطر والمتابعة؟ هذه المعلومات تساعدك على مقارنة الاستشارات واختيار ما يناسبك.</p><div class="s-two"><div class="s-panel"><h3>كيف تقارنين بين الخيارات؟</h3><ul><li>تحققي من تخصص الطبيبة ومؤهلاتها وتسجيلها المهني.</li><li>اسألي عن تقييم حالات مشابهة وأهداف واقعية للإجراء.</li><li>ناقشي البدائل، مكان الإجراء والمخاطر المحتملة.</li><li>اطلبي تفاصيل التعافي والمتابعة والتكلفة قبل اتخاذ القرار.</li></ul></div><div class="s-panel"><h3>ما الذي تحضّرينه للاستشارة؟</h3><ul><li>أكثر ما يزعجك والهدف الذي ترغبين في الوصول إليه.</li><li>تاريخك الصحي والأدوية والحساسية وأي عمليات سابقة.</li><li>أسئلتك عن الندبات، العودة للعمل ووقت استقرار النتيجة.</li><li>التقارير المتاحة وخططك التي قد تؤثر في توقيت الإجراء.</li></ul></div></div></div></section>
<section class="s-section"><div class="s-wrap"><p class="s-kicker">من الطلب إلى الاستشارة</p><h2 class="s-h2">كيف تحجزين مع الدكتورة سهام العرفج؟</h2><ol class="s-steps"><li><span class="s-step-number" aria-hidden="true">1</span><h3>أرسلي طلبك</h3><p>الاسم ورقم الجوال وموضوع الاستشارة، أو اختاري الاستفسار العام.</p></li><li><span class="s-step-number" aria-hidden="true">2</span><h3>تأكيد الموعد</h3><p>يراجع فريق المركز الطلب ويتواصل معك لتأكيد التفاصيل وفق التوفر.</p></li><li><span class="s-step-number" aria-hidden="true">3</span><h3>مناقشة الحالة</h3><p>وضحي هدفك وتاريخك الطبي وأسئلتك أثناء التقييم مع الدكتورة.</p></li><li><span class="s-step-number" aria-hidden="true">4</span><h3>قرار بعد التقييم</h3><p>ناقشي الخطة والبدائل والمخاطر والمتابعة قبل الموافقة على أي إجراء.</p></li></ol></div></section>
<section class="s-section s-section--soft" id="saham-questions"><div class="s-wrap"><p class="s-kicker">أسئلة قبل الحجز</p><h2 class="s-h2">إجابات تساعدك على اختيار استشارتك</h2><div class="s-faqs">${faqs.map(([question, answer]) => `<details class="s-faq"><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("")}</div><p class="s-sources">لتحضير أسئلتك، يمكنك مراجعة إرشادات الجمعية الأمريكية لجراحي التجميل: <a href="https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck/questions" target="_blank" rel="noopener noreferrer">أسئلة استشارة شد البطن</a> و<a href="https://www.plasticsurgery.org/cosmetic-procedures/neck-lift/questions" target="_blank" rel="noopener noreferrer">أسئلة استشارة شد الرقبة</a>. هذه معلومات عامة للتحضير؛ توصيات الإجراء تُحدد بعد التقييم الطبي.</p></div></section>
<section class="s-section"><div class="s-wrap"><div class="s-bottom"><h2>ابدئي باستشارة مع ${name}</h2><p>سواء حددتِ الإجراء أو ما زلتِ تقارنين الخيارات، اطلبي موعدًا في مركز ريجوفيرا بالرياض لمناقشة ما يناسب حالتك. يؤكد الفريق رسوم الاستشارة والتفاصيل والموعد قبل الحجز.</p><div class="s-actions"><a class="s-btn s-btn--light" href="#saham-consultation">اطلبي موعدك الآن</a><a class="s-btn s-btn--light" href="${whatsapp}" target="_blank" rel="noopener noreferrer">استشارة الدكتورة سهام عبر واتساب</a></div></div></div></section>
<footer class="s-footer"><div class="s-wrap"><span>مركز ريجوفيرا الطبي · الرياض، المملكة العربية السعودية</span><span><a href="/contact">الموقع وطرق التواصل</a> · <a href="/doctors/saham-arfaj">الملف الطبي</a> · <a href="/privacy">الخصوصية</a></span></div></footer>
</section>${buildSahamWhatsappBubble()}`;
}

export async function seedSahamLandingPage(prisma) {
  // Protect both the normal slug and an alias assigned to another CMS page.
  const existing = await prisma.customPage.findFirst({
    where: {
      OR: [{ slug: SAHAM_LANDING_SLUG }, { seoSlug: SAHAM_LANDING_SLUG }],
    },
    select: { id: true },
  });
  if (existing) return { created: false, reason: "existing-page-preserved" };
  const doctor = await prisma.doctor.findUnique({
    where: { slug: SAHAM_DOCTOR_SLUG },
    include: { services: { where: { status: "PUBLISHED" } } },
  });
  if (!doctor || doctor.status !== "PUBLISHED") {
    return { created: false, reason: "published-doctor-required" };
  }
  const seoTitle = `${doctor.nameAr} | دكتورة جراحة تجميل في الرياض`;
  const description =
    "احجزي استشارة مع الدكتورة سهام العرفج في ريجوفيرا بالرياض. تعرّفي على موضوعات الاستشارة، وأسئلة اختيار دكتورة تجميل وخطوات التقييم والتكلفة والحجز.";
  await prisma.customPage.upsert({
    where: { slug: SAHAM_LANDING_SLUG },
    create: {
      slug: SAHAM_LANDING_SLUG,
      titleAr: "د. سهام العرفج — استشارة جراحة التجميل في الرياض",
      htmlContent: buildSahamLandingPage(doctor),
      seoTitle,
      metaTitle: seoTitle,
      seoDescription: description,
      metaDescription: description,
      ogTitle: seoTitle,
      ogDescription: description,
      ogImage: doctor.photoUrl || "/media/doctors/saham-arfaj.webp",
      keywords: [
        "دكتورة سهام العرفج",
        "استشارة سهام العرفج الرياض",
        "دكتورة جراحة تجميل في الرياض",
        "كيف أختار أفضل دكتورة تجميل",
        "أحسن دكتورة تجميل لحالتي",
        "حجز دكتورة سهام العرفج",
        "تكلفة استشارة جراحة تجميل بالرياض",
      ],
      status: "PUBLISHED",
      noindex: false,
      leadWebhookEnabled: false,
    },
    // Empty update protects changes even if another deployment creates it first.
    update: {},
  });
  return { created: true, reason: "created" };
}
