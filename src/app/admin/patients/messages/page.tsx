import Link from "next/link";
import type { Route } from "next";
import { MessageStatus } from "@prisma/client";

import { auth } from "@/auth";
import { MessageReplyForm } from "@/components/admin/patients/MessageReplyForm";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { setMessageStatusAction } from "../actions";
import {
  formatDateTime,
  messageCategoryLabel,
  messageStatusLabels,
} from "@/lib/portal/labels";
import { listMessages } from "@/lib/portal/repository";
import { hasPortalCapability } from "@/lib/portal/permissions";

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

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>الرسائل والاستفسارات</h1>
          <p>{result.total} رسالة من المرضى.</p>
        </div>
      </div>
      <PatientsSubNav active="messages" role={role} />

      <section className="admin-panel" style={{ marginBlock: "1rem" }}>
        <form
          method="get"
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "end",
            padding: "0.9rem",
          }}
        >
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
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <input type="checkbox" name="urgent" value="1" defaultChecked={urgent} />
            <span>العاجلة فقط</span>
          </label>
          <button type="submit" className="admin-btn-secondary">
            تصفية
          </button>
        </form>
      </section>

      {result.items.length === 0 ? (
        <div className="admin-empty-state">
          <p>لا توجد رسائل مطابقة.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {result.items.map((message) => (
            <article key={message.id} className="admin-card" style={{ padding: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <Link
                    href={`/admin/patients/${message.patient.id}?tab=messages` as Route}
                    style={{ fontWeight: 600 }}
                  >
                    {message.patient.fullNameAr}
                  </Link>{" "}
                  <span className="admin-text-faint">
                    · ملف {message.patient.fileNumber} ·{" "}
                    {messageCategoryLabel(message.category)}
                    {message.procedure
                      ? ` · ${message.procedure.customProcedureName || message.procedure.template?.nameAr || "عملية"}`
                      : ""}
                  </span>
                  {message.isUrgent ? (
                    <span
                      className="admin-status-badge is-danger"
                      style={{ marginInlineStart: "0.4rem" }}
                    >
                      عاجلة
                    </span>
                  ) : null}
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <span className="admin-status-badge">
                    {messageStatusLabels[message.status]}
                  </span>
                  <span className="admin-text-faint" style={{ fontSize: "0.8em" }}>
                    {formatDateTime(message.createdAt)}
                  </span>
                </div>
              </div>
              <p style={{ margin: "0.6rem 0", whiteSpace: "pre-wrap" }}>
                {message.message}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
                {canReply && message.status !== "CLOSED" ? (
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <MessageReplyForm
                      messageId={message.id}
                      patientId={message.patient.id}
                    />
                  </div>
                ) : null}
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
            </article>
          ))}
        </div>
      )}

      {result.pageCount > 1 ? (
        <nav
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginBlock: "1rem",
          }}
        >
          {result.page > 1 ? (
            <Link
              href={`/admin/patients/messages?page=${result.page - 1}` as Route}
              className="admin-btn-secondary"
            >
              السابق
            </Link>
          ) : null}
          <span style={{ alignSelf: "center" }}>
            صفحة {result.page} من {result.pageCount}
          </span>
          {result.page < result.pageCount ? (
            <Link
              href={`/admin/patients/messages?page=${result.page + 1}` as Route}
              className="admin-btn-secondary"
            >
              التالي
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
