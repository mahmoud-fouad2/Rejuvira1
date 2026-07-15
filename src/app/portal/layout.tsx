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
    <div className="bg-canvas text-ink min-h-screen">
      <header className="border-border bg-canvas/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/portal" aria-label="Rejuvera Patient Portal" className="flex items-center gap-2">
            <BrandLogo alt="Rejuvera" width={96} height={72} variant="header" sizes="44px" />
            <span className="hidden text-sm font-semibold sm:inline">
              <span className="lang-ar">بوابة المرضى</span>
              <span className="lang-en">Patient Portal</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <form action={logoutAction}>
              <button
                type="submit"
                className="border-border rounded-full border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              >
                <span className="lang-ar">خروج</span>
                <span className="lang-en">Sign out</span>
              </button>
            </form>
          </div>
        </div>
        <PortalNav items={NAV_ITEMS} />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="border-border mx-auto max-w-6xl border-t px-4 py-6 text-center text-xs opacity-70">
        <p>
          <span className="lang-ar">
            هذه البوابة خاصة بمرضى مركز ريجوفيرا. المعلومات المعروضة إرشادية ولا
            تغني عن استشارة طبيبك.
          </span>
          <span className="lang-en">
            This portal is for Rejuvera Center patients. The information shown
            is guidance and does not replace consulting your doctor.
          </span>{" "}
          <Link href={"/patient-login/privacy" as Route} className="underline">
            <span className="lang-ar">سياسة الخصوصية</span>
            <span className="lang-en">Privacy policy</span>
          </Link>
        </p>
      </footer>
    </div>
  );
}
