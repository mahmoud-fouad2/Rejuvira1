import { MaintenancePanel } from "@/components/admin/MaintenancePanel";
import { getRuntimeSettings } from "@/lib/content-repository";

export default async function AdminMaintenancePage() {
  const settings = await getRuntimeSettings();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الصيانة</span>
            <span className="lang-en">Maintenance</span>
          </h1>
          <p>
            <span className="lang-ar">النسخ الاحتياطي، فحص الاتصال، وضع الصيانة، وتفريغ ذاكرة المؤقت.</span>
            <span className="lang-en">Backups, connectivity checks, maintenance mode, cache.</span>
          </p>
        </div>
      </div>
      <MaintenancePanel
        initialMaintenance={Boolean(settings.ops.maintenanceMode)}
      />
    </>
  );
}
