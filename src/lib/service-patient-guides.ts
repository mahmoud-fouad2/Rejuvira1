export type PatientQuestion = {
  questionAr: string;
  answerAr: string;
  questionEn: string;
  answerEn: string;
};

// The date of this versioned public content, not the time of a sitemap request.
export const SERVICE_PATIENT_CONTENT_UPDATED_AT = "2026-10-04";

export function serviceContentModifiedAt(databaseDate?: string): string {
  return databaseDate &&
    Date.parse(databaseDate) > Date.parse(SERVICE_PATIENT_CONTENT_UPDATED_AT)
    ? databaseDate
    : SERVICE_PATIENT_CONTENT_UPDATED_AT;
}

export type PatientGuide = {
  slugs: readonly string[];
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  questions: readonly PatientQuestion[];
  sources: readonly { url: string; titleAr: string; titleEn: string }[];
  relatedSlugs: readonly string[];
  articleSlugs: readonly string[];
};

const asps = (procedure: string, nameAr: string, nameEn: string) => ({
  url: `https://www.plasticsurgery.org/cosmetic-procedures/${procedure}`,
  titleAr: `الجمعية الأمريكية لجراحي التجميل: ${nameAr}`,
  titleEn: `American Society of Plastic Surgeons: ${nameEn}`,
});
const aad = (path: string, nameAr: string, nameEn: string) => ({
  url: `https://www.aad.org/public/cosmetic/${path}`,
  titleAr: `الأكاديمية الأمريكية للأمراض الجلدية: ${nameAr}`,
  titleEn: `American Academy of Dermatology: ${nameEn}`,
});

// Educational summaries checked against the linked primary sources on 2026-10-04.
// These are not individualized plans or a claim of review by a clinic physician.
export const patientGuides: readonly PatientGuide[] = [
  {
    slugs: ["face-neck-lift", "facelift-surgery"],
    titleAr: "شد الوجه والرقبة: الفرق بين الترهل وفقدان الامتلاء",
    titleEn: "Face and neck lifting: laxity versus volume loss",
    summaryAr:
      "شد الوجه الجراحي يستهدف علامات الترهل في الوجه وخط الفك والرقبة. فقدان الامتلاء وجودة سطح البشرة قد يحتاجان مناقشة خيارات مختلفة؛ لذلك تبدأ المقارنة بتحديد ما تريد تحسينه، وليس باسم تقنية معينة.",
    summaryEn:
      "A surgical facelift addresses laxity in the face, jawline and neck. Volume loss and skin texture may call for discussing different options. Start the comparison with what you want to improve rather than a technique name.",
    questions: [
      {
        questionAr: "شد الوجه بالجراحة أو الفيلر، وش الفرق؟",
        answerAr:
          "الجراحة تستهدف ترهل الأنسجة، بينما يستخدم الفيلر لاستعادة الامتلاء في مناطق محددة. لا يقدمان النتيجة نفسها. ناقش مع الطبيب هل المشكلة ترهل أم فقدان حجم، وما حدود كل خيار ومخاطره.",
        questionEn: "How does a facelift differ from fillers?",
        answerEn:
          "Surgery addresses tissue laxity; fillers restore fullness in selected areas. Their results are different. Ask whether your concern is laxity or volume loss and discuss each option's limitations and risks.",
      },
      {
        questionAr: "هل شد الوجه يوقف ظهور علامات العمر؟",
        answerAr:
          "شد الوجه لا يوقف التقدم في العمر. اسأل عن النتيجة الواقعية وكيف تتم المتابعة، وتجنب اختيار الإجراء على أساس وعد بنتيجة دائمة أو مضمونة.",
        questionEn: "Does a facelift stop aging?",
        answerEn:
          "A facelift does not stop aging. Ask about realistic results and follow-up rather than choosing a procedure based on a permanent or guaranteed outcome.",
      },
    ],
    sources: [asps("facelift", "شد الوجه", "Facelift")],
    relatedSlugs: [
      "neck-lift-surgery",
      "dermal-fillers",
      "eyelid-lift-eye-rejuvenation",
    ],
    articleSlugs: [
      "face-neck-lift-threads-fillers",
      "choose-plastic-surgeon-riyadh",
    ],
  },
  {
    slugs: ["neck-lift-surgery"],
    titleAr: "شد الرقبة واللغلوغ: ما الذي يحتاجه التقييم؟",
    titleEn: "Neck lift and double chin: what needs assessment?",
    summaryAr:
      "قد يجمع مظهر الرقبة بين دهون أسفل الذقن وترهل الجلد وتغير حدود الفك. شد الرقبة الجراحي يعالج مشكلات في هذه المنطقة، لكن خطة كل حالة تعتمد على الفحص ونطاق التحسين المطلوب.",
    summaryEn:
      "Neck appearance can involve fat beneath the chin, loose skin and changes in the jawline. A surgical neck lift addresses concerns in this area; each plan depends on examination and the scope of improvement sought.",
    questions: [
      {
        questionAr: "هل شفط اللغلوغ يغني عن شد الرقبة؟",
        answerAr:
          "إزالة الدهون وشد الجلد هدفان مختلفان. اطلب من الطبيب توضيح دور الدهون ومرونة الجلد في حالتك، ولماذا يقترح شفطًا أو شدًا أو خطة تجمع إجراءات، مع مناقشة المخاطر والبدائل.",
        questionEn: "Can double-chin liposuction replace a neck lift?",
        answerEn:
          "Removing fat and addressing loose skin are different goals. Ask how fat and skin elasticity affect your case and why liposuction, a lift or combined procedures are proposed, including risks and alternatives.",
      },
    ],
    sources: [asps("neck-lift", "شد الرقبة", "Neck lift")],
    relatedSlugs: ["double-chin-liposuction", "facelift-surgery"],
    articleSlugs: ["face-neck-lift-threads-fillers"],
  },
  {
    slugs: ["double-chin-liposuction"],
    titleAr: "شفط اللغلوغ: الدهون ومرونة الجلد",
    titleEn: "Double-chin liposuction: fat and skin elasticity",
    summaryAr:
      "عند التفكير في شفط دهون أسفل الذقن، من المهم مناقشة مرونة الجلد بجانب كمية الدهون. إزالة الدهون وحدها لا تعني أن ترهل الجلد سيُعالج بالقدر المطلوب.",
    summaryEn:
      "When considering fat removal beneath the chin, discuss skin elasticity as well as fat volume. Fat removal alone does not mean loose skin will be addressed to the extent you want.",
    questions: [
      {
        questionAr: "كيف أعرف إذا اللغلوغ دهون أو ترهل؟",
        answerAr:
          "يحتاج التفريق إلى تقييم الطبيب. وضح ما يزعجك في منطقة الذقن والفك، واسأل عن أثر مرونة الجلد في اختيار الإجراء وحدود النتيجة المتوقعة.",
        questionEn:
          "How can I tell whether a double chin is fat or loose skin?",
        answerEn:
          "A doctor needs to assess the area. Explain your chin and jawline concerns and ask how skin elasticity influences procedure choice and the limits of the expected result.",
      },
    ],
    sources: [asps("liposuction", "شفط الدهون", "Liposuction")],
    relatedSlugs: ["neck-lift-surgery", "face-neck-lift"],
    articleSlugs: ["face-neck-lift-threads-fillers"],
  },
  {
    slugs: ["liposuction", "Liposuction", "body-contouring"],
    titleAr: "شفط الدهون أم شد الجلد؟ مقارنة تبدأ من الهدف",
    titleEn: "Liposuction or skin tightening? Compare the goals",
    summaryAr:
      "شفط الدهون يستهدف تجمعات الدهون لتحسين شكل المنطقة، وليس علاجًا للسمنة أو بديلًا عن نمط حياة صحي. مرونة الجلد مهمة؛ وجود جلد زائد قد يستدعي مناقشة إجراء مختلف.",
    summaryEn:
      "Liposuction targets fat deposits to change an area's contour. It is not obesity treatment or a substitute for a healthy lifestyle. Skin elasticity matters; excess skin may require discussion of a different procedure.",
    questions: [
      {
        questionAr: "شفط الدهون وشد البطن نفس العملية؟",
        answerAr:
          "شفط الدهون يركز على تجمعات الدهون، بينما شد البطن يتعامل أيضًا مع الجلد الزائد وقد يشمل إصلاح ضعف عضلات البطن. اسأل عن الهدف من كل إجراء وما يناسب الفحص في حالتك.",
        questionEn: "Are liposuction and a tummy tuck the same operation?",
        answerEn:
          "Liposuction focuses on fat deposits. A tummy tuck also addresses excess skin and may include repair of weakened abdominal muscles. Discuss each procedure's purpose and what your assessment supports.",
      },
    ],
    sources: [
      asps("liposuction", "شفط الدهون", "Liposuction"),
      asps("tummy-tuck", "شد البطن", "Tummy tuck"),
    ],
    relatedSlugs: ["tummy-tuck", "sagging-skin-tightening-surgery"],
    articleSlugs: [
      "liposuction-vs-body-contouring",
      "body-contouring-after-weight-loss",
    ],
  },
  {
    slugs: ["tummy-tuck"],
    titleAr: "شد البطن بعد الولادة أو نزول الوزن: أسئلة قبل القرار",
    titleEn:
      "Tummy tuck after pregnancy or weight loss: questions before deciding",
    summaryAr:
      "شد البطن يزيل الجلد والدهون الزائدة، وقد يتضمن إصلاح العضلات الضعيفة أو المتباعدة. عند الاستشارة ناقش ثبات الوزن وخطط الحمل المستقبلية والفرق بين تحسين الشكل وعلاج الوزن.",
    summaryEn:
      "A tummy tuck removes excess skin and fat and may repair weakened or separated muscles. Discuss weight stability, future pregnancy plans and the difference between contour improvement and weight treatment.",
    questions: [
      {
        questionAr: "هل شفط الدهون وحده يكفي لترهل البطن بعد الولادة؟",
        answerAr:
          "إزالة الدهون لا تستهدف الجلد الزائد بالطريقة نفسها التي يستهدفه بها شد البطن. اطلب تقييم الجلد والعضلات والدهون، ثم شرح البدائل والمخاطر ومواضع الندبات قبل اختيار العملية.",
        questionEn:
          "Is liposuction alone enough for loose abdominal skin after pregnancy?",
        answerEn:
          "Fat removal does not address excess skin in the same way as a tummy tuck. Request assessment of skin, muscles and fat, then discuss alternatives, risks and scar locations before choosing surgery.",
      },
    ],
    sources: [asps("tummy-tuck", "شد البطن", "Tummy tuck")],
    relatedSlugs: ["liposuction", "full-body-lift"],
    articleSlugs: [
      "tummy-tuck-after-pregnancy-weight-loss",
      "prepare-for-aesthetic-consultation",
    ],
  },
  {
    slugs: ["full-body-lift", "sagging-skin-tightening-surgery"],
    titleAr: "ترهل الجلد بعد نزول الوزن: تحديد المناطق والخطة",
    titleEn: "Loose skin after weight loss: defining areas and the plan",
    summaryAr:
      "شد الجسم يستهدف الجلد والأنسجة المترهلة، وقد تختلف المناطق المشمولة من حالة لأخرى. لا يعني اسم «شد الجسم» أن كل المناطق ستُعالج في عملية واحدة؛ اطلب وصفًا محددًا لنطاق الخطة.",
    summaryEn:
      "A body lift addresses sagging skin and supporting tissue. The areas treated vary. A 'body lift' does not mean every area will be treated in one operation; request a precise description of the plan's scope.",
    questions: [
      {
        questionAr: "وش أفضل حل للجلد الزائد بعد نزول الوزن؟",
        answerAr:
          "اسأل عن تقييم مرونة الجلد والمناطق التي تحتاج شدًا، وهل تقترح الخطة مراحل منفصلة. ناقش الندبات والتعافي وحدود التحسين بدل مقارنة أسماء عمليات فقط.",
        questionEn:
          "What is the best option for excess skin after weight loss?",
        answerEn:
          "Ask about skin elasticity, which areas need a lift and whether separate stages are proposed. Discuss scars, recovery and improvement limits rather than comparing procedure names alone.",
      },
    ],
    sources: [asps("body-lift", "شد الجسم", "Body lift")],
    relatedSlugs: ["arm-lift", "thigh-lift", "tummy-tuck"],
    articleSlugs: ["body-contouring-after-weight-loss"],
  },
  {
    slugs: ["breast-lift"],
    titleAr: "شد الثدي أو تكبيره: الفرق بين الوضع والحجم",
    titleEn: "Breast lift or augmentation: position versus volume",
    summaryAr:
      "شد الثدي يستهدف الترهل بإزالة الجلد الزائد وإعادة تشكيل الأنسجة. زيادة الحجم هدف مختلف، لذلك من المهم شرح هل المطلوب رفع الثدي أم زيادة الامتلاء أم مناقشة الاثنين.",
    summaryEn:
      "A breast lift addresses sagging by removing excess skin and reshaping tissue. Increasing volume is a different goal. Explain whether you want a lift, more fullness or discussion of both.",
    questions: [
      {
        questionAr: "هل شد الثدي يكبر الحجم؟",
        answerAr:
          "شد الثدي وحده لا يهدف إلى زيادة الحجم بشكل كبير. إذا كان الهدف امتلاء أكبر، ناقشي الفرق بين الشد والتكبير وإمكانية الجمع بينهما بعد التقييم، مع المخاطر والمتابعة.",
        questionEn: "Does a breast lift increase breast size?",
        answerEn:
          "A lift alone does not aim to significantly increase size. If you want greater fullness, discuss lifting versus augmentation and whether combining them is appropriate after assessment, including risks and follow-up.",
      },
    ],
    sources: [asps("breast-lift", "شد الثدي", "Breast lift")],
    relatedSlugs: ["breast-augmentation-reshaping", "breast-reduction"],
    articleSlugs: ["breast-augmentation-size-riyadh"],
  },
  {
    slugs: ["breast-augmentation-reshaping"],
    titleAr: "تكبير الثدي: اختيار الحجم ومناقشة الترهل",
    titleEn: "Breast augmentation: discussing size and sagging",
    summaryAr:
      "تكبير الثدي يستهدف زيادة الامتلاء وتحسين التناسب. زيادة الحجم وحدها لا تعالج الترهل الشديد، وقد يحتاج الأمر إلى مناقشة الشد كهدف منفصل مع الطبيب.",
    summaryEn:
      "Breast augmentation aims to increase fullness and improve proportion. Increasing volume alone does not correct severe sagging; lifting may need to be discussed as a separate goal with the doctor.",
    questions: [
      {
        questionAr: "كيف أختار حجم تكبير الثدي المناسب لجسمي؟",
        answerAr:
          "وضحي النتيجة التي تريدينها، واطلبي شرح الخيارات وحدودها بحسب الفحص. ناقشي الترهل ونوع الإجراء ومخاطره وخطة المتابعة، ولا تعتمدي مقاسًا من تجربة شخص آخر.",
        questionEn: "How do I choose a breast augmentation size for my body?",
        answerEn:
          "Explain the result you want and request an assessment-based explanation of options and limitations. Discuss sagging, procedure type, risks and follow-up rather than choosing a size from someone else's experience.",
      },
    ],
    sources: [
      asps("breast-augmentation", "تكبير الثدي", "Breast augmentation"),
    ],
    relatedSlugs: ["breast-lift", "breast-implant-replacement"],
    articleSlugs: ["breast-augmentation-size-riyadh"],
  },
  {
    slugs: ["rhinoplasty", "rhinoplasty-nose-reshaping"],
    titleAr: "تجميل الأنف: الشكل والتنفس في الاستشارة",
    titleEn: "Rhinoplasty: appearance and breathing at consultation",
    summaryAr:
      "تجميل الأنف يناقش تناسب الأنف مع الوجه، وقد يشمل علاج مشكلة تنفس مرتبطة ببنية الأنف. الهدف التجميلي والتقييم الوظيفي يحتاجان شرحًا واضحًا قبل الاتفاق على الخطة.",
    summaryEn:
      "Rhinoplasty concerns nasal proportions and may address breathing problems related to nasal structure. Cosmetic goals and functional assessment need a clear explanation before agreeing on a plan.",
    questions: [
      {
        questionAr: "هل عملية تجميل الأنف تشمل علاج مشكلة التنفس؟",
        answerAr:
          "قد تعالج الجراحة بعض المشكلات البنيوية المؤثرة في التنفس، لكن ذلك يتطلب تقييمًا محددًا. اذكر صعوبة التنفس للطبيب واسأل هل الخطة تجميلية فقط أم تشمل هدفًا وظيفيًا أيضًا.",
        questionEn:
          "Does rhinoplasty include treatment for breathing problems?",
        answerEn:
          "Surgery can address some structural causes of breathing impairment, subject to specific assessment. Tell the doctor about breathing difficulties and ask whether the plan has cosmetic goals only or functional goals as well.",
      },
    ],
    sources: [asps("rhinoplasty", "تجميل الأنف", "Rhinoplasty")],
    relatedSlugs: ["facial-contouring"],
    articleSlugs: ["rhinoplasty-face-balance"],
  },
  {
    slugs: ["upper-lower-eyelid-surgery", "eyelid-lift-eye-rejuvenation"],
    titleAr: "شد الجفون: العلوي والسفلي وهدف العملية",
    titleEn: "Eyelid surgery: upper lids, lower lids and procedure goals",
    summaryAr:
      "جراحة الجفون قد تستهدف الجفن العلوي أو السفلي أو كليهما. تقييم الجلد الزائد والانتفاخ وأي مشكلة وظيفية يساعد الطبيب على تحديد نطاق العملية بدل افتراض أن كل تجميل حول العين إجراء واحد.",
    summaryEn:
      "Eyelid surgery may address upper lids, lower lids or both. Assessment of excess skin, puffiness and functional concerns helps define the operation's scope instead of treating every concern around the eyes as the same procedure.",
    questions: [
      {
        questionAr: "كيف أعرف أحتاج شد جفن علوي أو سفلي؟",
        answerAr:
          "حدد ما يزعجك، مثل الجلد الزائد أعلى العين أو الانتفاخ أسفلها، وأبلغ الطبيب عن أي تأثير على الرؤية. اسأل عن المنطقة التي ستعالج وحدود التحسين والمخاطر قبل القرار.",
        questionEn:
          "How do I know whether I need upper or lower eyelid surgery?",
        answerEn:
          "Identify concerns such as excess upper-lid skin or lower-lid puffiness, and report any effect on vision. Discuss the treatment area, improvement limits and risks before deciding.",
      },
    ],
    sources: [asps("eyelid-surgery", "جراحة الجفون", "Eyelid surgery")],
    relatedSlugs: ["facelift-surgery", "dermatology-consultation"],
    articleSlugs: ["choose-plastic-surgeon-riyadh"],
  },
  {
    slugs: ["botox"],
    titleAr: "البوتكس: هدف الحقن قبل اختيار الجلسة",
    titleEn: "Botulinum toxin: define the goal before treatment",
    summaryAr:
      "يستخدم البوتولينوم توكسين لتقليل بعض خطوط التعبير عبر إرخاء عضلات محددة. تحديد المنطقة والهدف والمادة المستخدمة مع الطبيب أهم من اختيار جلسة على أساس اسم تجاري أو عرض فقط.",
    summaryEn:
      "Botulinum toxin reduces certain expression lines by relaxing selected muscles. Discuss the area, purpose and product with the doctor instead of choosing treatment based only on a brand or offer.",
    questions: [
      {
        questionAr: "كيف أعرف إذا خطوط الوجه تحتاج بوتكس؟",
        answerAr:
          "اطلب تقييم الخطوط وتوضيح ما يستهدفه الحقن وما لا يستهدفه. اسأل عن المادة والمخاطر والمتابعة والتوقعات الواقعية قبل الموافقة على الخطة.",
        questionEn:
          "How do I know whether my facial lines need botulinum toxin?",
        answerEn:
          "Request assessment of the lines and an explanation of what injections can and cannot address. Ask about the product, risks, follow-up and realistic expectations before agreeing on the plan.",
      },
    ],
    sources: [
      aad(
        "wrinkles/botulinum-toxin-overview",
        "البوتولينوم توكسين",
        "Botulinum toxin overview",
      ),
    ],
    relatedSlugs: ["dermal-fillers", "skin-rejuvenation"],
    articleSlugs: ["injectables-trust-framework"],
  },
  {
    slugs: ["dermal-fillers", "injectable-harmony"],
    titleAr: "الفيلر: استعادة الامتلاء ومناقشة الخطة",
    titleEn: "Fillers: restoring fullness and discussing the plan",
    summaryAr:
      "الفيلر يستخدم لاستعادة الامتلاء في مناطق محددة. المنطقة والهدف ونوع المادة نقاط أساسية في الاستشارة؛ ولا تعني زيادة الكمية تلقائيًا نتيجة أفضل.",
    summaryEn:
      "Fillers restore fullness in selected areas. The area, purpose and product type are key consultation points. A greater quantity does not automatically mean a better result.",
    questions: [
      {
        questionAr: "كيف أختار أفضل فيلر يناسب وجهي؟",
        answerAr:
          "ناقش المنطقة والنتيجة المطلوبة، واطلب اسم المادة وشرح سبب اختيارها وحدودها ومخاطرها وخطة المتابعة. الأفضل يُناقش حسب حالتك، وليس شهرة المنتج وحدها.",
        questionEn: "How do I choose the best filler for my face?",
        answerEn:
          "Discuss the area and desired result. Request the product name and an explanation of its selection, limits, risks and follow-up. Suitability depends on your case rather than product popularity alone.",
      },
    ],
    sources: [aad("wrinkles/fillers-overview", "الفيلر", "Fillers overview")],
    relatedSlugs: ["botox", "facial-contouring"],
    articleSlugs: ["injectables-trust-framework"],
  },
  {
    slugs: ["laser-hair-removal"],
    titleAr: "إزالة الشعر بالليزر: البشرة والشعر وخطة الجلسات",
    titleEn: "Laser hair removal: skin, hair and the treatment plan",
    summaryAr:
      "نتيجة إزالة الشعر بالليزر وخطة الجلسات تتأثر بلون البشرة والشعر وسماكته والمنطقة والجهاز المستخدم. اسأل عن ملاءمة الخطة لبشرتك وتعليمات العناية، بما فيها الحماية من الشمس.",
    summaryEn:
      "Laser hair removal results and the treatment plan depend on skin color, hair color and thickness, the area and the laser used. Ask about suitability for your skin and aftercare, including sun protection.",
    questions: [
      {
        questionAr: "كم جلسة ليزر أحتاج، وهل العدد واحد للجميع؟",
        answerAr:
          "العدد ليس واحدًا لكل الحالات. اطلب خطة تخص المنطقة ولون الشعر والبشرة، واسأل كيف ستُراجع الاستجابة ومتى تناقش جلسات المتابعة، بدل الاعتماد على عدد ثابت في إعلان.",
        questionEn:
          "How many laser sessions do I need, and is the number the same for everyone?",
        answerEn:
          "The number varies. Request a plan for your treatment area, hair and skin characteristics. Ask how response will be reviewed and when maintenance may be discussed rather than relying on a fixed advertised number.",
      },
    ],
    sources: [
      aad(
        "hair-removal/laser-hair-removal-faqs",
        "أسئلة إزالة الشعر بالليزر",
        "Laser hair removal FAQs",
      ),
    ],
    relatedSlugs: ["dermatology-consultation"],
    articleSlugs: ["skin-renewal-timing"],
  },
];

export function servicePatientGuide(slug: string): PatientGuide | undefined {
  return patientGuides.find((guide) => guide.slugs.includes(slug));
}
