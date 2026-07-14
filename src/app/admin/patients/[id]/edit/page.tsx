import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { PatientForm } from "@/components/admin/patients/PatientForm";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";
import { updatePatientAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPatientPage(props: {
  params: Promise<{ id: string }>;
}) {
  const [session, params] = await Promise.all([auth(), props.params]);
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "patients.edit")) {
    redirect("/forbidden");
  }

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
  });
  if (!patient) notFound();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>تعديل بيانات المريض</h1>
          <p>
            {patient.fullNameAr} — ملف {patient.fileNumber}
          </p>
        </div>
      </div>
      <PatientsSubNav active="patients" role={role} />
      <section className="admin-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <PatientForm
          action={updatePatientAction}
          submitLabel="حفظ التعديلات"
          showAccountStatus
          values={{
            patientId: patient.id,
            fileNumber: patient.fileNumber,
            fullNameAr: patient.fullNameAr,
            fullNameEn: patient.fullNameEn ?? "",
            phone: patient.phone,
            email: patient.email ?? "",
            dateOfBirth: patient.dateOfBirth
              ? patient.dateOfBirth.toISOString().slice(0, 10)
              : "",
            gender: patient.gender ?? "",
            emergencyContactName: patient.emergencyContactName ?? "",
            emergencyContactPhone: patient.emergencyContactPhone ?? "",
            preferredLanguage: patient.preferredLanguage,
            internalNotes: patient.internalNotes ?? "",
            accountStatus: patient.accountStatus,
          }}
        />
      </section>
    </>
  );
}
