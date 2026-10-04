export type ServiceSearchQuestion = {
  questionAr: string;
  answerAr: string;
  questionEn: string;
  answerEn: string;
};

const chooseDoctor: ServiceSearchQuestion = {
  questionAr: "كيف أختار أفضل دكتور تجميل لحالتي؟",
  answerAr:
    "راجع تخصص الطبيب ومؤهلاته المعلنة، واسأل عن خبرته في الإجراء الذي تفكر فيه. خلال الاستشارة ناقش الخطة، والنتيجة الممكنة وحدودها، والمخاطر والمتابعة، حتى تقارن الخيارات بناءً على معلومات واضحة.",
  questionEn: "How do I choose the best cosmetic doctor for my needs?",
  answerEn:
    "Review the doctor's stated qualifications and specialty, and ask about experience with the procedure you are considering. Discuss the plan, possible results and limitations, risks, and follow-up so you can compare options with clear information.",
};
const price: ServiceSearchQuestion = {
  questionAr: "كم تكلفة الإجراء في الرياض، وش يشمل السعر؟",
  answerAr:
    "اطلب عرضًا يوضح الإجراء المقترح والبنود المشمولة وغير المشمولة، بما فيها الفحوص والتخدير عند الحاجة والمتابعة. عند مقارنة الأسعار، تأكد من مقارنة نطاق الخدمة نفسه، وتواصل مع المركز لمعرفة تفاصيل العرض الخاص بحالتك.",
  questionEn:
    "How much does the procedure cost in Riyadh, and what is included?",
  answerEn:
    "Request a quote that identifies the proposed procedure and what is included or excluded, including tests, anesthesia when needed, and follow-up. Compare the same scope of care, and contact the center for the details of your individual quote.",
};
const recovery: ServiceSearchQuestion = {
  questionAr: "متى أقدر أرجع الدوام بعد الإجراء؟",
  answerAr:
    "ناقش مع الطبيب طبيعة عملك ونشاطك، واطلب تعليمات واضحة عن العودة للعمل والرياضة والمتابعة. اسأل عن الفرق بين استئناف النشاط وظهور النتيجة النهائية، بدل اعتماد مدة من تجربة شخص آخر.",
  questionEn: "When can I return to work after the procedure?",
  answerEn:
    "Discuss your work and activity with the doctor, and ask for clear instructions about returning to work, exercise, and follow-up. Ask how resuming activity differs from seeing the final result rather than relying on someone else's recovery timeline.",
};
const facelift = [
  {
    questionAr: "وش أفضل طريقة لشد الوجه والرقبة لحالتي؟",
    answerAr:
      "ابدأ بتحديد ما تريد تحسينه، ثم اسأل الطبيب عن سبب اقتراح الإجراء وما يمكنه تحسينه وحدود نتيجته. ناقش البدائل والمخاطر والتعافي، وهل تشمل الخطة الرقبة، قبل اختيار الطريقة أو تحديد موعدها.",
    questionEn: "What is the best face and neck lift approach for my needs?",
    answerEn:
      "Start by identifying what you want to improve. Ask the doctor why an approach is recommended, what it can address, and its limitations. Discuss alternatives, risks, recovery, and whether the plan includes the neck before choosing an approach.",
  },
  {
    ...chooseDoctor,
    questionAr: "كيف أختار أفضل دكتور شد وجه في الرياض؟",
    questionEn: "How do I choose the best facelift surgeon in Riyadh?",
  },
  {
    ...price,
    questionAr: "كم تكلفة شد الوجه والرقبة بالرياض؟",
    questionEn: "How much does a face and neck lift cost in Riyadh?",
  },
  recovery,
];

export function serviceSearchQuestions(
  slug: string,
): readonly ServiceSearchQuestion[] {
  if (["face-neck-lift", "facelift-surgery"].includes(slug)) return facelift;
  if (["neck-lift-surgery", "double-chin-liposuction"].includes(slug))
    return [
      {
        questionAr: "عندي ترهل بالرقبة أو لغلوغ، كيف أعرف أفضل حل؟",
        answerAr:
          "وضح للطبيب المنطقة التي تزعجك وما تريد تغييره، واسأل عمّا يقيمه الفحص ولماذا يوصي بإجراء معين. ناقش نطاق الخطة والبدائل والنتائج الممكنة، ولا تفترض أن الإجراءات المختلفة تحقق الهدف نفسه.",
        questionEn:
          "How do I find the best option for neck laxity or a double chin?",
        answerEn:
          "Explain the area that concerns you and what you want to change. Ask what the assessment considers and why a procedure is recommended. Discuss the scope, alternatives, and possible results rather than assuming different procedures serve the same purpose.",
      },
      chooseDoctor,
      price,
    ];
  if (
    [
      "liposuction",
      "Liposuction",
      "body-contouring",
      "body-contouring-buttock-augmentation",
      "tummy-tuck",
    ].includes(slug)
  )
    return [
      {
        questionAr: "وش أفضل حل للدهون أو ترهل الجسم؟",
        answerAr:
          "حدد المنطقة والهدف الذي تريد مناقشته، ثم اطلب من الطبيب شرح الفرق بين الخيارات المقترحة وما يستطيع كل إجراء تحسينه. اسأل لماذا تناسبك الخطة، وما حدودها والمخاطر والتعافي والتكلفة قبل القرار.",
        questionEn: "What is the best option for body fat or loose skin?",
        answerEn:
          "Identify the area and goal you want to discuss. Ask the doctor to explain the proposed options and what each can address. Discuss why the plan fits your needs, its limitations, risks, recovery, and cost before deciding.",
      },
      chooseDoctor,
      price,
      recovery,
    ];
  if (
    [
      "rhinoplasty",
      "rhinoplasty-nose-reshaping",
      "breast-lift",
      "breast-augmentation-reshaping",
      "upper-lower-eyelid-surgery",
      "eyelid-lift-eye-rejuvenation",
    ].includes(slug)
  )
    return [chooseDoctor, price, recovery];
  if (
    [
      "botox",
      "dermal-fillers",
      "skin-rejuvenation",
      "injectable-harmony",
    ].includes(slug)
  )
    return [
      {
        questionAr: "كيف أعرف أفضل إجراء تجميلي يناسبني؟",
        answerAr:
          "ناقش ما تريد تحسينه مع الطبيب، واسأل عن الهدف من العلاج المقترح وحدود النتيجة والمخاطر والمتابعة. اطلب شرح الخطة والمادة أو التقنية المستخدمة قبل الموافقة على الجلسة.",
        questionEn: "How do I find the best aesthetic treatment for my needs?",
        answerEn:
          "Discuss what you want to improve with the doctor. Ask about the purpose of the proposed treatment, result limitations, risks, and follow-up. Request an explanation of the plan and the material or technology before agreeing to treatment.",
      },
      chooseDoctor,
      price,
    ];
  return [];
}
