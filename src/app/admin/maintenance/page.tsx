import { MaintenancePanel } from "@/components/admin/MaintenancePanel";
import { getRuntimeSettings } from "@/lib/content-repository";

export default async function AdminMaintenancePage() {
  const settings = await getRuntimeSettings();

  return (
    <>
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">العمليات والصيانة</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          مركز الصيانة والتشغيل
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          أدوات تشغيلية يومية: نسخ احتياطية إلى Cloudflare R2، تصدير سجلات
          الطلبات، فحص الاتصال بقواعد البيانات والخدمات الخارجية، وضع الصيانة
          العامة، وإدارة ذاكرة المؤقت بنقرة واحدة.
        </p>
      </section>
      <MaintenancePanel
        initialMaintenance={Boolean(settings.ops.maintenanceMode)}
      />
    </>
  );
}
