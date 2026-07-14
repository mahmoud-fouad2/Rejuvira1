import { notFound, redirect } from "next/navigation";
import { TemplateStatus } from "@prisma/client";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { ProcedureForm } from "@/components/admin/patients/ProcedureForm";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { listTemplates } from "@/lib/portal/repository";
import { prisma } from "@/lib/prisma";
import { createProcedureAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AddProcedurePage(props: {
  params: Promise<{ id: string }>;
}) {
  const [session, params] = await Promise.all([auth(), props.params]);
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "procedures.create")) {
    redirect("/forbidden");
  }

  const [patient, templates, doctors] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: params.id },
      select: { id: true, fullNameAr: true, fileNumber: true, archivedAt: true },
    }),
    listTemplates({ status: TemplateStatus.MEDICALLY_APPROVED }),
    prisma.doctor.findMany({
      select: { id: true, nameAr: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);
  if (!patient || patient.archivedAt) notFound();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>إضافة عملية</h1>
          <p>
            للمريض {patient.fullNameAr} — ملف {patient.fileNumber}. اختيار قالب
            معتمد ينسخ تعليماته نسخة خاصة بالمريض.
          </p>
        </div>
      </div>
      <PatientsSubNav active="patients" role={role} />
      <section className="admin-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        {templates.length === 0 ? (
          <p className="admin-status-badge is-warning" style={{ whiteSpace: "normal", marginBottom: "1rem" }}>
            لا توجد قوالب معتمدة طبيًا بعد — يمكن إنشاء عملية مخصصة الآن، أو
            اعتماد القوالب أولًا من صفحة «قوالب التعليمات».
          </p>
        ) : null}
        <ProcedureForm
          action={createProcedureAction}
          submitLabel="إضافة العملية"
          values={{ patientId: patient.id }}
          templates={templates.map((template) => ({
            id: template.id,
            label: `${template.nameAr} (إصدار ${template.version})`,
          }))}
          doctors={doctors.map((doctor) => ({
            id: doctor.id,
            label: doctor.nameAr,
          }))}
        />
      </section>
    </>
  );
}
