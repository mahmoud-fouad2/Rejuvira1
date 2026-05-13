import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />
      <main className="section-shell py-16">
        <section className="surface-panel rounded-[2.5rem] p-8 lg:p-12">
          <p className="eyebrow">404</p>
          <h1 className="text-ink mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
            الصفحة غير موجودة.
          </h1>
          <p className="text-ink-soft mt-4 max-w-2xl text-base leading-8">
            ربما تم تغيير الرابط أو لم يتم إنشاء هذا القسم بعد داخل الدفعات
            الحالية من المشروع.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="bg-ink text-canvas rounded-full px-5 py-3 text-sm font-semibold"
            >
              العودة للرئيسية
            </Link>
            <Link
              href="/contact"
              className="border-line bg-surface text-ink rounded-full border px-5 py-3 text-sm font-semibold"
            >
              التواصل معنا
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
