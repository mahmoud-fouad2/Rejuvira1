import { TemplateStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const P = {
  patient: "{{patient_name}}",
  procedure: "{{procedure_name}}",
  date: "{{procedure_date}}",
  doctor: "{{doctor_name}}",
  arrival: "{{arrival_time}}",
  followUp: "{{follow_up_date}}",
  phone: "{{clinic_phone}}",
  notes: "{{additional_notes}}",
};

function commonContent(procedureName: string) {
  return {
    preOperationContentAr: [
      `عزيزي/عزيزتي ${P.patient}، هذه إرشادات عامة للتحضير لـ ${P.procedure} مع ${P.doctor}.`,
      "اتبع دائمًا تعليمات طبيبك الخاصة، فهي تسبق أي إرشاد عام.",
      `موعد العملية: ${P.date}. يرجى الحضور في ${P.arrival}.`,
      "أخبر طبيبك بجميع أدويتك الحالية والمكملات والحساسية قبل الموعد.",
      "التزم بتعليمات الطبيب حول الصيام والتخدير والأدوية بدقة.",
      "ارتدِ ملابس مريحة وسهلة الارتداء بعد العملية، ورتب مرافقًا للعودة.",
      `ملاحظات الطبيب: ${P.notes}`,
    ].join("\n"),
    operationDayContentAr: [
      `في يوم ${procedureName}:`,
      "توجه إلى الاستقبال لإكمال إجراءات الدخول، وسيقوم الفريق بإرشادك.",
      "لا تحضر مجوهرات أو أشياء ثمينة، وأزل العدسات اللاصقة والمكياج عند الحاجة.",
      "اسأل الفريق الطبي عن أي نقطة غير واضحة قبل بدء الإجراء.",
    ].join("\n"),
    postOperationContentAr: [
      "اتبع تعليمات طبيبك في العناية بالجرح أو المنطقة المعالجة.",
      "خذ الأدوية الموصوفة فقط وبالطريقة التي حددها الطبيب.",
      "احصل على راحة كافية وتجنب المجهود البدني حتى يسمح طبيبك.",
      "التزم بالمشدات أو الضمادات أو وضعيات النوم إذا أوصى بها الطبيب.",
      `موعد المتابعة القادم: ${P.followUp}.`,
    ].join("\n"),
    warningSignsAr: [
      "تواصل مع المركز فورًا إذا لاحظت حرارة، نزيفًا متزايدًا، ألمًا شديدًا، احمرارًا أو تورمًا متزايدًا، أو إفرازات غير طبيعية.",
      "في حال صعوبة التنفس أو ألم الصدر اتصل بخدمات الطوارئ فورًا.",
      `للاستفسارات غير الطارئة: ${P.phone}.`,
    ].join("\n"),
    followUpContentAr: [
      "احرص على حضور جميع مواعيد المتابعة حتى عند الشعور بتحسن.",
      "دوّن أسئلتك قبل الموعد لمناقشتها مع الطبيب.",
      "يمكنك إرسال سؤال للفريق من بوابة المرضى.",
    ].join("\n"),
    preOperationContentEn:
      "General preparation guidance. Always follow your doctor's specific instructions.",
    operationDayContentEn:
      "On the procedure day, arrive on time and follow the team's instructions.",
    postOperationContentEn:
      "After the procedure, follow wound care and activity guidance from your doctor.",
    warningSignsEn:
      "Contact the clinic for fever, increasing bleeding, severe pain, redness, swelling or unusual discharge. For breathing difficulty or chest pain, call emergency services.",
    followUpContentEn:
      "Attend all follow-up appointments and send non-urgent questions through the portal.",
    checklistJson: [
      {
        title: "مراجعة الأدوية والحساسية مع الطبيب",
        phase: "BEFORE_OPERATION",
        isRequired: true,
      },
      {
        title: "تأكيد وقت الحضور والمرافق",
        phase: "BEFORE_OPERATION",
        isRequired: true,
      },
      {
        title: "اتباع تعليمات يوم العملية",
        phase: "OPERATION_DAY",
        isRequired: true,
      },
      {
        title: "قراءة تعليمات ما بعد العملية",
        phase: "AFTER_OPERATION",
        isRequired: true,
      },
      {
        title: "حضور موعد المتابعة",
        phase: "FOLLOW_UP",
        isRequired: true,
      },
    ],
  };
}

const starterTemplates = [
  ["شد الوجه والرقبة", "Face and Neck Lift", "face_neck"],
  ["شد الجفون", "Blepharoplasty", "face_neck"],
  ["تجميل الأنف", "Rhinoplasty", "face_neck"],
  ["شفط اللغلوغ", "Submental Liposuction", "face_neck"],
  ["شفط الدهون", "Liposuction", "body"],
  ["شد البطن", "Abdominoplasty", "body"],
  ["نحت الجسم", "Body Contouring", "body"],
  ["شد الذراعين", "Arm Lift", "body"],
  ["شد الفخذين", "Thigh Lift", "body"],
  ["تكبير الصدر", "Breast Augmentation", "breast"],
  ["تصغير الصدر", "Breast Reduction", "breast"],
  ["شد الصدر", "Breast Lift", "breast"],
  ["علاج التثدي", "Gynecomastia Treatment", "breast"],
  ["تجميل الشفرات", "Labiaplasty", "feminine"],
  ["تضييق المهبل", "Vaginoplasty", "feminine"],
  ["إجراء عام قابل للتخصيص", "Custom Procedure", "other"],
] as const;

export async function ensureDefaultProcedureTemplates() {
  const count = await prisma.procedureTemplate.count();
  if (count > 0) return { created: 0 };

  await prisma.procedureTemplate.createMany({
    data: starterTemplates.map(([nameAr, nameEn, category]) => ({
      nameAr,
      nameEn,
      category,
      status: TemplateStatus.DRAFT,
      version: 1,
      createdByName: "Rejuvera starter library",
      ...commonContent(nameAr),
    })),
  });
  return { created: starterTemplates.length };
}
