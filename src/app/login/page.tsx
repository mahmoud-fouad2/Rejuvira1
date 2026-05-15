import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "صفحة دخول الإدارة في Rejuvira Center.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="rv-login-shell">
      <div className="rv-login-card">
        <LoginForm />
      </div>
    </main>
  );
}
