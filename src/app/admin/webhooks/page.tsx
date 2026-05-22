import {
  deleteWebhookAction,
  rotateWebhookTokenAction,
} from "@/app/admin/webhooks/actions";
import { AdminListControls } from "@/components/admin/AdminListControls";
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
  const activeCount = webhooks.filter((webhook) => webhook.isActive).length;
  const totalEvents = webhooks.reduce(
    (sum, webhook) => sum + webhook.totalEvents,
    0,
  );
  const recentFailureCount = webhooks.reduce(
    (sum, webhook) =>
      sum +
      webhook.recentEvents.filter((event) => event.statusCode >= 400).length,
    0,
  );
  const serviceLinkedCount = webhooks.filter(
    (webhook) => webhook.serviceLabel,
  ).length;
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: webhooks.length },
    {
      value: "active",
      labelAr: "مفعل",
      labelEn: "Active",
      count: webhooks.filter((webhook) => webhook.isActive).length,
    },
    {
      value: "disabled",
      labelAr: "متوقف",
      labelEn: "Disabled",
      count: webhooks.filter((webhook) => !webhook.isActive).length,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">مصادر الطلبات</span>
            <span className="lang-en">Lead sources</span>
          </h1>
          <p>
            <span className="lang-ar">
              {webhooks.length} مصدر استقبال مرتبط بالطلبات
            </span>
            <span className="lang-en">
              {webhooks.length} lead intake sources
            </span>
          </p>
        </div>
      </div>

      <section className="admin-kpi-grid--compact mb-4">
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">مصادر فعّالة</span>
          <strong>
            {activeCount}/{webhooks.length}
          </strong>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">طلبات مستقبلة</span>
          <strong>{totalEvents}</strong>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">محاولات غير مكتملة</span>
          <strong>{recentFailureCount}</strong>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">مرتبطة بخدمة</span>
          <strong>
            {serviceLinkedCount}/{webhooks.length}
          </strong>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">إضافة مصدر</div>
              <div className="admin-card__title">
                <span className="lang-ar">إضافة مصدر طلبات</span>
                <span className="lang-en">Add source</span>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <WebhookEditor mode="create" services={services} />
            <p className="text-muted-foreground mt-3 text-xs">
              <span className="lang-ar">
                بعد الإنشاء انسخ رابط الاستقبال داخل منصة الإعلانات أو النموذج
                الخارجي. كل طلب ناجح يظهر تلقائيًا في شاشة الطلبات.
              </span>
              <span className="lang-en">
                Copy the intake link into your campaign or external form.
              </span>
            </p>
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__subtitle">المصادر الحالية</div>
              <div className="admin-card__title">
                <span className="lang-ar">مصادر الطلبات الحالية</span>
                <span className="lang-en">Current sources</span>
              </div>
            </div>
          </div>
          <AdminListControls targetId="admin-webhooks-list" tabs={tabs} />
          <div
            className="admin-data-list"
            data-admin-list="admin-webhooks-list"
          >
            {webhooks.length === 0 ? (
              <p className="text-muted-foreground px-2 py-6 text-sm">
                <span className="lang-ar">لا توجد مصادر طلبات بعد.</span>
                <span className="lang-en">No sources yet.</span>
              </p>
            ) : null}
            {webhooks.map((webhook) => (
              <details
                key={webhook.id}
                className="admin-data-row !block"
                data-admin-row
                data-admin-status={webhook.isActive ? "active" : "disabled"}
                data-admin-search={[
                  webhook.name,
                  webhook.serviceLabel,
                  webhook.defaultSource,
                  webhook.defaultTags.join(" "),
                  webhook.defaultStatus,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="admin-data-row__title truncate">
                      {webhook.name}
                      {webhook.serviceLabel ? (
                        <span className="text-muted-foreground ms-2 text-xs">
                          · {webhook.serviceLabel}
                        </span>
                      ) : null}
                    </p>
                    <p className="admin-data-row__meta truncate">
                      {webhook.totalEvents} طلب ·{" "}
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
                      <span className="lang-en">Intake link</span>
                    </span>
                    <WebhookCopyLink token={webhook.token} />
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
                        ? (services.find((s) => s.name === webhook.serviceLabel)
                            ?.slug ?? "")
                        : ""
                    }
                  />

                  {webhook.recentEvents.length > 0 ? (
                    <div className="grid gap-2">
                      <span className="admin-field-label">
                        <span className="lang-ar">آخر الطلبات المستقبلة</span>
                        <span className="lang-en">Recent intake</span>
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
                              {evt.statusCode < 300 ? "نجح" : "تعذر"}
                            </span>
                            <span className="text-muted-foreground">
                              {formatDate(evt.createdAt)}
                            </span>
                            {evt.errorMessage ? (
                              <span className="truncate text-red-500">
                                لم يكتمل الاستقبال
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
                        <span className="lang-en">Refresh link</span>
                      </button>
                    </form>
                    <form action={deleteWebhookAction}>
                      <input type="hidden" name="id" value={webhook.id} />
                      <button type="submit" className="admin-btn-danger">
                        <span className="lang-ar">حذف المصدر</span>
                        <span className="lang-en">Delete source</span>
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
