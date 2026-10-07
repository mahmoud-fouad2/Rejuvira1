# CSP integration repairs — 7 October 2026

## Confirmed findings

- The live awareness-card close button contains an inline `onclick`. Its exact
  SHA-256 is `eJWK6Ny+D47qCqiCaL1RQlxkEE6sACQYPtD4jlwIs4k=`, matching the reported
  warning. A real browser click reproduces the CSP error and leaves the card
  visible.
- The two reported tracking URLs use `analytics.tiktok.com` and `tr.snapchat.com`.
  Both origins were in `script-src`/`connect-src` but absent from `default-src`.
  Chromium network capture confirms the scripts return HTTP 200 and their
  tracking requests succeed. The Firefox messages explicitly concern the
  `default-src` fallback; this is not evidence that every pixel request failed.
- `https://www.google.com/maps/vt` responds with HTTP 200 and an invalid JSON
  `Report-To` header, including a trailing comma after the `endpoints` array.
  The owned homepage/contact responses do not emit `Report-To`,
  `Reporting-Endpoints`, or `NEL`. This third-party header cannot be corrected
  by editing the site's response headers.
- Firefox's “Partitioned cookie or storage access was provided” messages
  describe the browser's third-party storage partitioning. They do not say
  access was denied. The experiment/search messages in the supplied console
  output are informational, not reported failures.

## Changes

- Convert only the verified campaign dismiss action to a data attribute;
  a regular delegated `addEventListener` handles its button, including cards
  inserted after page load. No arbitrary handler text is compiled or evaluated.
- Apply the current request nonce to admin-configured integration scripts and
  the existing optional Chatbase loader, overriding stale pasted nonces.
- Explicitly retain the inline event-handler prohibition with
  `script-src-attr 'none'`. Keep nonce + `strict-dynamic`; do not add
  `unsafe-hashes`, production `unsafe-eval`, or a blanket HTTPS source.
- Add only the two exact tracking origins to `default-src`. Existing explicit
  script, connection, frame, worker, font, style, form and object restrictions
  retain their source lists.
- No CMS writes, content edits, tracker ID changes, form submissions, database
  migrations, or changes to browser privacy preferences are part of this repair.

## Verification before release

- Production build and TypeScript check passed.
- ESLint passed with zero errors and the existing `ImagePicker.tsx:249` warning.
  Local audit captures were excluded from lint because they contain vendor code.
- 43 automated checks passed: 6 CSP/integration, 12 SEO, 11 lead tracking,
  and 14 landing-content checks.
- A local browser fixture uses the complete captured live campaign code,
  the production helper module, and the production CSP. The button removes
  the card with zero security errors. A separate unapproved inline handler
  remains blocked and does not execute.
- Browser checks use Chromium. A Firefox run was not available; disappearance
  of every Firefox console message is not asserted. Google-owned reporting
  headers and normal browser storage messages may remain.

## References

- [MDN: script-src-attr and event listeners](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src-attr)
- [MDN: state partitioning console messages](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/State_Partitioning#logging)
- [Mozilla: invalid Report-To header diagnostics](https://bugzilla.mozilla.org/show_bug.cgi?id=2020662)

To rerun focused checks: `npm run test:csp`. A rollback can revert this release
commit; the stored CMS snippets were left unchanged.
