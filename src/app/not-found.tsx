import Link from "next/link";
import type { Route } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

const popularLinks: Array<{
  href: Route;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
}> = [
  {
    href: "/services" as Route,
    titleAr: "دليل الخدمات",
    titleEn: "Services Directory",
    descAr: "استكشف خدمات شد الوجه، نحت الجسم، والعناية المتكاملة.",
    descEn: "Explore facelift, body contouring, and aesthetic care.",
    icon: "✨",
  },
  {
    href: "/doctors" as Route,
    titleAr: "فريق الأطباء",
    titleEn: "Medical Team",
    descAr: "تعرّف على الاستشاريين والتخصصات الطبية الدقيقة.",
    descEn: "Meet our board-certified consultants and surgeons.",
    icon: "🩺",
  },
  {
    href: "/gallery" as Route,
    titleAr: "معرض النتائج",
    titleEn: "Results Gallery",
    descAr: "شاهد نتائج حقيقية قبل وبعد للحالات الموثقة.",
    descEn: "View documented before & after real patient results.",
    icon: "🖼️",
  },
  {
    href: "/contact" as Route,
    titleAr: "حجز استشارة",
    titleEn: "Book Consultation",
    descAr: "تواصلي مباشرة مع فريق الاستقبال وتنسيق المواعيد.",
    descEn: "Get in touch directly with our medical coordination team.",
    icon: "📅",
  },
];

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />
      <main className="section-shell py-16 lg:py-24">
        <section className="surface-panel rounded-[2.5rem] p-8 lg:p-14 text-center max-w-4xl mx-auto shadow-sm">
          <span className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-purple-900/10 text-purple-900 dark:text-purple-300 font-serif text-2xl font-bold mb-4">
            404
          </span>
          <h1 className="text-ink font-serif text-4xl md:text-5xl leading-[1.15] tracking-[-0.02em]">
            <span className="lang-ar">عذراً، الصفحة غير موجودة.</span>
            <span className="lang-en">Page not found.</span>
          </h1>
          <p className="text-ink-soft mt-4 max-w-xl mx-auto text-base leading-8">
            <span className="lang-ar">
              ربما تم نقل الصفحة أو تغيير الرابط. يمكنك العودة للرئيسية أو اختيار أحد الأقسام الشائعة أدناه:
            </span>
            <span className="lang-en">
              The page might have moved. You can return to home or explore our popular sections below:
            </span>
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 text-start">
            {popularLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-line bg-surface/80 hover:bg-surface rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-purple-600/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0" aria-hidden>{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm font-bold text-ink group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                      <span className="lang-ar">{item.titleAr}</span>
                      <span className="lang-en">{item.titleEn}</span>
                    </strong>
                    <p className="text-xs text-ink-soft mt-1 truncate">
                      <span className="lang-ar">{item.descAr}</span>
                      <span className="lang-en">{item.descEn}</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="btn-primary px-7 py-3 text-sm font-bold"
            >
              <span className="lang-ar">العودة للصفحة الرئيسية</span>
              <span className="lang-en">Back to Home</span>
            </Link>
            <Link
              href="/contact"
              className="btn-secondary px-7 py-3 text-sm font-bold"
            >
              <span className="lang-ar">تواصلي معنا</span>
              <span className="lang-en">Contact Us</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
