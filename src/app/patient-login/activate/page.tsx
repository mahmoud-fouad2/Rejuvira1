import type { Metadata } from "next";
import Link from "next/link";

import { ActivateAccountForm } from "@/components/portal/ActivateAccountForm";
import { lookupActivationToken } from "@/lib/portal/patient-auth";
import { getPortalSettings } from "@/lib/portal/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تفعيل حساب بوابة المرضى — Rejuvera",
  robots: { index: false, follow: false },
};

const REASON_MESSAGES: Record<string, string> = {
  invalid: "رابط التفعيل غير صالح. تأكد من نسخ الرابط كاملًا أو اطلب رابطًا جديدًا من المركز.",
  expired: "انتهت صلاحية رابط التفعيل. تواصل مع المركز لإرسال رابط جديد.",
  used: "تم استخدام هذا الرابط من قبل. يمكنك تسجيل الدخول مباشرة بكلمة المرور التي اخترتها.",
  locked: "تم إيقاف هذا الرابط بعد محاولات متكررة. اطلب رابطًا جديدًا من المركز.",
};

export default async function ActivatePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  const [lookup, settings] = await Promise.all([
    token
      ? lookupActivationToken(token)
      : Promise.resolve({ ok: false as const, reason: "invalid" as const }),
    getPortalSettings(),
  ]);

  return (
    <main className="rv-login-shell">
      <div className="rv-login-card">
        {lookup.ok ? (
          <ActivateAccountForm
            token={token}
            passwordMinLength={settings.passwordMinLength}
          />
        ) : (
          <div className="rv-login-form">
            <div className="rv-login-heading">
              <h1>
                <span className="lang-ar">تعذّر فتح رابط التفعيل</span>
                <span className="lang-en">Activation link problem</span>
              </h1>
              <p>
                <span className="lang-ar">
                  {REASON_MESSAGES[lookup.reason] ?? REASON_MESSAGES.invalid}
                </span>
                <span className="lang-en">
                  This activation link cannot be used. Please contact the
                  clinic for a new link.
                </span>
              </p>
            </div>
            <div className="grid gap-3 text-center text-sm">
              <Link
                href="/patient-login"
                className="bg-ink text-canvas rounded-[1.35rem] px-6 py-3.5 font-semibold"
              >
                <span className="lang-ar">الذهاب لتسجيل الدخول</span>
                <span className="lang-en">Go to sign in</span>
              </Link>
              <Link href="/contact" className="underline opacity-80">
                <span className="lang-ar">التواصل مع المركز</span>
                <span className="lang-en">Contact the clinic</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
