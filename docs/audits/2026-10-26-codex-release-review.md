# Independent Phase 1 review — 26 October 2026

## Release decision and scope

**BLOCKED BEFORE MERGE.** Corrective code is prepared for the existing feature
branch and PR #2. No production deployment or database change was performed.
The user explicitly deferred Render and production investigation during this
review. The original release gates for a secure recoverable backup, the actual
production build configuration, pending production migrations, and Cloudflare
rules remain unverified. Merging a branch with automatic deployment potentially
enabled would cross those gates, so main is unchanged.

PR: <https://github.com/mahmoud-fouad2/Rejuvira1/pull/2>

Original Gemini HEAD: `aea2803eae1b630c4de8fddea1212ede20de8e10`.
Verified main: `fd7f0c80aebdb6965aab7b31dc05d68c82eed8d2`.
The original PR was open, draft, mergeable, five commits, eleven changed files.
GitHub returned zero check runs and zero commit statuses; the combined status
was pending, which is not a test pass. Remote refs were fetched again before
delivery. Existing untracked user audit documents were preserved.

## A. Independent audit

Reviewed the cumulative diff and individual changes in `3eda5c4`, `595acab`,
`1da1868`, `5ee5b94`, and `aea2803`, plus callers, public component boundaries,
authentication, portal queries, lead routes, webhook dispatch, cache reads,
build hooks, migrations, and all production seeds.

| Severity | Evidence / defect | Corrective decision |
| --- | --- | --- |
| HIGH | `SiteHeader` and `V0InspiredHome` fell back to all records when the published list was empty. Public booking components also received complete draft service records as client props. Detail-page authorization did not protect these other paths. | Remove the fallbacks and filter public service/doctor props before client serialization in the home, contact, footer, header, and detail pages. |
| HIGH | Real standalone HTTP returned two Auth.js cookies with `Cache-Control: public` on anonymous pages. The auth wrapper appended its cookies after the mocked middleware response. | Run the auth wrapper for staff-session cookies; anonymous requests use the same routing/security handler without bootstrapping auth cookies. Preserve normal session refresh and independent patient-cookie protection. Real HTTP now returns zero cookies for anonymous public pages. |
| HIGH | Invalid staff cookies and the independent patient session cookie were not recognized by `session.user.id`. Redirect branches also returned before private response headers were applied. | Session-cookie-bearing requests and every API route bypass shared caching. Staff authorization redirects explicitly carry private/no-store/noindex. Final HTTP verifies signed EDITOR/VIEWER sessions, redirects, invalid cookies, and RSC responses. |
| HIGH | `/api/contact` and `/api/leads` discarded unresolved service references before calling `createContactLead`, defeating the new unknown-service discriminator. | Preserve the submitted reference when no service record resolves. Actual POST-handler tests verify the argument and the unchanged saved/duplicate response contracts. |
| HIGH | Lead lookup, read/merge/update and creation ran separately. Concurrent requests could create duplicates or overwrite another follow-up. | Use one serializable Prisma transaction and retry only P2034 serialization conflicts, at most four attempts. No schema change or partial unique index. Retry behavior is mocked integration tested; live PostgreSQL contention remains a release qualification item. |
| HIGH | Duplicate refresh filled empty first-touch fields from a later campaign, creating a mixed attribution cohort. | Leave every stored attribution field unchanged on refresh, including null fields; retain returning attribution in the audit note. |
| MEDIUM | Returning-touch identity truncated click IDs to 120 characters, conflated click types, and omitted several fields. Substring message comparison could discard a shorter legitimate follow-up. | Preserve complete typed click identities and escaped JSON touch context; use a hash for retry identity. Compare message segments and note boundaries rather than arbitrary substrings. Long messages and historical notes remain intact. |
| HIGH | Core seed overwrote biographies, qualifications, publication status, SEO, category relationships, featured/order values and settings when the version marker was missing/different. | Keep missing-record creation and dependencies; existing categories, doctors, services, brand/contact settings use empty updates. Keep the system version marker update. Current-version skip behavior is retained. |
| MEDIUM | Landing seed's lookup followed by a nonempty upsert update could overwrite a concurrently created page. `LANDING_SEED_FORCE=1` could also overwrite content during deployment. | Default upsert updates are empty; retain the explicit local force workflow but reject it when Render build markers are set. |
| MEDIUM | The Phase 1 suite could not import production repository aliases with the documented plain Node command. Its status visibility test reimplemented the condition instead of calling a page. | Add a test-only resolver and npm commands; replace the tautology with execution of the actual page metadata/render guards for all five statuses and anonymous plus all ten employee roles. |

Accepted without additional functional changes:

- Removing the minimum 2500 ms submission delay prevents legitimate autofill
  rejection. Honeypot and timestamp checks remain; six intake tests pass.
- The service/doctor preview role policy is appropriate: SUPER_ADMIN, ADMIN and
  EDITOR only. Require a nonempty session user ID as well. Published content is
  available to anonymous users; four unpublished states deny all other roles.
- Portal dynamic rendering and noindex metadata are appropriate. PDF ownership
  and published-instruction checks, message queries, and checklist ownership
  predicates were inspected. PDF denial and session lifecycle behavior have
  boundary-mocked integration coverage; no real patient was used.
- Keep registered service IDs and explicit general/unknown tags as identifiers.
  Existing registered leads and explicitly tagged historical general inquiries
  still match. Untagged historical NULL-service records cannot safely identify
  a particular service: do not silently reclassify or merge them. A fresh
  submission is preserved as new rather than suppressed on an uncertain match.
- A failed webhook is caught/logged after persistence; it does not invalidate a
  saved lead. Duplicate submissions intentionally do not dispatch the webhook or
  paid-ad conversions. This remains best-effort delivery, without a durable
  webhook retry queue; that pre-existing limitation is not changed here.
- Preserve existing redirects, canonical/hreflang construction, tracking event
  IDs/payloads, reCAPTCHA policy, dependency versions and medical seed create data.
- `.gitignore` exclusion of local Codex artifacts is appropriate.

## B. Verification

Node `22.19.0`, matching package.json. All test DB environment values pointed to
an unreachable local fixture address. No production DB credentials were used.

| Command | Result | Tests | Classification |
| --- | --- | ---: | --- |
| `npm run typecheck` | PASS | n/a | Static check |
| `npm run lint` | PASS, 0 errors / 63 warnings | n/a | Static check |
| `npm run test:phase1` | PASS | 11 | Unit + mocked integration |
| `npm run test:release-safety` | PASS | 13 | Mocked integration |
| `npm run test:lead-tracking` | PASS | 48 | Unit + mocked browser boundaries |
| `npm run test:snap-capi` | PASS | 32 | Unit + mocked integration |
| `npm run test:meta-capi` | PASS | 4 | Unit + mocked integration |
| `npm run test:openai-ads` | PASS | 3 | Unit + mocked integration |
| `npm run test:seo` | PASS | 12 | Unit / contracts |
| `npm run test:csp` | PASS | 7 | Unit |
| `npm run test:facelift` | PASS | 14 | Unit / contracts |
| `npm run test:landing-content` | PASS | 18 | Unit + mocked integration |
| `npm run test:landing-search` | PASS | 8 | Unit / contracts |
| `npm run test:memory` | PASS | 8 | Unit / contracts |
| `NODE_ENV=production npm run build` (isolated environment) | PASS | n/a | Real production compilation and standalone asset sync |
| Standalone HTTP verification | PASS | 30 cases | Real local HTTP integration; synthetic signed JWT sessions |

178 test executions in the listed suites; some test files run in multiple suites.
The 63 lint warnings comprise existing local artifact warnings and the existing
ImagePicker ref-cleanup warning. No new lint error was suppressed.

The Snap suite initially exposed a test-harness mismatch: native
`Response.redirect()` has immutable headers, unlike `NextResponse.redirect()`.
The mock now models mutable NextResponse headers and explicitly asserts private
redirect caching. The affected 32-test suite and 11-test Phase 1 suite were
rerun successfully. Real local redirect tests independently pass.

Build isolation explicitly emptied keys from all local dotenv files, removed
Render markers, disabled conversion integrations, and supplied a synthetic local
auth secret. Prebuild reported `Not a Render build; no database writes`.
No install, migration or real seed command was run. Seed tests execute production
scripts with a fake Prisma boundary, not a real database.

### Database, seed and cache qualification

- No Prisma schema or migration file differs from main. The production applied
  migration set and recovery status have **NOT TESTED** qualification.
- Core seed runs only if its version marker differs or is absent. Its corrected
  existing-record writes are empty; missing records and relationships are still
  created. Tests cover both an older marker and a missing marker.
- Landing seed preserves existing pages and concurrent creation by default;
  explicit overwrite mode is rejected during Render deployment.
- Procedure-template seed was already create-only by name/category, skips
  existing templates, and creates only DRAFT templates requiring approval.
- Also inspected the prebuild doctor landing release: doctor landing creation
  preserves existing slugs/aliases; enrichment appends once with compare/update
  and a persistent marker; integration cleanup is scoped and retains recovery
  metadata. These unchanged hooks can still write on a real deployment, so live
  configuration/state/backup verification is still required before merge.
- `postinstall` can attempt migration recovery, and the declared Render build
  migrates/seeds. Neither was executed against production in this audit.
- Final local HTML retains Next's RSC Vary fields. Next's final renderer may omit
  the middleware-added `Cookie` Vary field on HTML; protection comes from
  `private, no-store`, verified on the final response, not from Vary alone.
- CSP nonce and emitted script nonce values match in final HTML. Public anonymous
  pages remain indexable. Actual Cloudflare rules and edge behavior are **NOT
  TESTED**; origin headers alone do not establish CDN configuration safety.
- Secure production snapshot, retention, access control and practical recovery:
  **NOT TESTED**. No claim of backup availability is made.

## C. Git delivery

Corrective work targets `fix/rejuvera-safe-remediation` in the existing PR #2;
no replacement PR. Corrective SHA is recorded in Git history and the PR body.
Main remains `fd7f0c80aebdb6965aab7b31dc05d68c82eed8d2`; merge SHA: **none**.
PR remains open/draft because mandatory production release gates are deferred.
No force push, destructive reset, database reset, or unrelated user-file staging.

## D. Render deployment

**Deferred by explicit user instruction.** The initial connected workspace was
confirmed by the user and inspected read-only, but it contained no matching
Rejuvera service; the user clarified that production uses another Render account.
No Render settings, services or deploys were modified. Production service ID,
deployment ID, deployed SHA, build/runtime status and migration/seed outcome:
**NOT VERIFIED**. The tool connection subsequently became unavailable.

## E. HTTP smoke verification and remaining limits

All paths below were tested on `127.0.0.1:3001`, using the standalone production
build with DB access disabled. These are not production smoke tests.

| Local URLs | HTTP | Evidence |
| --- | --- | --- |
| `/`, `/doctors`, `/contact`, `/journal`, `/services` | 200 | Public/indexable; no Auth.js bootstrap cookies; canonical values retained; CSP nonce matches scripts |
| `/doctors/loai-alsalmi`, same path with `?lang=en` | 200 | Seed fallback renders; fallback's existing canonical behavior retained |
| `/services/face-neck-lift` | 404 | DB-free seed fallback lacks this production service record; actual production availability not established |
| `/patient-login`, `/patient-login/recover`, `/patient-login/activate` | 200 | Private/no-store/noindex |
| `/portal`, `/portal/documents`, `/portal/messages` | 307 | Redirect to patient login; private/no-store/noindex |
| `/api/portal/procedures/fixture/pdf` | 401 | Anonymous access denied; private/no-store/noindex |
| `/api/auth/session`, `/api/health` | 200 | Private/no-store/noindex; health is lightweight and does not prove DB connectivity |
| `/robots.txt`, `/sitemap.xml` | 200 | Public response; no auth cookies |
| `/contact` with RSC, signed EDITOR/VIEWER, invalid staff cookie, patient cookie | 200 | RSC content type/Vary retained; session-bearing responses private/no-store |
| `/login` with signed EDITOR/VIEWER | 307 | Correct role landing destination; private response, session rotation preserved |
| `/admin/services` anonymous or signed VIEWER | 307 | Login / forbidden respectively; private response |

Remaining pre-existing limitation, MEDIUM: the portal document list links to
`/api/portal/documents/[id]`, but this checkout has no matching route. Direct
document download therefore remains unavailable. No public storage URL fallback
was introduced; adding safe private storage retrieval needs separate work.

No E2E browser/mobile-layout pass, live CRM connectivity pass, live database
concurrency pass, real patient login pass, Cloudflare validation, production
content-before/after comparison, or paid-ad delivery claim is made. No real leads,
patient messages or advertising events were sent during validation.

## F. Final verdict

**BLOCKED BEFORE MERGE** — local code qualification complete and corrections
delivered on the PR branch; production release qualification deferred. Main and
production were not modified by this task.
