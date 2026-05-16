import {
  deleteWebhookAction,
  rotateWebhookTokenAction,
} from "@/app/admin/webhooks/actions";
import { WebhookEditor } from "@/components/admin/WebhookEditor";
import { WebhookCopyLink } from "@/components/admin/WebhookCopyLink";
import { getServices, getWebhooks } from "@/lib/content-repository";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function AdminWebhooksPage() {
  const [webhooks, servicesRaw] = await Promise.all([
    getWebhooks(),
    getServices(),
  ]);
  const services = servicesRaw.map((s) => ({ slug: s.slug, name: s.name }));

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">ويب هوكس</span>
            <span className="lang-en">Webhooks</span>
          </h1>
          <p>
            <span className="lang-ar">
              {webhooks.length} نقطة استقبال · ربط مباشر مع CRM
            </span>
            <span className="lang-en">
              {webhooks.length} endpoints · directly piped into CRM
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">New</div>
              <div className="admin-card__title">
                <span className="lang-ar">إضافة ويب هوك</span>
                <span className="lang-en">Add webhook</span>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <WebhookEditor mode="create" services={services} />
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="lang-ar">
                بعد الإنشاء انسخ الرابط وأرسله لمنصة الإعلانات (Meta/Snap/Google)
                أو ضعه في فورم خارجي.
              </span>
              <span className="lang-en">
                After creating, copy the link into Meta/Snap/Google or any
                external form. POST JSON or form-data with fullName, phone,
                email, message.
              </span>
            </p>
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">Library</div>
              <div className="admin-card__title">
                <span className="lang-ar">الويب هوكس الموجودة</span>
                <span className="lang-en">Existing webhooks</span>
              </div>
            </div>
          </div>
          <div className="admin-data-list">
            {webhooks.length === 0 ? (
              <p className="px-2 py-6 text-sm text-muted-foreground">
                <span className="lang-ar">لا توجد ويب هوكس بعد.</span>
                <span className="lang-en">No webhooks yet.</span>
              </p>
            ) : null}
            {webhooks.map((webhook) => (
              <details key={webhook.id} className="admin-data-row !block">
                <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="admin-data-row__title truncate">
                      {webhook.name}
                      {webhook.serviceLabel ? (
                        <span className="ms-2 text-xs text-muted-foreground">
                          · {webhook.serviceLabel}
                        </span>
                      ) : null}
                    </p>
                    <p className="admin-data-row__meta truncate">
                      {webhook.totalEvents} hit
                      {webhook.totalEvents === 1 ? "" : "s"} ·{" "}
                      {formatDate(webhook.updatedAt)}
                    </p>
                  </div>
                  <span
                    className={`admin-status-badge ${webhook.isActive ? "is-published" : "is-archived"}`}
                  >
                    <span className="lang-ar">
                      {webhook.isActive ? "مُفعّل" : "متوقف"}
                    </span>
                    <span className="lang-en">
                      {webhook.isActive ? "Active" : "Disabled"}
                    </span>
                  </span>
                </summary>
                <div
                  className="mt-4 grid gap-4 border-t pt-4"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <div className="grid gap-2">
                    <span className="admin-field-label">
                      <span className="lang-ar">رابط الاستقبال</span>
                      <span className="lang-en">Endpoint URL</span>
                    </span>
                    <WebhookCopyLink token={webhook.token} />
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">
                        <span className="lang-ar">نموذج طلب POST</span>
                        <span className="lang-en">Sample POST payload</span>
                      </summary>
                      <pre
                        className="mt-2 overflow-auto rounded-lg p-3 text-[11px] leading-relaxed"
                        style={{
                          background: "var(--admin-panel-soft)",
                          border: "1px solid var(--admin-border)",
                        }}
                      >
{`{
  "fullName": "Sara Aljohani",
  "phone": "+9665XXXXXXXX",
  "email": "sara@example.com",
  "message": "أرغب باستشارة جلدية",
  "source": "Meta Ads",
  "tags": ["VIP", "Skin"]
}`}
                      </pre>
                    </details>
                  </div>

                  <WebhookEditor
                    mode="edit"
                    services={services}
                    initial={{
                      id: webhook.id,
                      name: webhook.name,
                      isActive: webhook.isActive,
                      defaultStatus: webhook.defaultStatus,
                      defaultTags: webhook.defaultTags,
                      defaultSource: webhook.defaultSource ?? null,
                      serviceLabel: webhook.serviceLabel ?? null,
                    }}
                    initialServiceSlug={
                      webhook.serviceLabel
                        ? services.find((s) => s.name === webhook.serviceLabel)?.slug ?? ""
                        : ""
                    }
                  />

                  {webhook.recentEvents.length > 0 ? (
                    <div className="grid gap-2">
                      <span className="admin-field-label">
                        <span className="lang-ar">آخر الأحداث</span>
                        <span className="lang-en">Recent events</span>
                      </span>
                      <ul className="grid gap-1 text-xs">
                        {webhook.recentEvents.map((evt) => (
                          <li
                            key={evt.id}
                            className="flex items-center gap-2 truncate"
                          >
                            <span
                              className={`admin-status-badge ${evt.statusCode < 300 ? "is-published" : "is-archived"}`}
                            >
                              {evt.statusCode}
                            </span>
                            <span className="text-muted-foreground">
                              {formatDate(evt.createdAt)}
                            </span>
                            {evt.errorMessage ? (
                              <span className="truncate text-red-500">
                                {evt.errorMessage}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <form action={rotateWebhookTokenAction}>
                      <input type="hidden" name="id" value={webhook.id} />
                      <button type="submit" className="admin-btn-secondary">
                        <span className="lang-ar">تجديد الرابط</span>
                        <span className="lang-en">Rotate token</span>
                      </button>
                    </form>
                    <form action={deleteWebhookAction}>
                      <input type="hidden" name="id" value={webhook.id} />
                      <button type="submit" className="admin-btn-danger">
                        <span className="lang-ar">حذف الويب هوك</span>
                        <span className="lang-en">Delete webhook</span>
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}
