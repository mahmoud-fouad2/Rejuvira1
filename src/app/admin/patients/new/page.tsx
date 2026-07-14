import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PatientForm } from "@/components/admin/patients/PatientForm";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { createPatientAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPatientPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "patients.create")) {
    redirect("/forbidden");
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>إضافة مريض جديد</h1>
          <p>
            يُنشأ الحساب بحالة «بانتظار التفعيل» — أرسل رابط التفعيل من ملف
            المريض بعد الحفظ.
          </p>
        </div>
      </div>
      <PatientsSubNav active="new" role={role} />
      <section className="admin-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <PatientForm action={createPatientAction} submitLabel="حفظ المريض" />
      </section>
    </>
  );
}
