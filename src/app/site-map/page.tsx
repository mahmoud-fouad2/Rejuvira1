import Link from "next/link";
import type { Metadata, Route } from "next";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  getCustomPages,
  getDoctors,
  getJournalPosts,
  getRuntimeSettings,
  getServices,
} from "@/lib/content-repository";
import {
  buildPublicDirectory,
  type PublicDirectoryLink,
} from "@/lib/public-directory";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    page: "services",
    path: "/site-map",
    overrideTitleAr: "دليل صفحات ريجوفيرا | الخدمات والأطباء والمقالات",
    overrideTitleEn: "Rejuvera site directory | Services, doctors and articles",
    overrideDescriptionAr:
      "تصفح خدمات ريجوفيرا بالرياض، وملفات الأطباء، والمقالات الطبية، والصفحات العامة المنشورة، وتواصل لتنسيق استشارتك.",
    overrideDescriptionEn:
      "Browse Rejuvera's services in Riyadh, doctor profiles, medical articles and published public pages, and contact the center to arrange a consultation.",
  });
}

function DirectorySection({
  id,
  titleAr,
  titleEn,
  items,
}: {
  id: string;
  titleAr: string;
  titleEn: string;
  items: readonly PublicDirectoryLink[];
}) {
  if (!items.length) return null;
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="surface-panel rounded-[2.5rem] p-7 lg:p-10"
    >
      <h2 id={`${id}-title`} className="text-ink-strong font-serif text-3xl">
        <span className="lang-ar">{titleAr}</span>
        <span className="lang-en">{titleEn}</span>
      </h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.href} className="min-w-0">
            <Link
              href={item.href as Route}
              className="text-purple-mid leading-7 break-words underline"
            >
              <span className="lang-ar">{item.titleAr}</span>
              <span
                className="lang-en"
                lang={item.titleEn ? "en" : "ar"}
                dir={item.titleEn ? "ltr" : "rtl"}
              >
                {item.titleEn || item.titleAr}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function SiteMapPage() {
  const [services, doctors, posts, pages, settings] = await Promise.all([
    getServices(),
    getDoctors(),
    getJournalPosts(),
    getCustomPages(),
    getRuntimeSettings(),
  ]);
  const directory = buildPublicDirectory({ services, doctors, posts, pages });
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="public-page-atmosphere" aria-hidden />
      <SiteHeader />
      <main className="section-shell space-y-6 pt-8 pb-20">
        <section className="surface-panel rounded-[2.5rem] p-7 lg:p-10">
          <h1 className="text-ink-strong font-serif text-4xl">
            <span className="lang-ar">دليل صفحات ريجوفيرا</span>
            <span className="lang-en">Rejuvera site directory</span>
          </h1>
          <p className="text-ink-soft mt-5 max-w-3xl leading-8">
            <span className="lang-ar">
              ابدأ بالخدمة التي تريد معرفة تفاصيلها، أو تعرف على الأطباء، أو
              اقرأ عن الخيارات والأسئلة التي تهمك قبل الاستشارة في الرياض.
            </span>
            <span className="lang-en">
              Explore a service, learn about the doctors, or read about options
              and questions to discuss before your consultation in Riyadh.
            </span>
          </p>
          <nav
            aria-label="Directory sections"
            className="text-purple-mid mt-6 flex flex-wrap gap-5 underline"
          >
            <Link href="#services">
              <span className="lang-ar">الخدمات</span>
              <span className="lang-en">Services</span>
            </Link>
            <Link href="#doctors">
              <span className="lang-ar">الأطباء</span>
              <span className="lang-en">Doctors</span>
            </Link>
            <Link href="#articles">
              <span className="lang-ar">المقالات</span>
              <span className="lang-en">Articles</span>
            </Link>
            {directory.pages.length > 0 && (
              <Link href="#public-pages">
                <span className="lang-ar">صفحات أخرى</span>
                <span className="lang-en">Other pages</span>
              </Link>
            )}
          </nav>
        </section>
        <DirectorySection
          id="services"
          titleAr="الخدمات الطبية والتجميلية"
          titleEn="Medical and aesthetic services"
          items={directory.services}
        />
        <DirectorySection
          id="doctors"
          titleAr="ملفات الأطباء"
          titleEn="Doctor profiles"
          items={directory.doctors}
        />
        <DirectorySection
          id="articles"
          titleAr="المقالات الطبية"
          titleEn="Medical articles"
          items={directory.posts}
        />
        <DirectorySection
          id="public-pages"
          titleAr="صفحات ومعلومات أخرى"
          titleEn="Other pages and information"
          items={directory.pages}
        />
        <section className="surface-panel rounded-[2.5rem] p-7 lg:p-10">
          <h2 className="text-ink-strong font-serif text-3xl">
            <span className="lang-ar">الزيارة والتواصل</span>
            <span className="lang-en">Visit and contact</span>
          </h2>
          <p className="text-ink-soft mt-4 leading-8">
            <span className="lang-ar">{settings.contact.addressAr}</span>
            <span className="lang-en">
              {settings.contact.addressEn ?? settings.contact.addressAr}
            </span>
          </p>
          <ul className="text-purple-mid mt-5 flex flex-wrap gap-5 underline">
            <li>
              <Link href="/contact">
                <span className="lang-ar">تواصل لتنسيق موعد</span>
                <span className="lang-en">
                  Contact us to arrange an appointment
                </span>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <span className="lang-ar">عن المركز</span>
                <span className="lang-en">About the center</span>
              </Link>
            </li>
            <li>
              <Link href="/devices">
                <span className="lang-ar">الأجهزة</span>
                <span className="lang-en">Devices</span>
              </Link>
            </li>
            <li>
              <Link href="/gallery">
                <span className="lang-ar">معرض الصور</span>
                <span className="lang-en">Gallery</span>
              </Link>
            </li>
            <li>
              <Link href="/career">
                <span className="lang-ar">التوظيف</span>
                <span className="lang-en">Careers</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy">
                <span className="lang-ar">الخصوصية</span>
                <span className="lang-en">Privacy</span>
              </Link>
            </li>
            <li>
              <Link href="/terms">
                <span className="lang-ar">الشروط</span>
                <span className="lang-en">Terms</span>
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
