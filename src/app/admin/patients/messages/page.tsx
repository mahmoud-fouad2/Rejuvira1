import Link from "next/link";
import type { Route } from "next";
import { MessageStatus } from "@prisma/client";

import { auth } from "@/auth";
import { MessageReplyForm } from "@/components/admin/patients/MessageReplyForm";
import {
  EmptyState,
  FilterBar,
  PageHeader,
} from "@/components/admin/patients/PatientDesignSystem";
import { IconMessage } from "@/components/admin/patients/PatientModuleIcons";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { setMessageStatusAction } from "../actions";
import {
  formatDateTime,
  messageCategoryLabel,
  messageStatusLabels,
} from "@/lib/portal/labels";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { listMessages } from "@/lib/portal/repository";

export const dynamic = "force-dynamic";

export default async function PatientMessagesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([auth(), props.searchParams]);
  const role = session?.user?.role;
  const canReply = hasPortalCapability(role, "messages.reply");

  const page = Math.max(
    1,
    Number.parseInt(typeof params.page === "string" ? params.page : "", 10) || 1,
  );
  const status = typeof params.status === "string" ? params.status : "";
  const urgent = params.urgent === "1";

  const result = await listMessages({
    page,
    status:
      status && (Object.values(MessageStatus) as string[]).includes(status)
        ? (status as MessageStatus)
        : "ALL",
    urgentOnly: urgent,
  });

  const query = (overrides: Record<string, string>) => {
    const search = new URLSearchParams();
    if (status) search.set("status", status);
    if (urgent) search.set("urgent", "1");
    for (const [key, value] of Object.entries(overrides)) {
      if (value) search.set(key, value);
      else search.delete(key);
    }
    const qs = search.toString();
    return `/admin/patients/messages${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="patient-module-page patient-module-page--refined">
      <PageHeader
        eyebrow="Messages"
        title="الرسائل والاستفسارات"
        description={`${result.total} رسالة من المرضى. الردود والإغلاق وتحديد المقروء كلها في واجهة محادثة مرتبة.`}
      />
      <PatientsSubNav active="messages" role={role} />

      <FilterBar title="تصفية الرسائل" description="ابدأ بالرسائل العاجلة أو غير المقروءة ثم أغلق الطلب بعد الرد.">
        <form method="get" className="patient-filter-grid patient-filter-grid--compact">
          <label>
            <span className="admin-field-label">الحالة</span>
            <select name="status" defaultValue={status} className="admin-input">
              <option value="">الكل</option>
              {Object.entries(messageStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="patient-check-control">
            <input type="checkbox" name="urgent" value="1" defaultChecked={urgent} />
            <span>العاجلة فقط</span>
          </label>
          <div className="patient-filter-actions">
            <button type="submit" className="admin-btn-secondary">
              تصفية
            </button>
            <Link href={"/admin/patients/messages" as Route} className="admin-btn-ghost">
              إعادة تعيين
            </Link>
          </div>
        </form>
      </FilterBar>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<IconMessage />}
          title="لا توجد رسائل مطابقة"
          description="عند وصول رسالة من بوابة المريض ستظهر هنا مع حالة القراءة وأدوات الرد."
          action={
            <Link href={"/admin/patients" as Route} className="admin-btn-primary">
              فتح سجل المرضى
            </Link>
          }
        />
      ) : (
        <section className="patient-admin-message-list">
          {result.items.map((message) => (
            <article key={message.id} className="admin-card patient-admin-message-card">
              <header className="patient-admin-message-card__header">
                <div>
                  <Link href={`/admin/patients/${message.patient.id}?tab=messages` as Route}>
                    {message.patient.fullNameAr}
                  </Link>
                  <p>
                    ملف {message.patient.fileNumber} · {messageCategoryLabel(message.category)}
                    {message.procedure
                      ? ` · ${message.procedure.customProcedureName || message.procedure.template?.nameAr || "عملية"}`
                      : ""}
                  </p>
                </div>
                <div className="patient-admin-message-card__meta">
                  {message.isUrgent ? <span className="admin-status-badge is-danger">عاجلة</span> : null}
                  <span className="admin-status-badge">{messageStatusLabels[message.status]}</span>
                  <time dateTime={message.createdAt.toISOString()}>{formatDateTime(message.createdAt)}</time>
                </div>
              </header>

              <p className="patient-admin-message-card__body">{message.message}</p>

              <div className="patient-admin-message-card__actions">
                {canReply && message.status !== "CLOSED" ? (
                  <MessageReplyForm messageId={message.id} patientId={message.patient.id} />
                ) : null}
                <div className="patient-inline-actions">
                  {message.status !== "CLOSED" ? (
                    <form action={setMessageStatusAction}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <input type="hidden" name="status" value="CLOSED" />
                      <button type="submit" className="admin-btn-ghost">
                        إغلاق
                      </button>
                    </form>
                  ) : null}
                  {message.status === "UNREAD" ? (
                    <form action={setMessageStatusAction}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <input type="hidden" name="status" value="READ" />
                      <button type="submit" className="admin-btn-ghost">
                        تحديد كمقروءة
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
          <ResultsFooter page={result.page} pageCount={result.pageCount} total={result.total} query={query} />
        </section>
      )}
    </div>
  );
}

function ResultsFooter({
  page,
  pageCount,
  total,
  query,
}: {
  page: number;
  pageCount: number;
  total: number;
  query: (overrides: Record<string, string>) => string;
}) {
  return (
    <nav className="patient-results-footer" aria-label="التنقل بين صفحات الرسائل">
      <span>{total} نتيجة</span>
      <div>
        {page > 1 ? (
          <Link href={query({ page: String(page - 1) }) as Route} className="admin-btn-secondary">
            السابق
          </Link>
        ) : null}
        <span>
          صفحة {page} من {Math.max(pageCount, 1)}
        </span>
        {page < pageCount ? (
          <Link href={query({ page: String(page + 1) }) as Route} className="admin-btn-secondary">
            التالي
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
