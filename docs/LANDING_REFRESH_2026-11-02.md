# Landing refresh — 2 November 2026

Scope: `/p/facelift-riyadh`, `/p/body-contouring-riyadh`, and `/p/tk` (also its existing `tiktok-customer` alias). Base: `bd54b524e846b040b6d23ce7db005d7e5bb69ae0`.

## Copy and presentation

- Face and body pages introduce Dr. Loai through specific qualifications and surgical training, with clearer, shorter opening copy. The original clinic-supplied portrait is now prominent in the hero as well as the professional profile. The existing Dr. Saham card on the body page remains.
- Credentials name the Canadian plastic surgery board/FRCSC, training at McGill, the two US fellowships, and documented leadership experience at King Fahad Medical City. The conference reference says he is listed as a 2026 speaker; it does not describe a future conference as already attended.
- The previous numerical experience claim was replaced with the documented training background. No invented case counts, rankings, success rates, patient quotes, certificates or guarantees were added.
- `tk` is a clinic/team page: “خبرة تطمئن لها. واهتمام يليق بك.” The channel/video framing is removed from visible copy, FAQ, editorial content and search/social metadata. Existing attribution fields and technical route/layout identifiers remain stable.
- The team comes from **all published doctor records**, in the clinic's existing order, rather than three hard-coded people. The public doctor directory showed 13 people during this work. Drafts are excluded; duplicate slugs are removed. Names, titles, specialties and photos use clinic data. Dynamic strings are escaped before HTML rendering.
- Rendering version markers allow older generated presentations to refresh while preserving their existing lead form and medical gallery assets. No CMS content records were overwritten.

## Primary research

| Source | Facts used |
| --- | --- |
| [King Fahad Medical City physician directory](https://www.kfmc.med.sa/EN/fyd/Pages/Doctors.aspx?doc=1386) | Consultant/head of Plastic & Reconstructive Surgery; FRCSC/McGill; Canadian board; US hand and microsurgery fellowships; University of Pennsylvania/Fox Chase |
| [UT Southwestern hand fellowship alumni](https://www.utsouthwestern.edu/departments/plastic-surgery/education-training/fellowships/hand-surgery.html) | Loai Alsalmi listed among 2011 alumni |
| [IAM Plast official speaker biographies](https://www.iamplast.com/speakers.php) | Listed 2026 speaker; consultant biography and international training |

Sources were read on 2 November 2026. External evidence links are kept in this implementation note rather than adding outbound research links to advertising pages. The portrait is the existing clinic asset `public/media/doctors/loai-alsalmi-portrait.webp`, visually inspected before use; no generated face or image retouching was used.

## Verification

- Production build and standalone asset synchronization passed in an isolated local environment; the Render-only seed step skipped database writes.
- Focused landing suite: 60 passing tests, covering form fields/hidden attribution, sanitization, gallery preservation, exact route scope, full team rendering and HTML injection cases.
- Landing search: 17; content: 20; lead tracking: 48; CSP: 7; SEO: 23; release safety: 13 passing test executions.
- Typecheck and lint were run. Machine-specific logs and UI screenshots are retained under ignored `.codex-artifacts/landing-refresh-2026-11-02/`.
- Browser previews at desktop and a 390-pixel mobile viewport showed the portrait correctly, 13 team cards, no horizontal overflow and no broken images in the visible team rows. The preview blocks all form submissions and tracking execution.
- Publication must be confirmed against `/api/health`'s exact revision and the three live page release markers, title/canonical, roster and form fields after the merge deploys. Local build/preview success alone is not publication proof.

No dependencies, database writes, migrations, credentials, booking field names, conversion handlers or canonical route mappings were changed. Existing untracked user audit files were left untouched.
