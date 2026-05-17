import { randomInt } from "node:crypto";

import { HomeContactSection } from "@/components/home/HomeContactSection";
import { CinematicIntro } from "@/components/home/CinematicIntro";
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
      <CinematicIntro
        logoSrc="/media/brand/intro-logo.png"
        logoAlt={settings.brand.logoAlt}
      />
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
