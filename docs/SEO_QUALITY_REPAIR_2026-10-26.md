# SEO quality remediation — 26 October 2026

Base: `e961b35fddfd259365121ab393bed6dbb7475ff0` (`main`, PR #2).
Scope: the owner's SEO report and confirmed editorial attribution to Mahmoud Fouad and Rejuvera. This records code remediation and local verification; it does not certify a production deployment or Google indexing outcomes.

## Changes

- Emit a separate sitemap URL node for each genuine Arabic/English variant, with the same complete reciprocal alternate set. Unspecified translation availability defaults to false. Custom `/p/` pages have one HTML body, so an English title alone no longer advertises an English page. The journal index remains Arabic.
- Make language switching navigate to the corresponding URL, preserving campaign parameters, other query parameters and anchors. Server content, HTML language and canonical follow the URL and actual translation availability, rather than preference cookies. Hide the English toggle for untranslated content. Services and doctor profiles render the selected language instead of both language bodies. Privacy and terms now have language-specific metadata and canonicals for their existing translations.
- Replace internal design instructions in the doctor directory and the verified public landing-page note with visitor-facing copy. The landing repair changes only text nodes during rendering, preserving stored CMS HTML, forms, attributes, styles and executable integrations.
- Show a service excerpt in the hero and its full description once in the details. Stop manufacturing benefits by repeating the excerpt and slicing the description mid-sentence. Authored seed benefits remain available.
- Show the owner-confirmed Mahmoud Fouad/Rejuvera byline and matching `BlogPosting.author` entities. No medical reviewer, medical qualification or review claim has been invented.
- Present existing doctor profile arrays under neutral professional section labels. Suppress duplicate job-title entries and biography fragments in the display projection; retain the source data and actual citation links. Future new seed records no longer populate education with a job title or publications with a biography. Existing `update: {}` behavior remains intact.
- Remove the developer website credit, remote developer logo and personal developer metadata/schema from the clinic identity. The confirmed article authorship is separate editorial information.

No migrations, production database writes, seed runs, dependency upgrades or URL removals were performed. Booking, CRM and conversion integrations remain covered by the regression checks.

## Verification

Used Node 22.19.0 and an isolated local environment with database URLs, provider credentials and Render markers removed. The production prebuild correctly skipped its Render-only seed step.

| Check | Result |
| --- | --- |
| Production build (`NODE_ENV=production npm run build`) | Passed, standalone assets synchronized |
| Typecheck | Passed |
| Full lint | 0 errors; 63 existing warnings (62 in ignored local audit JS, one ImagePicker effect warning) |
| SEO suite | 23 passed, including 11 new regression tests |
| Phase 1 / release safety | 11 / 13 passed |
| Lead tracking / Snap / Meta / OpenAI Ads | 48 / 32 / 4 / 3 passed |
| CSP / facelift / landing content / landing search / memory | 7 / 14 / 18 / 8 / 8 passed |
| Real local standalone SEO HTTP checks | 9 passed; XML parser accepted sitemap, 74 unique locations and 15 reciprocal language pairs |
| Real local standalone HTTP security checks | 30 passed, including session, preview/private responses, RSC, nonce/CSP and cache behavior |

The npm suites above total 189 successful test executions; some suites share test files. Language checks included conflicting preference cookies, Arabic/English service HTML, one H1, matching canonical, legal-page English URLs, attribution markup/schema and preservation of URL tracking parameters. React/server rendering and HTTP checks were performed; an interactive browser inspection was unavailable.

Local raw evidence is retained in the ignored `.codex-artifacts/seo-quality-2026-10-26/` directory (build, lint, typecheck, test and HTTP logs). These machine-specific artifacts and credentials are not part of the commit.

## Live observations and remaining evidence

Public HTTP reads before deploying these changes confirmed 200 responses for robots, sitemap index, page sitemap, doctors, neck-lift service and the custom plastic-surgery landing page. They reproduced the false English custom-page variant and internal/repeated copy. Contrary to the supplied report's assertion of availability, `/services/facelift-surgery` returned 404 at verification time. Local seed content renders that route, but production publication state was not changed or guessed.

- Search Console exposed no connected sites. Query overlap, selected canonicals, indexing and organic performance therefore remain unverified. Related procedure pages were preserved; no speculative redirects or canonical consolidation were added.
- The official PageSpeed endpoint returned HTTP 429 (quota exceeded). No Lighthouse/Core Web Vitals scores or speed improvements are claimed. `IMAGE_UNOPTIMIZED` was retained pending reliable measurements and hosting-memory evidence.
- Production deployment and the serving Git SHA remain unverified. After deployment, repeat live HTTP and language checks against the deployed commit, then obtain Search Console and mobile performance evidence to close these remaining items.

## Primary guidance

- [Google: localized versions and reciprocal sitemap annotations](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: multilingual sites and language-specific URLs](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Google: Article structured data and author properties](https://developers.google.com/search/docs/appearance/structured-data/article)
