# Sale materials bundled with the site

Files here are **not public**. They are streamed only through
`GET /api/sales/file?t=<signed token>`, and the token is issued by
`POST /api/sales/download` after the visitor enters an email (DocSend-style
gate). A row in `public.sale_materials` with `source = 'bundled'` and
`location = '<path relative to this folder>'` puts a file on a listing.

New materials should normally be uploaded through the sales-admin MCP
(`sales_add_material`), which stores them in the private Supabase bucket
`sale-materials` — no deploy needed. See `docs/YACHT_SALES_RU.md`.

## Moneta GitHub/VPS release

`monte-carlo-6-moneta/specification-and-videos.pdf` is the corrected 34-page V3
brochure (17,986,582 bytes; SHA-256
`769bc9f6fbcd0897201610b0dc9c171f8b81479f998446715ed1f73ea0e76d1f`).
Verified public years: **built 2018 / model year 2019**. The actual launch date
is unconfirmed; no launch year is asserted. Private ownership/registration
source documents and identifiers must not be included in public materials.

`src/lib/moneta-years.ts` normalizes these years for the fleet, its metadata
and machine-readable feeds. `src/lib/sales/moneta.ts` supplies this release's brochure and confirmed sale
facts for that exact listing slug, so publishing the GitHub release does not
require a separate database migration or admin upload. The PDF uses the same
email gate, lead log, emailed links and signed file endpoint as other bundles.

Explicitly MONETA-named brochure rows are superseded at read time, preserving
their first id and retaining database records/files for rollback. Other PDFs,
survey/specification records and generic brochures are not hidden. The actual
production old brochure id has not been verified; after release, inspect the
live material pack for an old PDF stored under a different category/title.
Do not claim that a particular database row was deleted or replaced.

The existing Next.js file tracing and Dockerfile already include private/sales.
Do not move this PDF into public/ or change Drive sharing. The main branch's
GitHub CI is not a VPS deployment trigger; verify the active VPS release and
live page separately before reporting publication.
