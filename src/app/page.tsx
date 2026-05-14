import { HomeContactSection } from "@/components/home/HomeContactSection";
import { V0InspiredHome } from "@/components/home/V0InspiredHome";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getDevices,
  getDoctors,
  getGalleryItems,
  getRuntimeSettings,
  getServices,
} from "@/lib/content-repository";

export default async function HomePage() {
  const [settings, services, doctors, devices, galleryItems] = await Promise.all([
    getRuntimeSettings(),
    getServices(),
    getDoctors(),
    getDevices(),
    getGalleryItems(),
  ]);

  return (
    <div className="relative min-h-screen min-w-0 max-w-full overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <V0InspiredHome
        settings={settings}
        services={services}
        doctors={doctors}
        devices={devices}
        galleryItems={galleryItems}
      />
      <HomeContactSection settings={settings} services={services} />
      <SiteFooter />
    </div>
  );
}
