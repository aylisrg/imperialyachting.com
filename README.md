# Imperial Yachting

Marketing site and booking platform for Imperial Yachting, a Dubai yacht
charter and management company, at [imperialyachting.com](https://imperialyachting.com).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres + RLS) for fleet, destinations,
  and booking data
- [Zod 4](https://zod.dev) for schema validation
- [Vitest](https://vitest.dev) + Testing Library for tests
- [Stripe](https://stripe.com) for deposit/balance payments
- A live [MCP](https://modelcontextprotocol.io) server (`src/app/api/mcp`)
  exposing the fleet and booking flow to AI assistants (ChatGPT, Claude,
  Perplexity) — see `docs/MCP.md` and the human-readable `/ai` page.

## Getting started

```bash
npm run dev          # start the dev server at http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill in the values you need for the
areas you're working on (Supabase keys, Stripe, Google Calendar/Analytics,
Resend, IndexNow, etc.) — see the comments in that file for what each
variable is for.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve a production build |
| `npm run lint` | ESLint |
| `npm test` | Run the vitest suite once |
| `npm run test:watch` | Run vitest in watch mode |
| `npm run test:coverage` | Run vitest with coverage |
| `npx tsc --noEmit` | Type-check without emitting |
| `npx tsx scripts/mcp-smoke.ts` | Manual smoke test against the MCP server |

## Docs

- [`docs/AI_COMMERCE_PLAN.md`](docs/AI_COMMERCE_PLAN.md) — the plan behind
  the MCP server, agentic booking via Stripe, and AI-visibility/SEO work.
- [`docs/MCP.md`](docs/MCP.md) — MCP server architecture, tool reference,
  local testing, client setup, and registry publishing.
- [`docs/INDEXNOW.md`](docs/INDEXNOW.md) — IndexNow integration for faster
  Bing/ChatGPT-search indexing.
