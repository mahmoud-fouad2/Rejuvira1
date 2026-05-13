import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[var(--max-width)] items-center px-6 py-10 lg:px-10">
      <section className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <article className="surface-panel rounded-[2.5rem] p-7 lg:p-10">
          <p className="text-ink-soft font-mono text-xs tracking-[0.36em] uppercase">
            دخول الإدارة
          </p>
          <h1 className="balanced-text text-ink mt-4 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
            تسجيل دخول هادئ وواضح للوصول إلى لوحة الإدارة.
          </h1>
          <p className="text-ink-soft mt-5 max-w-2xl text-base leading-8">
            هذه الشاشة مخصصة لفريق الإدارة الداخلي، وتمنح وصولًا آمنًا إلى
            متابعة المحتوى والطلبات والإعدادات الأساسية.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="border-line bg-surface-accent rounded-[1.5rem] border p-4">
              <p className="text-ink text-lg font-semibold">وصول آمن</p>
              <p className="text-ink-soft mt-2 text-sm leading-6">
                الدخول مخصص للحسابات الإدارية المعتمدة فقط.
              </p>
            </div>
            <div className="border-line bg-surface-accent rounded-[1.5rem] border p-4">
              <p className="text-ink text-lg font-semibold">تنظيم الصلاحيات</p>
              <p className="text-ink-soft mt-2 text-sm leading-6">
                تظهر لكل مستخدم الوحدات المناسبة لدوره داخل لوحة الإدارة.
              </p>
            </div>
          </div>
          <div className="text-ink-soft mt-8 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/"
              className="border-line hover:bg-surface rounded-full border px-4 py-2 transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        </article>
        <article className="surface-panel rounded-[2.5rem] p-7 lg:p-10">
          <p className="text-ink-soft font-mono text-xs tracking-[0.36em] uppercase">
            تسجيل الدخول
          </p>
          <h2 className="text-ink mt-4 font-serif text-4xl tracking-[-0.05em]">
            ابدأ الجلسة الإدارية
          </h2>
          <p className="text-ink-soft mt-3 text-sm leading-7">
            استخدم البريد وكلمة المرور الخاصة بحساب الإدارة المعتمد للدخول إلى
            اللوحة.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </article>
      </section>
    </main>
  );
}
