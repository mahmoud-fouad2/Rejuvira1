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
      <section className="surface-panel rounded-[1.5rem] p-5 lg:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-strong">
          إعدادات الموقع
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">
          نقطة واحدة لتحديث بيانات التواصل، الهوية، صور الصفحات، SEO، التكاملات، وروابط السوشيال.
        </p>
      </section>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="surface-panel rounded-[1.5rem] p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink-strong">
                تحرير الإعدادات
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                الحفظ ينعكس مباشرة على الواجهة العامة.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <SettingsForm groups={groups} />
          </div>
        </article>
        <aside className="grid content-start gap-4">
          <article className="surface-panel rounded-[1.5rem] p-5">
            <h3 className="text-base font-semibold text-ink-strong">أين أعدل الصور؟</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              ارفع صورة من صفحة الميديا، ثم استخدم الرابط في حقول الصور داخل هذا النموذج.
            </p>
            <a
              href="/admin/media"
              className="mt-4 inline-flex rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent/35 hover:text-accent"
            >
              فتح الميديا
            </a>
          </article>
          <article className="surface-panel rounded-[1.5rem] p-5">
            <h3 className="text-base font-semibold text-ink-strong">أقسام النموذج</h3>
            <div className="mt-4 grid gap-2">
              {groups.map((group) => (
                <div key={group.key} className="admin-compact-row">
                  <span className="text-sm font-semibold text-ink-strong">{group.title}</span>
                  <span className="text-xs text-ink-soft">{group.fields.length} حقل</span>
                </div>
              ))}
            </div>
          </article>
        </aside>
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
