# Facelift landing-page improvement — 2026-10-11

Scope: `/p/facelift-riyadh` only. No ad-account edits or budget changes.

## Before / after

| Before                                                                | After                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Repeated doctor, credentials and guide sections                       | Six focused sections: booking, options, existing cases, cost, steps, FAQ       |
| WhatsApp float and a separate contact-page detour                     | Call / WhatsApp beside the hero form and a fixed booking / call / WhatsApp bar |
| Faheemly chat and breast-awareness promotion overlap the booking page | These two known widget snippets are suppressed on this route only              |
| No dedicated visible cost section                                     | Explain cost factors and encourage a written quote; no invented price          |
| Optional procedure timeframe added in the initial layout              | Removed on request: original name / phone / service form only                  |
| Small logo and limited bottom search content                          | Supplied logo, natural Arabic search guide and service/doctor links            |

## Ownership / rollback

- `src/lib/facelift-landing.ts` owns the streamlined presentation. The original CMS form is reused, including its action, hidden attribution/source fields, service options, honeypot, required validation and submit button.
- No question or analytics field is inserted. The original form is preserved byte-for-byte by the presentation helper.
- Logo file supplied by the user is served unchanged. CSS frames out excess white margin without distortion; mobile inputs use 16px text to avoid focus zoom, narrow layouts use one column, and contact buttons retain touch-size targets.
- Unknown CMS markup or multiple forms falls back to the original page instead of guessing.
- Existing gallery assets are reused; no new patient images, case claims, price or credential claims are invented.
- CMS content/database records are not overwritten. Future narrative/layout edits to this specific enhanced page belong in the presentation helper. CMS form edits are still preserved.
- No change to `/api/contact`, `/api/leads`, receipt validation, success redirect or tracking modules. Native `tel:`/WhatsApp anchors use the existing delegated click tracking once; no inline tracker or new pixel/base tag.
- WhatsApp uses the configured WhatsApp number; calls use the separately configured number ending 514. Google referral prefill is retained.
- Widget suppression is route-specific and explicitly preserves measurement snippets, including combined snippets containing tracking calls.

## Verification

- 52 tests passed: facelift/widget 12, lead tracking 17, Snap/contact/leads harness 16, Meta 4, OpenAI 3.
- TypeScript, focused ESLint, production build, and `git diff --check` passed.
- Visual-only preview reuses the live public article's preserved form and gallery with the new renderer and existing sanitizer. If already enhanced, only the previously added timing control is removed in the preview input. No tracking scripts or successful form POSTs. Run `node --experimental-strip-types scripts/preview-facelift.mjs` (loopback port 3012).
- Desktop: form and call/WhatsApp CTAs visible in the hero; no horizontal overflow.
- 390×844 and 360×800: submit button above the sticky bar in the first viewport; no horizontal overflow.
- 320px and 768px also have no horizontal overflow; the smallest width stacks the name and phone fields and uses normal vertical scrolling.
- All four reused before/after images loaded; FAQ expands natively without added JS.
- No synthetic production lead was submitted during visual QA. A user-selected live test remains the way to prove the full sheet/attributed-conversion journey after release; prior tracking tests are not a substitute for that.

Copy references: existing official doctor profile (`https://rejuvera.sa/doctors/loai-alsalmi`) and the American Society of Plastic Surgeons consultation questions (`https://www.plasticsurgery.org/cosmetic-procedures/facelift/questions`). No promised result or fixed recovery duration.
