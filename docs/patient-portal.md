# بوابة مرضى ريجوفيرا — Rejuvera Patient Portal

نظام متكامل داخل مشروع `rejuvera.sa` لإدارة المرضى وعملياتهم وتعليماتهم
ومتابعاتهم وبوابة دخول خاصة بهم. أُضيف دون المساس بأي صفحة أو خدمة قائمة.

## نظرة عامة

- **الواجهة الخلفية**: Next.js 16 (App Router) + Prisma + PostgreSQL — نفس تقنية
  المشروع، بلا أي framework جديد.
- **مصادقة الموظفين**: NextAuth الحالي مع أدوار موسّعة.
- **مصادقة المرضى**: نظام جلسات مستقل (`PatientSession`) بكوكي httpOnly، منفصل
  تمامًا عن جلسات الإدارة.
- **الطباعة**: PDF عربي حقيقي بمقاس A4 عبر `pdf-lib` مع تشكيل عربي صحيح و QR.

## قاعدة البيانات (Prisma)

نماذج جديدة في [`prisma/schema.prisma`](../prisma/schema.prisma):

| النموذج | الغرض |
| --- | --- |
| `Patient` | ملف المريض (UUID، رقم ملف فريد، حالة الحساب، لغة، ملاحظات داخلية). |
| `PatientAccount` | حساب الدخول (هاش كلمة المرور، محاولات فاشلة، قفل، موافقة على السياسة). |
| `PatientActivationToken` | روابط تفعيل/استعادة لمرة واحدة (توكن + OTP مشفّران). |
| `PatientSession` | جلسات المريض (توكن مُهشّم، انتهاء، إبطال). |
| `ProcedureTemplate` | قوالب التعليمات بإصدارات وحالة اعتماد طبي. |
| `Procedure` | عملية المريض مع نسخة تعليمات مخصّصة وإصدار وتأكيد قراءة. |
| `FollowUpAppointment` | مواعيد المتابعة. |
| `PatientMessage` | رسائل المريض/الفريق بتصنيفات وحالات. |
| `PatientFeedback` | تقييمات (1–5) وأذونات التواصل/النشر. |
| `ProcedureChecklistItem` | قوائم مهام لكل مرحلة. |
| `PatientDocument` | مستندات المريض مع تحكم في الظهور. |
| `PortalAuditLog` | سجل تدقيق لكل عملية حساسة. |
| `PatientNotification` | طابور إشعارات (queue) بحالات pending/sent/failed. |

الهجرة: [`prisma/migrations/20260712000000_add_patient_portal/migration.sql`](../prisma/migrations/20260712000000_add_patient_portal/migration.sql)
(مولّدة عبر `prisma migrate diff`؛ تشمل إضافة قيم `UserRole` الجديدة و FKs و
فهارس على رقم الملف والهاتف والتاريخ والحالة والطبيب).

## الأدوار والصلاحيات (RBAC)

أدوار جديدة في `UserRole`: `MEDICAL_DIRECTOR`, `DOCTOR`, `NURSE`,
`COORDINATOR`, `RECEPTIONIST`, `AUDITOR` (إضافة إلى الأدوار الأصلية).

- **حماية المسارات**: [`src/lib/admin-permissions.ts`](../src/lib/admin-permissions.ts) +
  الـ middleware — تمنع الوصول غير المصرح به على مستوى المسار.
- **الصلاحيات الدقيقة**: [`src/lib/portal/permissions.ts`](../src/lib/portal/permissions.ts)
  — تُفحص داخل كل server action / API route، وليست إخفاءً للأزرار فقط.
- الاستقبال (`RECEPTIONIST`) لا يرى الملاحظات الطبية/الداخلية ولا يعدّل التعليمات.
- إخفاء رقم الهاتف تلقائيًا حسب الصلاحية (`displayPhone`/`maskPhone`).

## مسارات الإدارة (`/admin/patients`)

| المسار | الوظيفة |
| --- | --- |
| `/admin/patients` | جميع المرضى — بحث وفلاتر وترقيم من الخادم. |
| `/admin/patients/new` | إضافة مريض (فحص تكرار رقم الملف والجوال). |
| `/admin/patients/[id]` | ملف المريض بتبويبات (عمليات، متابعات، رسائل، مستندات، تقييمات، نشاط). |
| `/admin/patients/[id]/edit` | تعديل بيانات المريض. |
| `/admin/patients/[id]/add-procedure` | إضافة عملية (تنسخ تعليمات القالب المعتمد). |
| `/admin/patients/procedures` + `/procedures/[id]` | قائمة وإدارة العمليات والتعليمات والمهام والمتابعات. |
| `/admin/patients/follow-ups` | المتابعات (مع تمييز المتأخرة). |
| `/admin/patients/messages` | الرسائل والرد عليها. |
| `/admin/patients/templates` + `/templates/new` + `/templates/[id]` | مكتبة القوالب بالإصدارات والاعتماد الطبي. |
| `/admin/patients/feedback` | التقييمات و workflow المتابعة. |
| `/admin/patients/import` | استيراد CSV بمعاينة وتحديد أعمدة وتقرير. |
| `/admin/patients/stats` | إحصائيات حقيقية من قاعدة البيانات + تصدير CSV. |
| `/admin/patients/activity` | سجل النشاط. |
| `/admin/patients/settings` | إعدادات البوابة. |

## بوابة المريض (`/patient-login`, `/portal`)

- `/patient-login` + `/recover` + `/activate` + `/privacy` — صفحات عامة عربية أولًا
  RTL، Mobile-first، بهوية ريجوفيرا.
- `/portal` — لوحة المريض (العملية القادمة، عدّاد، نسبة إكمال المهام).
- `/portal/procedures/[id]` — التعليمات بأقسام + تأكيد القراءة (مع الإصدار) +
  Checklist تفاعلية + طباعة PDF.
- `/portal/messages` + `/documents` + `/account` — رسائل، مستندات، الحساب/الجلسات.

## PDF والطباعة

[`src/lib/portal/instructions-pdf.ts`](../src/lib/portal/instructions-pdf.ts):

- تشكيل عربي صحيح (Presentation Forms-B + lam-alef + إعادة ترتيب bidi) في
  [`arabic-shaper.ts`](../src/lib/portal/arabic-shaper.ts).
- ترويسة بشعار المركز، بيانات المريض (الهاتف مخفي جزئيًا)، الأقسام، تذييل من
  الإعدادات، أرقام الصفحات.
- QR مولّد ذاتيًا ([`qrcode.ts`](../src/lib/portal/qrcode.ts)) يفتح `/patient-login`
  فقط — بلا توكن أو رابط مباشر للبيانات.
- كل توليد للـ PDF يُسجَّل في سجل التدقيق.
- المسارات: `/api/admin/patients/procedures/[id]/pdf` (موظف)،
  `/api/portal/procedures/[id]/pdf` (المريض، تعليماته المنشورة فقط).

## الأمان والخصوصية

- كلمات المرور: bcrypt (cost 12). التوكنات: SHA-256. الـ OTP: bcrypt.
- Rate limiting على الدخول والتفعيل والاستعادة، وقفل مؤقت بعد المحاولات.
- منع enumeration: رسالة دخول/استعادة موحّدة بغض النظر عن وجود الرقم.
- كوكي `httpOnly` + `secure` (إنتاج) + `sameSite=lax`.
- عزل المرضى: كل استعلام مريض مقيّد بـ `patientId` من الجلسة — لا يمكن لمريض
  فتح بيانات آخر (يعود 404).
- التقييمات لا تُنشر تلقائيًا؛ النشر يحتاج موافقة صريحة بعد إخفاء الهوية.
- سجل تدقيق ([`audit.ts`](../src/lib/portal/audit.ts)) يجرّد الحقول الحساسة قبل الحفظ.
- الإشعارات (queue فقط) لا ترسل أي رسالة فعلية قبل ربط مزود واعتماد الإدارة.

## القوالب الأولية

`npm run seed:templates` ([`scripts/seed-procedure-templates.mjs`](../scripts/seed-procedure-templates.mjs))
ينشئ ~45 قالبًا لكل العمليات المطلوبة، **جميعها بحالة «مسودة — تحتاج اعتماد
طبي»** بمحتوى عام وآمن وغير تشخيصي (بلا جرعات/مدد صيام/تعليمات علاجية)،
ويستخدم حقولًا متغيرة `{{...}}`. idempotent (لا يستبدل قالبًا معتمدًا).

## خطوات النشر

1. مُضاف تلقائيًا إلى `render.yaml` build:
   `prisma migrate deploy` → `seed:core` → `seed:landing` → **`seed:templates`** → build.
2. لا متغيرات بيئة جديدة مطلوبة (يُعيد استخدام `SITE_URL`, بيانات المركز, الخط).
3. بعد النشر: يعتمد المدير الطبي القوالب من `/admin/patients/templates` قبل
   استخدامها مع المرضى.

## الاختبارات

- `npm run test:smoke` موسّع ليشمل: صفحات البوابة العامة، وبوابات المصادقة
  (المريض المجهول يُعاد توجيهه، وواجهات PDF/المستندات تعيد 401، ومنطقة الإدارة
  ترفض غير المصرح لهم).
