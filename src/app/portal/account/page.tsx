import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/portal/ChangePasswordForm";
import { endAllSessionsAction } from "../actions";
import { formatDateTime } from "@/lib/portal/labels";
import { getPatientSession } from "@/lib/portal/patient-auth";
import { maskPhone } from "@/lib/portal/permissions";
import { getPortalSettings } from "@/lib/portal/settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortalAccountPage() {
  const session = await getPatientSession();
  if (!session) redirect("/patient-login");

  const [patient, settings, activeSessions] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: session.patientId },
      include: { account: true },
    }),
    getPortalSettings(),
    prisma.patientSession.count({
      where: {
        patientId: session.patientId,
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
    }),
  ]);
  if (!patient) redirect("/patient-login");

  return (
    <div className="patient-portal-dashboard">
      <section className="patient-portal-hero">
        <p className="text-xs font-semibold tracking-wide uppercase opacity-60">
          <span className="lang-ar">بيانات آمنة ومحدثة</span>
          <span className="lang-en">Secure account</span>
        </p>
        <h1 className="text-2xl font-bold">
          <span className="lang-ar">حسابي</span>
          <span className="lang-en">My account</span>
        </h1>
        <p className="mt-1 text-sm opacity-75">
          <span className="lang-ar">
            راجع بيانات ملفك، غيّر كلمة المرور، وتابع الجلسات النشطة.
          </span>
          <span className="lang-en">
            Review your file details, password and active sessions.
          </span>
        </p>
      </section>

      <section className="patient-account-grid">
        <article className="patient-portal-card patient-account-card">
        <h2 className="font-bold">
          <span className="lang-ar">بياناتي</span>
          <span className="lang-en">My details</span>
        </h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="opacity-60">
              <span className="lang-ar">الاسم</span>
              <span className="lang-en">Name</span>
            </dt>
            <dd className="font-semibold">{patient.fullNameAr}</dd>
          </div>
          <div>
            <dt className="opacity-60">
              <span className="lang-ar">رقم الملف</span>
              <span className="lang-en">File number</span>
            </dt>
            <dd className="font-semibold" dir="ltr">
              {patient.fileNumber}
            </dd>
          </div>
          <div>
            <dt className="opacity-60">
              <span className="lang-ar">الجوال</span>
              <span className="lang-en">Phone</span>
            </dt>
            <dd className="font-semibold" dir="ltr">
              {maskPhone(patient.phone)}
            </dd>
          </div>
          <div>
            <dt className="opacity-60">
              <span className="lang-ar">آخر دخول</span>
              <span className="lang-en">Last sign-in</span>
            </dt>
            <dd className="font-semibold">
              {formatDateTime(patient.lastLoginAt)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs opacity-60">
          <span className="lang-ar">
            لتعديل بياناتك الشخصية تواصل مع المركز — لا يمكن تعديلها من البوابة
            حفاظًا على دقة ملفك الطبي.
          </span>
          <span className="lang-en">
            To change your personal details, please contact the clinic.
          </span>
        </p>
        </article>

        <article className="patient-portal-card patient-account-card">
        <h2 className="mb-4 font-bold">
          <span className="lang-ar">كلمة المرور</span>
          <span className="lang-en">Password</span>
        </h2>
        <ChangePasswordForm
          passwordMinLength={settings.passwordMinLength}
          mustChange={session.mustChangePassword}
        />
        </article>
      </section>

      <section className="patient-portal-card patient-account-card">
        <h2 className="font-bold">
          <span className="lang-ar">الجلسات النشطة</span>
          <span className="lang-en">Active sessions</span>
        </h2>
        <p className="mt-1 text-sm opacity-75">
          <span className="lang-ar">
            لديك {activeSessions} جلسة نشطة. إذا كنت تشك أن أحدًا دخل حسابك،
            أنهِ جميع الجلسات وغيّر كلمة مرورك.
          </span>
          <span className="lang-en">
            You have {activeSessions} active session(s).
          </span>
        </p>
        <form action={endAllSessionsAction} className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-[rgba(92,45,62,0.35)] px-5 py-2.5 text-sm font-semibold text-[oklch(38%_0.08_15)]"
          >
            <span className="lang-ar">إنهاء جميع الجلسات والخروج</span>
            <span className="lang-en">End all sessions and sign out</span>
          </button>
        </form>
      </section>

      {patient.account?.termsAcceptedAt ? (
        <p className="text-xs opacity-60">
          <span className="lang-ar">
            وافقت على شروط الاستخدام وسياسة الخصوصية (إصدار{" "}
            {patient.account.privacyPolicyVersion ?? "1.0"}) في{" "}
            {formatDateTime(patient.account.termsAcceptedAt)}.
          </span>
          <span className="lang-en">
            Terms and privacy policy (v
            {patient.account.privacyPolicyVersion ?? "1.0"}) accepted on{" "}
            {formatDateTime(patient.account.termsAcceptedAt)}.
          </span>
        </p>
      ) : null}
    </div>
  );
}
