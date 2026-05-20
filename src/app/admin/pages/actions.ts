"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteCustomPage,
  getDevices,
  getDoctors,
  getServices,
  upsertCustomPageBySlug,
} from "@/lib/content-repository";
import { buildServiceLandingPageInput } from "@/lib/service-landing-pages";

function revalidate(slug?: string, oldSlug?: string) {
  revalidatePath("/admin/pages");
  if (slug) {
    revalidatePath(`/p/${slug}`);
  }
  if (oldSlug && oldSlug !== slug) {
    revalidatePath(`/p/${oldSlug}`);
  }
  revalidatePath("/sitemap.xml");
}

export async function deleteCustomPageAction(formData: FormData) {
  const id = formData.get("id");
  const slug = formData.get("slug");
  if (typeof id !== "string" || !id) return;
  await deleteCustomPage(id);
  revalidate(typeof slug === "string" ? slug : undefined);
}

export async function generateServiceLandingPagesAction() {
  const [services, doctors, devices] = await Promise.all([
    getServices(),
    getDoctors(),
    getDevices(),
  ]);
  const eligibleServices = services.filter(
    (service) =>
      service.status === ContentStatus.PUBLISHED ||
      service.status === ContentStatus.APPROVED,
  );
  let savedCount = 0;

  for (const service of eligibleServices) {
    const input = buildServiceLandingPageInput(service, doctors, devices);
    const result = await upsertCustomPageBySlug(input);
    if (result.mode === "database") {
      savedCount += 1;
      revalidate(input.slug);
    }
  }

  revalidatePath("/admin/pages");
  revalidatePath("/sitemap.xml");
  redirect(
    `/admin/pages?generated=service-pages&count=${savedCount}&eligible=${eligibleServices.length}`,
  );
}
