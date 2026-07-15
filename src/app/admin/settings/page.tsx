import { AdminSettingsExtras } from "@/components/forms/AdminSettingsExtras";
import { SettingsForm } from "@/components/forms/SettingsForm";
import { SmtpSettingsCard } from "@/components/forms/SmtpSettingsCard";
import {
  getRuntimeSettings,
  getSettingsGroups,
} from "@/lib/content-repository";
import { smtpConfigPreview } from "@/lib/portal/email";
import { getPublicSiteKey } from "@/lib/recaptcha";

export default async function AdminSettingsPage() {
  const [groups, runtimeSettings] = await Promise.all([
    getSettingsGroups(),
    getRuntimeSettings(),
  ]);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">الإعدادات</span>
            <span className="lang-en">Settings</span>
          </h1>
          <p>
            <span className="lang-ar">
              جهات الاتصال، الهوية، الصور، SEO، التكاملات.
            </span>
            <span className="lang-en">
              Contact, brand, images, SEO, integrations.
            </span>
          </p>
        </div>
      </div>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Form</div>
            <div className="admin-card__title">
              <span className="lang-ar">تحرير الإعدادات</span>
              <span className="lang-en">Edit settings</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="#api-webhook-documentation"
              className="admin-btn-secondary"
            >
              <span className="lang-ar">توثيق API / Webhook</span>
              <span className="lang-en">API / Webhook docs</span>
            </a>
            <a href="#about-settings" className="admin-btn-primary">
              <span className="lang-ar">تحرير من نحن</span>
              <span className="lang-en">Edit About</span>
            </a>
            <a href="/admin/media" className="admin-btn-secondary">
              <span className="lang-ar">الصور</span>
              <span className="lang-en">Media</span>
            </a>
          </div>
        </div>
        <div className="admin-card__body">
          <SettingsForm groups={groups} />
        </div>
      </article>

      <SmtpSettingsCard preview={smtpConfigPreview()} />

      <AdminSettingsExtras
        settings={runtimeSettings}
        recaptchaSiteKey={getPublicSiteKey()}
      />
    </>
  );
}
