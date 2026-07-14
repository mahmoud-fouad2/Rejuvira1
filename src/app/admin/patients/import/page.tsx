import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ImportPatientsPanel } from "@/components/admin/patients/ImportPatientsPanel";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { hasPortalCapability } from "@/lib/portal/permissions";

export const dynamic = "force-dynamic";

export default async function ImportPatientsPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "patients.import")) {
    redirect("/forbidden");
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>استيراد المرضى</h1>
          <p>
            ارفع ملف CSV، راجع المعاينة وحدد الأعمدة، ثم أكد الاستيراد. الصفوف
            المكررة أو غير الصالحة تُستبعد بتقرير واضح — لا استيراد صامت.
          </p>
        </div>
      </div>
      <PatientsSubNav active="import" role={role} />
      <section className="admin-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <ImportPatientsPanel />
      </section>
    </>
  );
}
