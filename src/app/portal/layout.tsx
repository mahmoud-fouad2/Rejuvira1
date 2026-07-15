import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { PortalNav } from "@/components/portal/PortalNav";
import { logoutAction } from "./actions";
import { getPatientSession } from "@/lib/portal/patient-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NAV_ITEMS: { href: string; label: string; labelEn: string }[] = [
  { href: "/portal", label: "الرئيسية", labelEn: "Home" },
  { href: "/portal/messages", label: "رسائلي", labelEn: "Messages" },
  { href: "/portal/documents", label: "مستنداتي", labelEn: "Documents" },
  { href: "/portal/account", label: "حسابي", labelEn: "Account" },
];

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getPatientSession();
  if (!session) redirect("/patient-login");

  return (
    <div className="portal-shell">
      <header className="portal-topbar">
        <div className="portal-topbar__inner">
          <Link href="/portal" aria-label="Rejuvera Patient Portal" className="portal-brand">
            <BrandLogo alt="Rejuvera" width={92} height={66} variant="header" sizes="44px" />
            <span>
              <span className="lang-ar">بوابة المرضى</span>
              <span className="lang-en">Patient Portal</span>
            </span>
          </Link>
          <div className="portal-topbar__tools">
            <LanguageToggle />
            <form action={logoutAction}>
              <button type="submit" className="portal-btn portal-btn--secondary">
                <span className="lang-ar">خروج</span>
                <span className="lang-en">Sign out</span>
              </button>
            </form>
          </div>
        </div>
        <div className="portal-topbar__inner portal-topbar__navrow">
          <PortalNav items={NAV_ITEMS} />
        </div>
      </header>
      <main className="portal-main">{children}</main>
      <footer className="portal-footer">
        <p>
          <span className="lang-ar">
            هذه البوابة خاصة بمرضى مركز ريجوفيرا. المعلومات المعروضة إرشادية ولا تغني عن استشارة طبيبك.
          </span>
          <span className="lang-en">
            This portal is for Rejuvera Center patients. The information shown is guidance and does not replace consulting your doctor.
          </span>{" "}
          <Link href={"/patient-login/privacy" as Route}>
            <span className="lang-ar">سياسة الخصوصية</span>
            <span className="lang-en">Privacy policy</span>
          </Link>
        </p>
      </footer>
    </div>
  );
}
