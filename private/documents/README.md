# Private company documents

PDF files placed in this folder are served **only** through the password-gated
portal at `/documents`, via the auth-checked route
`GET /api/documents/file/[slug]`. They are deliberately **not** in `/public`, so
they cannot be opened by direct URL without unlocking the portal first.

## Expected file names

Drop the real PDFs here using exactly these names (the document automatically
"lights up" as a download once its file is present):

| Document                     | File name                            |
| ---------------------------- | ------------------------------------ |
| Company Card                 | `company-card.pdf`                   |
| Trade License                | `trade-license.pdf`                  |
| EJARI Tenancy Contract       | `ejari.pdf`                          |
| Certificate of Incorporation | `certificate-of-incorporation.pdf`   |
| Establishment Card           | `establishment-card.pdf`             |
| Memorandum of Association    | `memorandum-of-association.pdf`      |

To change titles, descriptions, or add/remove documents, edit
`src/lib/documents.ts`. See `DOCUMENTS_RU.md` in the project root for the full
guide (in Russian).
