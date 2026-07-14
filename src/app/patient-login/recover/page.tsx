import type { Metadata } from "next";

import { RecoverAccountForm } from "@/components/portal/RecoverAccountForm";
import { getRuntimeSettings } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "استعادة حساب بوابة المرضى — Rejuvera",
  robots: { index: false, follow: false },
};

export default async function RecoverPage() {
  const settings = await getRuntimeSettings();

  return (
    <main className="rv-login-shell">
      <div className="rv-login-card">
        <RecoverAccountForm clinicPhone={settings.contact.phone} />
      </div>
    </main>
  );
}
