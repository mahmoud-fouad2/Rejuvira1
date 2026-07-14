import Link from "next/link";
import type { Route } from "next";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import {
  formatDate,
  templateCategoryLabel,
  templateStatusLabels,
} from "@/lib/portal/labels";
import { listTemplates } from "@/lib/portal/repository";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { ensureDefaultProcedureTemplates } from "@/lib/portal/default-templates";

export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  DRAFT: "is-warning",
  MEDICALLY_APPROVED: "is-success",
  ARCHIVED: "is-muted",
};

export default async function TemplatesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([auth(), props.searchParams]);
  const role = session?.user?.role;
  const canEdit = hasPortalCapability(role, "templates.edit");

  const category =
    typeof params.category === "string" ? params.category : "";
  const includeArchived = params.archived === "1";

  await ensureDefaultProcedureTemplates();

  const templates = await listTemplates({
    category: category || "ALL",
    includeArchived,
  });

  const grouped = new Map<string, typeof templates>();
  for (const template of templates) {
    const list = grouped.get(template.category) ?? [];
    list.push(template);
    grouped.set(template.category, list);
  }

  return (
    <div className="patient-module-page">
      <div className="admin-page-header">
        <div>
          <h1>قوالب التعليمات</h1>
          <p>
            {templates.length} قالب — لا يُستخدم أي قالب مع المرضى قبل اعتماده
            طبيًا.
          </p>
        </div>
        {canEdit ? (
          <div className="admin-page-header__actions">
            <Link
              href={"/admin/patients/templates/new" as Route}
              className="admin-btn-primary"
            >
              قالب جديد
            </Link>
          </div>
        ) : null}
      </div>
      <PatientsSubNav active="templates" role={role} />

      <section className="patient-kpi-grid">
        <article className="patient-kpi-card">
          <span className="patient-kpi-card__icon" aria-hidden="true">T</span>
          <span>إجمالي القوالب</span>
          <strong>{templates.length}</strong>
          <small>قابلة للتعديل والنسخ</small>
        </article>
        <article className="patient-kpi-card">
          <span className="patient-kpi-card__icon" aria-hidden="true">✓</span>
          <span>قوالب معتمدة</span>
          <strong>
            {templates.filter((item) => item.status === "MEDICALLY_APPROVED").length}
          </strong>
          <small>صالحة للاستخدام مع المرضى</small>
        </article>
        <article className="patient-kpi-card">
          <span className="patient-kpi-card__icon" aria-hidden="true">!</span>
          <span>مسودات تحتاج مراجعة</span>
          <strong>{templates.filter((item) => item.status === "DRAFT").length}</strong>
          <small>لا تُستخدم قبل الاعتماد الطبي</small>
        </article>
      </section>

      <section className="admin-card patient-filter-card">
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
            <span className="admin-field-label">التصنيف</span>
            <select name="category" defaultValue={category} className="admin-input">
              <option value="">الكل</option>
              <option value="face_neck">عمليات الوجه والرقبة</option>
              <option value="body">عمليات الجسم</option>
              <option value="breast">عمليات الصدر</option>
              <option value="feminine">التجميل النسائي</option>
              <option value="other">قوالب إضافية</option>
            </select>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <input
              type="checkbox"
              name="archived"
              value="1"
              defaultChecked={includeArchived}
            />
            <span>عرض المؤرشفة</span>
          </label>
          <button type="submit" className="admin-btn-secondary">
            تصفية
          </button>
        </form>
      </section>

      {templates.length === 0 ? (
        <div className="admin-empty-state">
          <p>لا توجد قوالب بعد. أنشئ قالبًا جديدًا أو شغّل بيانات التهيئة.</p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([categoryKey, items]) => (
          <section key={categoryKey} style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.05em", marginBottom: "0.6rem" }}>
              {templateCategoryLabel(categoryKey)}
            </h2>
            <div className="admin-card patient-table-card">
              <div className="admin-table-wrap patient-table-wrap">
              <table className="admin-users-table patient-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>القالب</th>
                    <th>الإصدار</th>
                    <th>الحالة</th>
                    <th>اعتمده</th>
                    <th>آخر تحديث</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((template) => (
                    <tr key={template.id} className="admin-row-hover">
                      <td>{template.nameAr}</td>
                      <td>{template.version}</td>
                      <td>
                        <span
                          className={`admin-status-badge ${statusTone[template.status] ?? ""}`}
                        >
                          {templateStatusLabels[template.status]}
                        </span>
                      </td>
                      <td>
                        {template.approvedByName
                          ? `${template.approvedByName} — ${formatDate(template.approvedAt)}`
                          : "—"}
                      </td>
                      <td>{formatDate(template.updatedAt)}</td>
                      <td>
                        <Link
                          href={
                            `/admin/patients/templates/${template.id}` as Route
                          }
                          className="admin-btn-ghost"
                        >
                          فتح
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
