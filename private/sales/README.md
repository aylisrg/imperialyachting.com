# Sale materials bundled with the site

Files here are **not public**. They are streamed only through
`GET /api/sales/file?t=<signed token>`, and the token is issued by
`POST /api/sales/download` after the visitor enters an email (DocSend-style
gate). A row in `public.sale_materials` with `source = 'bundled'` and
`location = '<path relative to this folder>'` puts a file on a listing.

New materials should normally be uploaded through the sales-admin MCP
(`sales_add_material`), which stores them in the private Supabase bucket
`sale-materials` — no deploy needed. See `docs/YACHT_SALES_RU.md`.
