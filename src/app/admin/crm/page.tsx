import { CrmSubmissionEditor } from "@/components/forms/CrmSubmissionEditor";
import { getCrmSubmissions } from "@/lib/content-repository";

const statusLabels = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  FOLLOW_UP: "متابعة",
  BOOKED: "محجوز",
  CLOSED: "مغلق",
} as const;

const sourceLabels: Record<string, string> = {
  Website: "الموقع الإلكتروني",
  "Service page": "صفحة الخدمات",
  "Doctor page": "صفحة الأطباء",
  "Contact page": "صفحة التواصل",
  Admin: "لوحة الإدارة",
};

export default async function AdminCrmPage() {
  const submissions = await getCrmSubmissions();

  return (
    <>
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">إدارة الطلبات</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          طلبات التواصل والمتابعة
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          أصبحت هذه الصفحة مهيأة للمتابعة الفعلية: مراجعة الطلب، تغيير حالته،
          وتدوين ملاحظات داخلية تساعد الفريق على التحرك بسرعة ووضوح.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/api/admin/crm/export?format=xlsx"
            className="bg-ink text-canvas rounded-full px-4 py-2 text-sm font-semibold"
          >
            تصدير Excel
          </a>
          <a
            href="/api/admin/crm/export?format=pdf"
            className="border-line bg-surface text-ink rounded-full border px-4 py-2 text-sm font-semibold"
          >
            تصدير PDF
          </a>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="admin-grid-card">
          <p className="text-ink-soft text-sm">الطلبات الجديدة</p>
          <p className="text-ink mt-2 font-serif text-3xl">
            {submissions.filter((item) => item.status === "NEW").length}
          </p>
        </div>
        <div className="admin-grid-card">
          <p className="text-ink-soft text-sm">تم التواصل</p>
          <p className="text-ink mt-2 font-serif text-3xl">
            {submissions.filter((item) => item.status === "CONTACTED").length}
          </p>
        </div>
        <div className="admin-grid-card">
          <p className="text-ink-soft text-sm">المواعيد المحجوزة</p>
          <p className="text-ink mt-2 font-serif text-3xl">
            {submissions.filter((item) => item.status === "BOOKED").length}
          </p>
        </div>
      </section>
      <section className="grid gap-4">
        {submissions.map((submission) => (
          <article
            key={submission.id}
            className="surface-panel rounded-[1.85rem] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-ink text-lg font-semibold">
                  {submission.fullName}
                </p>
                <p className="text-ink-soft mt-1 text-sm">
                  {submission.phone}{" "}
                  {submission.email ? `• ${submission.email}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="border-line bg-surface text-ink-soft rounded-full border px-3 py-1 text-xs">
                  {statusLabels[submission.status]}
                </span>
                <span className="border-line bg-surface text-ink-soft rounded-full border px-3 py-1 text-xs">
                  {sourceLabels[submission.source] ?? submission.source}
                </span>
              </div>
            </div>
            <p className="text-ink-soft mt-4 text-sm leading-7">
              الخدمة: {submission.serviceLabel ?? "غير محددة"}
            </p>
            {submission.notes ? (
              <p className="text-ink-faint mt-2 text-sm leading-7">
                {submission.notes}
              </p>
            ) : null}
            <CrmSubmissionEditor submission={submission} />
          </article>
        ))}
      </section>
    </>
  );
}
