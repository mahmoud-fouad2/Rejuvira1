import { AdminSettingsExtras } from "@/components/forms/AdminSettingsExtras";
import { SettingsForm } from "@/components/forms/SettingsForm";
import {
  getRuntimeSettings,
  getSettingsGroups,
} from "@/lib/content-repository";
import { getPublicSiteKey } from "@/lib/recaptcha";

export default async function AdminSettingsPage() {
  const [groups, runtimeSettings] = await Promise.all([
    getSettingsGroups(),
    getRuntimeSettings(),
  ]);

  return (
    <>
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">الإعدادات التشغيلية</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          إعدادات التشغيل والعلامة
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          تُدار من هذه الصفحة بيانات التواصل، الرسائل الرئيسية، المشاهد المعتمدة
          التي تظهر في الواجهة العامة، خرائط الموقع، قنوات التواصل، تفضيلات
          العرض، و SEO لكل صفحة.
        </p>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="surface-panel rounded-[2rem] p-6">
          <h2 className="text-ink font-serif text-3xl tracking-[-0.04em]">
            تحديث الإعدادات الأساسية
          </h2>
          <div className="mt-6">
            <SettingsForm groups={groups} />
          </div>
        </article>
        <div className="grid gap-4">
          {groups.map((group) => (
            <article
              key={group.key}
              className="surface-panel rounded-[1.85rem] p-5"
            >
              <p className="text-ink text-lg font-semibold">{group.title}</p>
              <p className="text-ink-soft mt-2 text-sm leading-7">
                {group.description}
              </p>
              <div className="mt-4 grid gap-3">
                {group.fields.map((field) => (
                  <div
                    key={field.key}
                    className="border-line bg-surface text-ink-soft rounded-[1.2rem] border px-4 py-3 text-sm"
                  >
                    <span className="text-ink-faint block text-xs tracking-[0.2em] uppercase">
                      {field.label}
                    </span>
                    <span className="text-ink mt-2 block">{field.value}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section>
        <AdminSettingsExtras
          settings={runtimeSettings}
          recaptchaSiteKey={getPublicSiteKey()}
        />
      </section>
    </>
  );
}
