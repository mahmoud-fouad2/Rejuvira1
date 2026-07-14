import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { formatDateTime } from "@/lib/portal/labels";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "patient.created": "إنشاء مريض",
  "patient.updated": "تعديل مريض",
  "patient.viewed": "عرض ملف مريض",
  "patient.archived": "أرشفة مريض",
  "patient.restored": "استعادة مريض",
  "patient.import": "استيراد مرضى",
  "patient.activation_issued": "إصدار رابط تفعيل",
  "patient.recovery_issued": "إصدار رابط استعادة",
  "patient.account_activated": "تفعيل حساب",
  "patient.password_reset": "إعادة تعيين كلمة مرور",
  "patient.password_changed": "تغيير كلمة مرور",
  "patient.login": "تسجيل دخول مريض",
  "patient.login_failed": "محاولة دخول فاشلة",
  "procedure.created": "إضافة عملية",
  "procedure.updated": "تعديل عملية",
  "procedure.archived": "أرشفة عملية",
  "procedure.instructions_published": "نشر تعليمات",
  "procedure.instructions_acknowledged": "تأكيد قراءة التعليمات",
  "procedure.pdf_generated": "طباعة/تنزيل PDF",
  "template.created": "إنشاء قالب",
  "template.updated": "تعديل قالب",
  "template.new_version": "إصدار جديد لقالب",
  "template.approved": "اعتماد قالب طبيًا",
  "template.archived": "أرشفة قالب",
  "appointment.created": "إضافة متابعة",
  "appointment.status_changed": "تحديث حالة متابعة",
  "message.replied": "رد على رسالة",
  "message.sent": "رسالة من مريض",
  "feedback.submitted": "تقييم جديد",
  "feedback.status_changed": "تحديث حالة تقييم",
  "portal.settings_updated": "تعديل إعدادات البوابة",
  "document.downloaded": "تنزيل مستند",
};

export default async function PortalActivityPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([auth(), props.searchParams]);
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "audit.view")) {
    redirect("/forbidden");
  }

  const page = Math.max(
    1,
    Number.parseInt(typeof params.page === "string" ? params.page : "", 10) || 1,
  );
  const action = typeof params.action === "string" ? params.action : "";
  const pageSize = 50;

  const where = action ? { action } : {};
  const [total, rows] = await prisma.$transaction([
    prisma.portalAuditLog.count({ where }),
    prisma.portalAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>سجل نشاط بوابة المرضى</h1>
          <p>
            {total} حدث مسجل — يشمل العرض والتعديل والطباعة وتسجيلات الدخول.
          </p>
        </div>
      </div>
      <PatientsSubNav active="activity" role={role} />

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
            <span className="admin-field-label">نوع الحدث</span>
            <select name="action" defaultValue={action} className="admin-input">
              <option value="">الكل</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="admin-btn-secondary">
            تصفية
          </button>
        </form>
      </section>

      {rows.length === 0 ? (
        <div className="admin-empty-state">
          <p>لا توجد أحداث مسجلة بعد.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-users-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>الوقت</th>
                <th>المنفذ</th>
                <th>الحدث</th>
                <th>السجل</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatDateTime(row.createdAt)}</td>
                  <td>
                    {row.actorType === "PATIENT"
                      ? "مريض"
                      : row.actorType === "SYSTEM"
                        ? "النظام"
                        : row.actorName || "موظف"}
                  </td>
                  <td>{ACTION_LABELS[row.action] ?? row.action}</td>
                  <td>
                    {row.patientId ? (
                      <Link href={`/admin/patients/${row.patientId}` as Route}>
                        فتح ملف المريض
                      </Link>
                    ) : (
                      row.entityType
                    )}
                  </td>
                  <td dir="ltr">{row.ipAddress ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 ? (
        <nav
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginBlock: "1rem",
          }}
        >
          {page > 1 ? (
            <Link
              href={`/admin/patients/activity?page=${page - 1}${action ? `&action=${action}` : ""}` as Route}
              className="admin-btn-secondary"
            >
              السابق
            </Link>
          ) : null}
          <span style={{ alignSelf: "center" }}>
            صفحة {page} من {pageCount}
          </span>
          {page < pageCount ? (
            <Link
              href={`/admin/patients/activity?page=${page + 1}${action ? `&action=${action}` : ""}` as Route}
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
