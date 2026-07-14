import { redirect } from "next/navigation";
import {
  AppointmentStatus,
  MessageStatus,
  PatientAccountStatus,
  ProcedureStatus,
} from "@prisma/client";

import { auth } from "@/auth";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { procedureStatusLabels } from "@/lib/portal/labels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="admin-stat-card" style={{ padding: "1rem" }}>
      <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>{value}</p>
      <p className="admin-text-soft" style={{ margin: 0, fontSize: "0.85em" }}>
        {label}
      </p>
    </div>
  );
}

export default async function PatientStatsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([auth(), props.searchParams]);
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "stats.view")) {
    redirect("/forbidden");
  }
  const canExport = hasPortalCapability(role, "stats.export");

  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";
  const now = new Date();
  const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const toDate = to ? new Date(`${to}T23:59:59+03:00`) : now;
  const in48h = new Date(now.getTime() + 48 * 3600 * 1000);
  const dateRange = { gte: fromDate, lte: toDate };

  const [
    totalPatients,
    newPatients,
    pendingAccounts,
    upcomingProcedures,
    dueFollowUps,
    overdueFollowUps,
    unreadMessages,
    feedbackAgg,
    lowFeedback,
    publishedCount,
    acknowledgedCount,
    checklistTotal,
    checklistDone,
    procedureRows,
  ] = await prisma.$transaction([
    prisma.patient.count({ where: { archivedAt: null } }),
    prisma.patient.count({ where: { archivedAt: null, createdAt: dateRange } }),
    prisma.patient.count({
      where: { archivedAt: null, accountStatus: PatientAccountStatus.PENDING },
    }),
    prisma.procedure.count({
      where: {
        archivedAt: null,
        status: ProcedureStatus.SCHEDULED,
        procedureDate: { gte: now },
      },
    }),
    prisma.followUpAppointment.count({
      where: {
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        appointmentDate: { gte: now, lte: in48h },
      },
    }),
    prisma.followUpAppointment.count({
      where: {
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        appointmentDate: { lt: now },
      },
    }),
    prisma.patientMessage.count({
      where: { senderType: "PATIENT", status: MessageStatus.UNREAD },
    }),
    prisma.patientFeedback.aggregate({
      where: { submittedAt: dateRange },
      _avg: { overallRating: true },
      _count: true,
    }),
    prisma.patientFeedback.count({
      where: { submittedAt: dateRange, overallRating: { lte: 2 } },
    }),
    prisma.procedure.count({
      where: { archivedAt: null, instructionsPublishedAt: { not: null } },
    }),
    prisma.procedure.count({
      where: {
        archivedAt: null,
        instructionsPublishedAt: { not: null },
        instructionsAcknowledgedAt: { not: null },
      },
    }),
    prisma.procedureChecklistItem.count(),
    prisma.procedureChecklistItem.count({
      where: { patientCompletedAt: { not: null } },
    }),
    // Status + category distributions from a single lightweight select.
    prisma.procedure.findMany({
      where: { archivedAt: null },
      select: { status: true, category: true },
    }),
  ]);

  const ackRate = publishedCount
    ? Math.round((acknowledgedCount / publishedCount) * 100)
    : 0;

  const checklistRate = checklistTotal
    ? Math.round((checklistDone / checklistTotal) * 100)
    : 0;

  const statusMap = new Map<ProcedureStatus, number>();
  const categoryCounts = new Map<string, number>();
  for (const row of procedureRows) {
    statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1);
    const key = row.category || "";
    categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
  }
  const proceduresTotal = procedureRows.length;

  const avgRating = feedbackAgg._avg.overallRating
    ? feedbackAgg._avg.overallRating.toFixed(1)
    : "—";

  const categoryLabels: Record<string, string> = {
    face_neck: "الوجه والرقبة",
    body: "الجسم",
    breast: "الصدر",
    feminine: "التجميل النسائي",
    other: "أخرى",
  };
  const byCategory = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      label: category ? (categoryLabels[category] ?? category) : "غير مصنف",
      count,
    }))
    .sort((a, b) => b.count - a.count);
  const maxCategory = Math.max(1, ...byCategory.map((row) => row.count));

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>إحصائيات بوابة المرضى</h1>
          <p>أرقام حقيقية من قاعدة البيانات ضمن الفترة المحددة.</p>
        </div>
        {canExport ? (
          <div className="admin-page-header__actions">
            <a
              href={`/api/admin/patients/stats/export${from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString()}` : ""}`}
              className="admin-btn-secondary"
            >
              تصدير CSV
            </a>
          </div>
        ) : null}
      </div>
      <PatientsSubNav active="stats" role={role} />

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
            <span className="admin-field-label">من تاريخ</span>
            <input type="date" name="from" defaultValue={from} className="admin-input" />
          </label>
          <label>
            <span className="admin-field-label">إلى تاريخ</span>
            <input type="date" name="to" defaultValue={to} className="admin-input" />
          </label>
          <button type="submit" className="admin-btn-secondary">
            تطبيق
          </button>
        </form>
      </section>

      <section
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          marginBottom: "1rem",
        }}
      >
        <StatCard value={totalPatients} label="إجمالي المرضى" />
        <StatCard value={newPatients} label="مرضى جدد في الفترة" />
        <StatCard value={pendingAccounts} label="حسابات غير مفعلة" />
        <StatCard value={upcomingProcedures} label="عمليات قادمة" />
        <StatCard value={statusMap.get(ProcedureStatus.COMPLETED) ?? 0} label="عمليات مكتملة" />
        <StatCard
          value={
            (statusMap.get(ProcedureStatus.POSTPONED) ?? 0) +
            (statusMap.get(ProcedureStatus.CANCELLED) ?? 0)
          }
          label="مؤجلة / ملغاة"
        />
        <StatCard value={dueFollowUps} label="متابعات مستحقة (48 ساعة)" />
        <StatCard value={overdueFollowUps} label="متابعات متأخرة" />
        <StatCard value={unreadMessages} label="رسائل غير مقروءة" />
        <StatCard value={avgRating} label="متوسط التقييم" />
        <StatCard value={lowFeedback} label="تقييمات منخفضة (≤2)" />
        <StatCard value={`${ackRate}%`} label="نسبة تأكيد قراءة التعليمات" />
        <StatCard value={`${checklistRate}%`} label="نسبة إكمال قوائم المهام" />
        <StatCard value={feedbackAgg._count} label="عدد التقييمات في الفترة" />
      </section>

      <section className="admin-panel" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>العمليات حسب الحالة</h2>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.values(ProcedureStatus).map((status) => {
            const count = statusMap.get(status) ?? 0;
            const percent = proceduresTotal
              ? Math.round((count / proceduresTotal) * 100)
              : 0;
            return (
              <div key={status} style={{ display: "grid", gap: "0.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85em" }}>
                  <span>{procedureStatusLabels[status]}</span>
                  <span dir="ltr">
                    {count} ({percent}%)
                  </span>
                </div>
                <div style={{ height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 4 }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: "var(--admin-accent, #7a5c3a)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="admin-panel" style={{ padding: "1.25rem" }}>
        <h2 style={{ marginTop: 0 }}>العمليات حسب النوع</h2>
        {byCategory.length === 0 ? (
          <p className="admin-text-soft">لا توجد بيانات بعد.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {byCategory.map((row) => (
              <div key={row.label} style={{ display: "grid", gap: "0.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85em" }}>
                  <span>{row.label}</span>
                  <span dir="ltr">{row.count}</span>
                </div>
                <div style={{ height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 4 }}>
                  <div
                    style={{
                      width: `${Math.round((row.count / maxCategory) * 100)}%`,
                      height: "100%",
                      background: "var(--admin-gold, #c8a45a)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
