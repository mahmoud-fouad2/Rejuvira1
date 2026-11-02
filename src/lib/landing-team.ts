import type { DoctorRecord } from "./content-repository";
import type { TeamMember } from "./landing-blocks.ts";
import { LOAI_ALSALMI } from "./landing-doctors.ts";

export const isTeamLanding = (slug: string) =>
  slug === "tk" || slug === "tiktok-customer";

/** Use the clinic's complete published roster, in its existing editorial order. */
export function landingTeamFromDoctors(
  doctors: readonly Pick<
    DoctorRecord,
    | "slug"
    | "name"
    | "title"
    | "specialty"
    | "photoUrl"
    | "coverImageUrl"
    | "status"
  >[],
): TeamMember[] {
  const seen = new Set<string>();
  return doctors.flatMap((doctor) => {
    if (doctor.status !== "PUBLISHED" || seen.has(doctor.slug)) return [];
    seen.add(doctor.slug);
    const photo =
      doctor.slug === "loai-alsalmi"
        ? LOAI_ALSALMI.photo
        : doctor.photoUrl || doctor.coverImageUrl;
    return [
      {
        name: doctor.name,
        title: doctor.title,
        photo: /^(?:https:\/\/|\/(?!\/))/.test(photo)
          ? photo
          : "/media/brand/logo-light.png",
        blurb: doctor.specialty === doctor.title ? "" : doctor.specialty,
        href: `/doctors/${encodeURIComponent(doctor.slug)}`,
      },
    ];
  });
}
