import {
  LANDING_SEARCH_RELEASE,
  landingSearchProfile,
} from "@/lib/landing-search-content";

export function LandingSearchContent({
  slug,
  seoSlug,
}: {
  slug: string;
  seoSlug?: string | null;
}) {
  const profile = landingSearchProfile(slug, seoSlug);
  if (!profile) return null;
  return (
    <section
      className="rv-search-guide"
      lang="ar"
      dir="rtl"
      data-search-content-release={LANDING_SEARCH_RELEASE}
      aria-labelledby="rv-search-guide-title"
    >
      <p className="rv-search-guide__kicker">
        قبل الاستشارة · ريجوفيرا، الرياض
      </p>
      <h2 id="rv-search-guide-title">{profile.heading}</h2>
      <p>{profile.intro}</p>
      <h3>{profile.focusHeading}</h3>
      <p>{profile.focus}</p>
      <div className="rv-search-guide__questions">
        {profile.questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
