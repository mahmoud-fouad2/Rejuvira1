import { randomInt } from "node:crypto";

import type { Metadata } from "next";

import { HomeContactSection } from "@/components/home/HomeContactSection";
import { V0InspiredHome } from "@/components/home/V0InspiredHome";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getDevices,
  getDoctors,
  getGalleryItems,
  getJournalPosts,
  getRuntimeSettings,
  getServices,
} from "@/lib/content-repository";
import { coreSearchKeywords } from "@/lib/core-search";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    page: "home",
    path: "/",
    overrideTitleAr: "ريجوفيرا بالرياض | جراحة التجميل والعناية المتكاملة",
    overrideTitleEn:
      "Rejuvera Riyadh | Plastic Surgery and Integrated Aesthetic Care",
    overrideDescriptionAr:
      "مركز ريجوفيرا الطبي في الرياض لخدمات شد الوجه والرقبة، علاج الوذمة الشحمية، التجميل النسائي، وتقنيات وأجهزة طبية مختارة تحت إشراف فريق متخصص.",
    overrideDescriptionEn:
      "Rejuvera Medical Center in Riyadh provides facelift, neck lift, lipedema, female aesthetic care, and selected medical technologies through specialist-led assessment.",
    overrideKeywords: coreSearchKeywords.join(", "),
  });
}

function rotatePosts<T>(posts: T[]) {
  if (posts.length <= 1) return posts;
  const offset = randomInt(posts.length);
  return [...posts.slice(offset), ...posts.slice(0, offset)];
}

export default async function HomePage() {
  const [settings, services, doctors, devices, galleryItems, journalPosts] =
    await Promise.all([
      getRuntimeSettings(),
      getServices(),
      getDoctors(),
      getDevices(),
      getGalleryItems(),
      getJournalPosts(),
    ]);

  return (
    <div className="bg-background text-foreground relative min-h-screen max-w-full min-w-0 overflow-x-clip">
      <SiteHeader />
      <V0InspiredHome
        settings={settings}
        services={services}
        doctors={doctors}
        devices={devices}
        galleryItems={galleryItems}
        journalPosts={rotatePosts(journalPosts)}
      />
      <HomeContactSection settings={settings} services={services} />
      <SiteFooter />
    </div>
  );
}
