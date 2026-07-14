import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PatientLoginForm } from "@/components/portal/PatientLoginForm";
import { getPatientSession } from "@/lib/portal/patient-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "بوابة المرضى — Rejuvera Patient Portal",
  description: "تسجيل دخول مرضى مركز ريجوفيرا لمتابعة التعليمات والمواعيد.",
  robots: { index: false, follow: false },
};

export default async function PatientLoginPage() {
  const session = await getPatientSession();
  if (session) redirect("/portal");

  return (
    <main className="rv-login-shell">
      <div className="rv-login-card">
        <PatientLoginForm />
      </div>
    </main>
  );
}
