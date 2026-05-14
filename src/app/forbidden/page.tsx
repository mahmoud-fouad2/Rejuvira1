import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function ForbiddenPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />
      <main className="section-shell py-16">
        <section className="surface-panel rounded-[2.5rem] p-8 lg:p-12">
          <p className="eyebrow">403</p>
          <h1 className="text-ink mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
            ليست لديك صلاحية كافية للوصول إلى هذا القسم.
          </h1>
          <p className="text-ink-soft mt-4 max-w-2xl text-base leading-8">
            هذا القسم مخصص لصلاحيات إدارية محددة. إذا كنت بحاجة للوصول إليه،
            يرجى استخدام الحساب المناسب أو العودة إلى الأقسام المتاحة لك.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="bg-ink text-canvas rounded-full px-5 py-3 text-sm font-semibold"
            >
              العودة إلى الأدمن
            </Link>
            <Link
              href="/"
              className="border-line bg-surface text-ink rounded-full border px-5 py-3 text-sm font-semibold"
            >
              العودة للرئيسية
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
