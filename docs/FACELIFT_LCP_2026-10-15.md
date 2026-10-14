# Facelift LCP follow-up — 15 October 2026

Scope: `/p/facelift-riyadh` presentation/resource hints only. No campaign,
conversion, form submission, integration, patient-data or API changes.

## Direct evidence

Google PageSpeed mobile report captured 15 October, 02:38 Asia/Riyadh identified
`div.fl-page > nav.fl-top > a.fl-brand > img` (the supplied clinic logo) as the LCP
image. It was eager-loaded but had no fetch priority. A previous optimization
prioritized the small doctor portrait, which was not this report's LCP element.

The report also flagged the global CSS chunk: 72.8KiB transferred, 3,620ms in its
render-blocking table. That requires separate stylesheet-scope work; changing
tracking load order or removing measurement is not part of this patch.

Single mobile run before this patch: performance49, LCP13.0s, FCP5.8s, TBT410ms,
CLS0.056, accessibility100, SEO100, best-practices77. Scores vary between runs;
the report's real-user 28-day LCP7.2s/INP481ms includes older site versions and
is not an immediate before/after measurement of this patch.

## Minimal change

- Add eager/high fetch priority to the existing logo, with original URL,
  dimensions and design preserved.
- Preload exactly that same image from React's server-render resource hint,
  only when the known facelift transformation is active. No duplicated image
  download URL, new dependency, new tracker or deferred integration.
- Keep the doctor eager, gallery lazy, and original form bytes/attribution intact.

Regression tests cover logo hints through sanitization and unchanged form bytes.
The existing lead-tracking tests cover success-only/deduplicated conversions and
the unchanged central call/WhatsApp destinations. No fake lead was submitted.

References: [React preload](https://react.dev/reference/react-dom/preload),
[Google fetch priority](https://web.dev/articles/fetch-priority).

## Verification status

Facelift/integration13 tests and lead tracking19 tests passed; TypeScript, scoped
ESLint and the production build passed. A React server-render probe confirmed
the hint produces a preload link. Deployment still requires Render Live plus
public HTML readback; its final status and any repeat PageSpeed result are
reported in the task. Do not claim a measured speed gain or a fully resolved
Core Web Vitals assessment from the hint alone.
