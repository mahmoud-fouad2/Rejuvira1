# SEO follow-up — 27 October 2026

Base: `49c104a7f7410dbe0c077ee4c694aa4ed160497f` (merged PR #3).
Scope: complete the remaining work that can be established from source code, public HTTP responses and isolated local checks. No production data was changed.

## Findings and changes

### Broken footer service links

Live checks found footer links to `/services/facelift-surgery`, `/services/lipedema` and `/services/vaginoplasty`; all three returned HTTP 404 and were absent from the published sitemap. The footer took the first six records without filtering publication status. It now filters `PUBLISHED` before selecting links, consistent with the public service routes and sitemap. Draft/archive records stay unpublished. The booking selector uses the same published set. A regression test executes the real footer with draft/archive records sorted first and checks that neither their links nor titles reach the output.

### Reduce unnecessary browser data

The header's interactive menu received full service, doctor and device catalogs although it displayed four short items per column. Booking forms received full medical service records although the selector needs only ID, slug and name. Home carousels also received article bodies, doctor biographies and unrelated home settings.

Server-side projections now send only the fields these client components display. Their TypeScript contracts describe those fields. Existing card order, translations/fallbacks, image URLs, booking values, labels, phone overrides, reCAPTCHA key and conversion handlers are preserved. No new client dependency or image-processing workload was introduced.

### Verify the deployed revision explicitly

`/api/health` stays independent of the database and now returns `revision` from Render's documented `RENDER_GIT_COMMIT`. Only a full 40-character Git hash is accepted; missing/invalid values produce `null`. The response uses `Cache-Control: no-store`.

`npm run test:seo-live` performs read-only checks against the public website (or `SEO_AUDIT_BASE_URL`). It validates reciprocal sitemap nodes, actual published service URLs, AR/EN language/canonical consistency despite conflicting language cookies, untranslated custom pages, article authorship, footer service destinations and health. It chooses a published service from the sitemap rather than assuming an archived procedure URL must return 200.

To require proof of a specific release, set `SEO_EXPECTED_REVISION` to the full expected merge SHA. The command fails when the serving revision is absent or differs. Without that expectation it reports `revisionVerified: false`; successful content checks alone are not deployment proof.

## Validation and measurements

Production builds used Node 22.19.0 with dotenv credentials, database URLs, conversion-provider flags and Render markers isolated. The Render-only prebuild seed step reported that it skipped database writes.

The following measurements compare the base build and final build using the same local seed content, configuration and page URLs. The homepage comparison matched the same eight rotating journal entries before measuring. Numbers are decoded HTML/RSC response bytes; they are **not** Lighthouse scores or Core Web Vitals.

| Page | Before bytes | After bytes | Reduction |
| --- | ---: | ---: | ---: |
| Contact | 272,691 | 242,270 | 11.2% |
| Doctors | 267,263 | 235,249 | 12.0% |
| Facelift service (local published fixture) | 247,818 | 215,804 | 12.9% |
| Home | 428,434 | 394,366 | 8.0% |
| Journal article | 217,318 | 185,304 | 14.7% |

Gzip-size reductions in these fixtures were approximately 12–23%. All five comparisons retained their H1 counts, complete link sequences and rendered booking options. Published local fixtures are not evidence that an archived production service has been republished.

- Final production build and standalone asset synchronization passed; TypeScript checking passed.
- 12 new tests passed for server/client data boundaries, footer publication safety, health revision handling and failure cases in the public audit.
- Existing SEO, access safety, tracking, CSP, landing-content and memory suites passed: 189 test executions, plus the 12 new tests = 201 across the suite set. Some existing suites overlap.
- Full lint passed with zero errors and 63 existing warnings (62 in ignored local audit JavaScript and one ImagePicker effect warning). Targeted lint of the final changed files passed.
- Final local public audit passed: 74 sitemap locations and 15 reciprocal language pairs, with seven public HTTP checks. The local revision was correctly reported as unknown.
- Final standalone HTTP security regression checks passed all 30 cases, including private/session responses, RSC, nonce/CSP, cache headers and authorization redirects.

Raw local build, test, baseline/comparison and public HTTP evidence is retained in ignored `.codex-artifacts/seo-followup-2026-10-27/`. Existing untracked user audit documents were left untouched.

## Production observations and access-dependent items

Before this follow-up was deployed, live responses showed the previous sitemap/language/author corrections: 147 sitemap locations with 40 reciprocal language pairs, correct Arabic/English service canonicals, Arabic fallback for untranslated custom HTML, and the confirmed article byline/schema. The XML was also accepted by an XML parser. The old health response did not identify its Git SHA, and GitHub exposed no deployment record/status proving it.

The strengthened audit deliberately fails on the current live footer's unpublished service link. After this follow-up deploys, rerun `test:seo-live` with the expected merge SHA to verify the new footer and exact serving revision. This document does not claim that merging alone deployed the code.

- Search Console still returned `sites: []`. Index coverage, Google-selected canonicals and query overlap cannot be established through that connection. No speculative redirects, page consolidation or changes to stored publication status were made.
- The official mobile PageSpeed API still returned HTTP 429 (quota exceeded). The connected HYPD Lighthouse tool returned `plan_denied` and did not run; [the provider's plan/access details](https://app.hypd.ai/plans?utm_source=mcp&utm_content=tool_access_plan&utm_term=lp_audit_lighthouse) explain that restriction. No score, LCP/INP/CLS value or field-performance improvement is claimed. `IMAGE_UNOPTIMIZED` remains unchanged.
- The correct Render account is not connected through the available tools. Deployment success and the final live SHA still need a successful deploy and the revision check above. No access to the previously rejected Render workspace was attempted.

## Primary references

- [Next.js: Server/Client Components and the RSC payload](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Render: default environment variables, including RENDER_GIT_COMMIT](https://render.com/docs/environment-variables)
- [Google: PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started)
