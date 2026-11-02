# Sale materials bundled with the site

Files here are **not public**. They are streamed only through
`GET /api/sales/file?t=<signed token>`, and the token is issued by
`POST /api/sales/download` after the visitor enters an email (DocSend-style
gate). A row in `public.sale_materials` with `source = 'bundled'` and
`location = '<path relative to this folder>'` puts a file on a listing.

New materials should normally be uploaded through the sales-admin MCP
(`sales_add_material`), which stores them in the private Supabase bucket
`sale-materials` — no deploy needed. See `docs/YACHT_SALES_RU.md`.

## Moneta year correction and V3

Verified public years: **built 2018 / model year 2019**. The actual launch date
is unconfirmed; no launch year is asserted. Private ownership/registration
source documents and identifiers must not be included in public materials.

`src/lib/moneta-years.ts` normalizes these years for the fleet, metadata and
machine-readable feeds. `src/lib/sales/moneta.ts` supplies the sale facts and
supersedes identifiable MONETA brochure rows at read time.

New brochure requests use the existing `source: 'url'` path after the unchanged
email gate (including lead logging and the emailed copy). The canonical Drive
file was already link-readable; this change does not alter sharing. Its direct
`uc?export=download` URL was verified on 2026-11-02 to return the exact 34-page
V3 PDF, not an HTML viewer/login/confirmation page: 17,986,582 bytes, SHA-256
`769bc9f6fbcd0897201610b0dc9c171f8b81479f998446715ed1f73ea0e76d1f`.
The public material summary does not expose the URL before the gate.

The historical `monte-carlo-6-moneta/specification-and-videos.pdf` remains
unchanged for rollback; it is not offered for new brochure requests. Already
issued signed links are not revoked by this override. Other documents, photo
packs, surveys and generic manufacturer brochures are not changed. No database
rows/files were deleted. Inspect the live pack after release for unidentifiable
old PDFs stored under different categories/titles.

This is not proof of production publication. The active deployment integration
and branch remain unverified; do not roll out unrelated main-branch redesign
changes as part of this correction. Verify the live page and a gated download
separately before reporting publication.
