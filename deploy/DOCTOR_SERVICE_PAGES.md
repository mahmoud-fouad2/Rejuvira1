# Targeted doctor landing pages — 8 October 2026

The owner corrected the hosting information: Rejuvera **still runs on Render**. Do not deploy the unrelated Faheemly application on `cp.faheemly.com`. Identify the Render service by the Rejuvira1 repository and production domain before using deployment controls.

## Changes

- Fix Saudi WhatsApp formatting on existing doctor profiles; retain the configured number and message.
- Create-only CMS pages: `/p/dr-natali-domloj` (Hydrafacial, fractional laser, pigmentation and skin freshness) and `/p/dr-abdullah-alfakhri` (penile implants and varicocele only).
- Natali requires the published physician record. Abdullah's name and two services were confirmed by the owner; no photo, qualifications or experience were invented.
- Existing pages/SEO aliases, including drafts, are preserved. Upsert updates are empty to preserve administrator changes. The new pages remain editable in the CMS.
- The forms reuse `/api/leads` and the current custom-page validation, attribution, receipt and conversion code. No tracking scripts were added and no live test leads were sent.

## Deploy on the confirmed website application only

1. Deploy the reviewed `main` commit using the existing website build/start settings.
2. The existing Render prebuild calls the create-only landing page release. If the pages are already created in the CMS, they are preserved. For a manual targeted retry, run `npm run seed:doctor-services` in the confirmed production environment; that command does **not** run `seed:core`, migrations, or enrichment on other pages.
3. Confirm both slugs render with HTTP 200, correct canonical/metadata, working image and contact links, and guarded forms.
4. Verify the existing doctor WhatsApp links use `wa.me/966114999959`, and telephone CTAs still use `tel:0553999514`.
5. Only then point Google Ads at the new pages. Keep the successful saved-form conversion primary; no budget increase or tracking change is required.

Local `npm run build` does not create database records. Do not mark the pages published merely because the local build succeeded. On Render, the existing prebuild hook creates them only if absent.

## Validation

`npm run test:landing-content`, `npm run test:lead-tracking`, `npm run typecheck`, targeted ESLint, and `NODE_ENV=production npm run build`. Visual preview uses a temporary GET-only local server and cannot submit leads.
