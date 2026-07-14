import { PrismaClient, TemplateStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds the patient-portal instruction-template library.
 *
 * IMPORTANT:
 * - Every template is created with status DRAFT ("مسودة — تحتاج اعتماد طبي").
 *   Nothing here is medically approved; a Medical Director must review and
 *   approve each template in the admin before it can be used with patients.
 * - Content is intentionally generic, safe and NON-diagnostic. It contains
 *   NO drug doses, fasting durations, suture-removal dates or treatment
 *   decisions — those are filled per-patient by the treating doctor.
 * - Placeholders like {{doctor_name}} are resolved at print/display time.
 *
 * Re-running is idempotent: templates are matched by (nameAr, category) and
 * only created when missing. Existing (possibly approved) templates are left
 * untouched so we never silently overwrite approved medical content.
 */

const P = {
  patient: "{{patient_name}}",
  file: "{{file_number}}",
  procedure: "{{procedure_name}}",
  date: "{{procedure_date}}",
  time: "{{procedure_time}}",
  doctor: "{{doctor_name}}",
  arrival: "{{arrival_time}}",
  followUp: "{{follow_up_date}}",
  phone: "{{clinic_phone}}",
  notes: "{{additional_notes}}",
};

function preOp() {
  return [
    `عزيزي/عزيزتي ${P.patient}، هذه إرشادات عامة للتحضير لـ${P.procedure} مع ${P.doctor}. اتبع دائمًا التعليمات الخاصة التي يعطيك إياها طبيبك، فهي تسبق أي إرشاد عام.`,
    "",
    `• موعد العملية: ${P.date} — يرجى الحضور في ${P.arrival}.`,
    "• أخبر طبيبك بجميع أدويتك الحالية والمكملات والحساسية قبل الموعد، واتبع تعليماته بشأن أي دواء يجب إيقافه أو الاستمرار عليه.",
    "• أحضر تقاريرك وتحاليلك الطبية السابقة إن وُجدت.",
    "• التزم بتعليمات الطبيب حول الصيام قبل التخدير كما يحددها لك بدقة.",
    "• استحم قبل الحضور وتجنّب وضع مستحضرات التجميل أو الكريمات أو العطور على منطقة العملية.",
    "• ارتدِ ملابس مريحة وفضفاضة يسهل ارتداؤها بعد العملية.",
    "• رتّب من يرافقك ويوصلك بعد العملية، فلن تتمكن من القيادة في نفس اليوم.",
    "• أحضر معك بطاقة الهوية والأوراق المطلوبة من المركز.",
    P.notes ? `• ملاحظات طبيبك: ${P.notes}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function opDay() {
  return [
    `يوم عمليتك (${P.date}):`,
    "",
    `• احضر في الوقت المحدد ${P.arrival} إلى المركز.`,
    "• تأكد من التزامك بتعليمات الصيام التي حددها طبيبك.",
    "• لا تُحضر مجوهرات أو أشياء ثمينة، وأزل العدسات اللاصقة والمكياج وطلاء الأظافر.",
    "• توجه إلى الاستقبال لإكمال إجراءات الدخول، وسيقوم الفريق بإرشادك.",
    "• لا تتردد في سؤال فريقك الطبي عن أي شيء يقلقك قبل العملية.",
  ].join("\n");
}

function postOp() {
  return [
    `تعليمات ما بعد ${P.procedure}:`,
    "",
    "• اتبع تعليمات طبيبك بدقة في العناية بالجرح، ولا تلمسه بأيدٍ غير نظيفة.",
    "• خذ الأدوية التي وصفها لك طبيبك فقط وبالطريقة التي حددها، ولا تتناول أي دواء آخر دون الرجوع إليه.",
    "• احصل على راحة كافية وتجنّب المجهود البدني والرياضة العنيفة حتى يسمح لك طبيبك.",
    "• التزم بتعليمات الطبيب حول وضعية النوم والحركة وارتداء المشدّات الطبية إن وصفها لك.",
    "• اتبع إرشادات طبيبك بشأن موعد الاستحمام والعناية الشخصية.",
    "• حافظ على شرب السوائل وتناول غذاء متوازن حسب توجيهات فريقك الطبي.",
    "• تجنّب التدخين والكحول لأنهما يؤخران الالتئام.",
    "• استشر طبيبك قبل العودة للقيادة أو العمل.",
    `• التزم بمواعيد المتابعة، وأول موعد لك: ${P.followUp}.`,
  ].join("\n");
}

function warnings() {
  return [
    "تواصل مع المركز فورًا إذا لاحظت أيًا مما يلي:",
    "",
    "• ارتفاع في درجة الحرارة أو قشعريرة.",
    "• نزيف غير متوقف أو يتزايد.",
    "• ألم شديد لا يخف مع الأدوية الموصوفة.",
    "• احمرار أو تورم أو سخونة متزايدة أو إفرازات غير طبيعية من منطقة العملية.",
    "• صعوبة في التنفس أو ألم في الصدر — في هذه الحالة اتصل بخدمات الطوارئ فورًا.",
    "",
    `للتواصل مع المركز خلال أوقات العمل: ${P.phone}. هذه التعليمات ليست بديلًا عن خدمات الطوارئ.`,
  ].join("\n");
}

function followUp() {
  return [
    `• موعد المتابعة القادم: ${P.followUp} مع ${P.doctor}.`,
    "• احرص على حضور جميع مواعيد المتابعة حتى لو شعرت بتحسن، فهي مهمة لمتابعة تعافيك.",
    "• سجّل أي أسئلة تخطر لك لتطرحها على طبيبك في الموعد.",
    "• يمكنك التواصل مع فريق المركز عبر بوابة المرضى لأي استفسار غير طارئ.",
  ].join("\n");
}

function preOpEn() {
  return [
    `Dear ${P.patient}, these are general preparation guidelines for your ${P.procedure} with ${P.doctor}. Always follow the specific instructions your doctor gives you — they take priority over any general guidance.`,
    "",
    `• Procedure date: ${P.date} — please arrive at ${P.arrival}.`,
    "• Tell your doctor about all your medications, supplements and allergies, and follow their advice on what to pause or continue.",
    "• Follow your doctor's fasting instructions before anaesthesia exactly as specified.",
    "• Shower beforehand and avoid make-up, creams or perfume on the procedure area.",
    "• Wear comfortable, loose clothing and arrange someone to drive you home.",
  ].join("\n");
}

function warningsEn() {
  return [
    "Contact the clinic immediately if you notice any of the following:",
    "",
    "• Fever or chills.",
    "• Bleeding that does not stop or increases.",
    "• Severe pain not relieved by prescribed medication.",
    "• Increasing redness, swelling, warmth or unusual discharge.",
    "• Difficulty breathing or chest pain — call emergency services immediately.",
    "",
    `Clinic contact during working hours: ${P.phone}. This is not a substitute for emergency services.`,
  ].join("\n");
}

const CHECKLIST = [
  { title: "إحضار التقارير والتحاليل الطبية السابقة", phase: "BEFORE_OPERATION", isRequired: false },
  { title: "مراجعة الأدوية الحالية مع الطبيب", phase: "BEFORE_OPERATION", isRequired: true },
  { title: "الالتزام بتعليمات الصيام", phase: "BEFORE_OPERATION", isRequired: true },
  { title: "ترتيب مرافق ووسيلة للعودة", phase: "BEFORE_OPERATION", isRequired: true },
  { title: "إحضار الهوية والأوراق المطلوبة", phase: "OPERATION_DAY", isRequired: true },
  { title: "إزالة المجوهرات والمكياج والعدسات", phase: "OPERATION_DAY", isRequired: false },
  { title: "العناية بالجرح حسب تعليمات الطبيب", phase: "AFTER_OPERATION", isRequired: true },
  { title: "تناول الأدوية الموصوفة فقط", phase: "AFTER_OPERATION", isRequired: true },
  { title: "حضور موعد المتابعة الأول", phase: "FOLLOW_UP", isRequired: true },
];

function buildContent(overrides = {}) {
  return {
    preOperationContentAr: preOp(),
    preOperationContentEn: preOpEn(),
    operationDayContentAr: opDay(),
    postOperationContentAr: postOp(),
    warningSignsAr: warnings(),
    warningSignsEn: warningsEn(),
    followUpContentAr: followUp(),
    checklistJson: CHECKLIST,
    ...overrides,
  };
}

const templates = [
  // الوجه والرقبة
  ["شد الوجه والرقبة", "Face and Neck Lift", "face_neck"],
  ["شد الوجه", "Face Lift", "face_neck"],
  ["شد الرقبة", "Neck Lift", "face_neck"],
  ["شد الجبهة ورفع الحواجب", "Brow Lift", "face_neck"],
  ["شد الجفون العلوية", "Upper Blepharoplasty", "face_neck"],
  ["شد الجفون السفلية", "Lower Blepharoplasty", "face_neck"],
  ["شد الجفون العلوية والسفلية", "Upper & Lower Blepharoplasty", "face_neck"],
  ["تجميل الأنف", "Rhinoplasty", "face_neck"],
  ["تجميل الأذن", "Otoplasty", "face_neck"],
  ["رفع الشفة", "Lip Lift", "face_neck"],
  ["إزالة دهون الخد", "Buccal Fat Removal", "face_neck"],
  ["شفط اللغلوغ", "Submental Liposuction", "face_neck"],
  ["تكبير أو تعديل الذقن", "Chin Augmentation", "face_neck"],
  ["تحديد الفك", "Jawline Contouring", "face_neck"],
  // الجسم
  ["شفط الدهون", "Liposuction", "body"],
  ["نحت الجسم", "Body Contouring", "body"],
  ["شد البطن", "Abdominoplasty", "body"],
  ["شد البطن مع شفط الدهون", "Abdominoplasty with Liposuction", "body"],
  ["شد الجسم الكامل", "Full Body Lift", "body"],
  ["شد الترهلات بعد فقدان الوزن", "Post-Weight-Loss Body Lift", "body"],
  ["شد الذراعين", "Arm Lift", "body"],
  ["شد الفخذين", "Thigh Lift", "body"],
  ["شد الظهر", "Back Lift", "body"],
  ["شد الأرداف", "Buttock Lift", "body"],
  ["تكبير الأرداف بالدهون BBL", "Brazilian Butt Lift (BBL)", "body"],
  ["علاج الوذمة الشحمية", "Lipedema Treatment", "body"],
  ["شفط دهون الوذمة الشحمية", "Lipedema Liposuction", "body"],
  // الصدر
  ["تكبير الصدر بالحشوات", "Breast Augmentation", "breast"],
  ["تصغير الصدر", "Breast Reduction", "breast"],
  ["شد الصدر", "Breast Lift", "breast"],
  ["شد وتكبير الصدر", "Breast Lift with Augmentation", "breast"],
  ["تغيير حشوات الصدر", "Breast Implant Exchange", "breast"],
  ["إزالة حشوات الصدر", "Breast Implant Removal", "breast"],
  ["إعادة بناء الصدر", "Breast Reconstruction", "breast"],
  ["علاج التثدي عند الرجال", "Gynecomastia Treatment", "breast"],
  // التجميل النسائي
  ["تجميل المهبل", "Vaginoplasty", "feminine"],
  ["تضييق المهبل بعد الولادة", "Post-Delivery Vaginal Tightening", "feminine"],
  ["تجميل الشفرات", "Labiaplasty", "feminine"],
  ["إصلاح منطقة العجان", "Perineal Repair", "feminine"],
  ["إجراء تجميل نسائي جراحي", "Feminine Surgical Procedure", "feminine"],
  // إضافية
  ["عملية أخرى", "Other Procedure", "other"],
  ["إجراء بسيط", "Minor Procedure", "other"],
  ["إجراء غير جراحي يحتاج متابعة", "Non-Surgical Procedure with Follow-up", "other"],
  ["قالب فارغ قابل للتخصيص", "Blank Customizable Template", "other"],
];

async function main() {
  let created = 0;
  let skipped = 0;
  for (const [nameAr, nameEn, category] of templates) {
    const existing = await prisma.procedureTemplate.findFirst({
      where: { nameAr, category },
      select: { id: true },
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    const isBlank = nameAr === "قالب فارغ قابل للتخصيص";
    await prisma.procedureTemplate.create({
      data: {
        nameAr,
        nameEn,
        category,
        status: TemplateStatus.DRAFT,
        version: 1,
        createdByName: "بيانات أولية",
        ...(isBlank
          ? { checklistJson: [] }
          : buildContent()),
      },
    });
    created += 1;
  }
  console.log(
    `[seed:templates] created ${created}, skipped ${skipped} (already present). All new templates are DRAFT and require medical approval.`,
  );
}

main()
  .catch((error) => {
    console.error("[seed:templates] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
