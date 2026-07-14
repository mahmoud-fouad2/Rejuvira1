import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { TemplateForm } from "@/components/admin/patients/TemplateForm";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { createTemplateAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewTemplatePage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "templates.edit")) {
    redirect("/forbidden");
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>قالب تعليمات جديد</h1>
          <p>
            يُحفظ القالب كمسودة تحتاج اعتمادًا طبيًا قبل استخدامه مع المرضى.
            استخدم محتوى عامًا وآمنًا وغير تشخيصي — بلا جرعات أو مدد صيام أو
            تعليمات علاجية محددة.
          </p>
        </div>
      </div>
      <PatientsSubNav active="templates" role={role} />
      <section className="admin-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <TemplateForm action={createTemplateAction} submitLabel="حفظ كمسودة" />
      </section>
    </>
  );
}
