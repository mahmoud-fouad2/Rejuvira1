/** Historic CMS summaries were stored in publications, and seed job titles in
 * education. Keep the source data intact, but avoid presenting duplicates as
 * evidence of research or educational qualifications. */
export function doctorProfileSections(
  doctor: {
    title: string;
    specialty: string;
    summary: string;
    bio: string;
    education: readonly string[];
    achievements: readonly string[];
    publications: readonly string[];
  },
  english = false,
) {
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  const unique = (items: readonly string[]) => [
    ...new Set(items.map(normalize).filter(Boolean)),
  ];
  const education = unique(doctor.education).filter(
    (item) =>
      item !== normalize(doctor.title) && item !== normalize(doctor.specialty),
  );
  const publications = unique(doctor.publications).filter(
    (item) =>
      /https?:\/\/|\bdoi\b|\bPMID\b/i.test(item) ||
      (item !== normalize(doctor.summary) &&
        !normalize(doctor.bio).startsWith(item)),
  );
  return [
    {
      id: "education",
      label: english ? "Qualifications and experience" : "المؤهلات والخبرة",
      items: education,
    },
    {
      id: "achievements",
      label: english ? "Professional experience" : "الخبرات والمحطات المهنية",
      items: unique(doctor.achievements),
    },
    {
      id: "publications",
      label: english
        ? "Additional professional information"
        : "معلومات مهنية إضافية",
      items: publications,
    },
  ];
}
