# Dr. Saham Al-Arfaj custom landing page

Requested public route: `https://rejuvera.sa/p/dr-saham-arfaj`.
CMS title: `د. سهام العرفج — استشارة جراحة التجميل في الرياض`.

## Content and publication

- The page is a normal `CustomPage` record, editable under `/admin/pages`.
- `npm run build` invokes a targeted prebuild seed on Render only. Local builds do not write to a database. The explicit command is `npm run seed:doctor-landing`.
- The seed creates this single page if missing. Existing pages, including draft pages and slug aliases, are preserved; the upsert has an empty update.
- The physician must be published. Name, title and photo come from her current database record. Only selected published services linked to that physician appear in cards and form choices.
- Initial layout follows the existing physician landing pages: purple/gold palette, RTL hero, consultation form, physician portrait, service cards, booking steps and accessible question disclosures. CSS is scoped to this page.
- Selection questions use “أفضل دكتورة” and “أحسن دكتورة” naturally. No superiority, ranking, review score, price, credential, treatment result or recovery duration is invented.
- Public references checked on 2026-10-06: [physician profile](https://rejuvera.sa/doctors/saham-arfaj), [existing physician landing page](https://rejuvera.sa/p/dr-maher-alahdab), [ASPS tummy tuck consultation questions](https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck/questions), [ASPS neck lift consultation questions](https://www.plasticsurgery.org/cosmetic-procedures/neck-lift/questions).

## Validation before publication

- Production build and TypeScript check passed.
- ESLint: zero errors; one pre-existing ref-cleanup warning in `ImagePicker.tsx`.
- Five seed/content tests passed, including preservation of existing CMS pages, unpublished physician rejection, published service filtering, form contract and escaping.
- Existing SEO tests (12) and lead tracking tests (11) passed.
- Local preview used the production custom-page sanitizer, media handling, contact normalization and form hardener. Desktop and 390px mobile layouts inspected; no horizontal overflow. Physician and logo images loaded. Booking anchor, service choice and invalid phone validation checked without creating a production lead.

## After publication

Production URL, metadata, page directory, XML sitemap and rendered form will be checked before reporting a live link. Allowing indexing does not prove that Google has indexed the page.
