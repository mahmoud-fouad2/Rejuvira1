import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { PortalSettingsForm } from "@/components/admin/patients/PortalSettingsForm";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { getPortalSettings } from "@/lib/portal/settings";

export const dynamic = "force-dynamic";

export default async function PortalSettingsPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "settings.manage")) {
    redirect("/forbidden");
  }

  const settings = await getPortalSettings();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>إعدادات بوابة المرضى</h1>
          <p>
            التفعيل والجلسات وكلمات المرور والطباعة — بيانات المركز العامة
            (الأرقام والعنوان) تُدار من إعدادات الموقع الرئيسية وتُستخدم هنا
            تلقائيًا.
          </p>
        </div>
      </div>
      <PatientsSubNav active="settings" role={role} />
      <section className="admin-panel" style={{ marginTop: "1rem", padding: "1.25rem" }}>
        <PortalSettingsForm settings={settings} />
      </section>
    </>
  );
}
