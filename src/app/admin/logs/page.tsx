import { toggleErrorLogResolutionAction } from "@/app/admin/logs/actions";
import { getErrorLogs } from "@/lib/content-repository";

export default async function AdminLogsPage() {
  const logs = await getErrorLogs();

  return (
    <>
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">السجلات والمراقبة</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          سجل الأخطاء التشغيلي
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          تعرض هذه الصفحة السجلات التشغيلية الحالية وحالة معالجتها، بما يساعد
          الفريق على متابعة الأعطال المفتوحة وإغلاق ما تم التعامل معه.
        </p>
      </section>
      <section className="grid gap-4">
        {logs.map((log) => (
          <article key={log.id} className="surface-panel rounded-[1.85rem] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-ink text-lg font-semibold">{log.route}</p>
                <p className="text-ink-soft mt-1 text-sm">
                  HTTP {log.statusCode}
                </p>
              </div>
              <span className="border-line bg-surface text-ink-soft rounded-full border px-3 py-1 text-xs">
                {log.isResolved ? "معالج" : "مفتوح"}
              </span>
            </div>
            <p className="text-ink-soft mt-4 text-sm leading-7">
              {log.message}
            </p>
            <p className="text-ink-faint mt-2 text-xs">{log.createdAt}</p>
            <form action={toggleErrorLogResolutionAction} className="mt-4">
              <input type="hidden" name="logId" value={log.id} />
              <input
                type="hidden"
                name="nextValue"
                value={log.isResolved ? "false" : "true"}
              />
              <button
                type="submit"
                className="border-line bg-surface text-ink rounded-full border px-4 py-2 text-xs font-semibold"
              >
                {log.isResolved ? "إعادة فتح السجل" : "تعليم كمعالج"}
              </button>
            </form>
          </article>
        ))}
      </section>
    </>
  );
}
