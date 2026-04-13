# Contractly

Multilingual form builder: draft in the app, publish a shareable link, collect responses in your own PostgreSQL database. Sign-in is powered by [Clerk](https://clerk.com).

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- PostgreSQL + Prisma
- Clerk authentication
- Tailwind CSS 4, shadcn-style UI

## Prerequisites

- Node.js 20+
- pnpm 10+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))

## Setup

1. **Clone and install**

   ```bash
   pnpm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` — Postgres connection string (`postgresql://…`, not `prisma+postgres://` for the app runtime).
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the [Clerk dashboard](https://dashboard.clerk.com/) (or use Clerk keyless dev mode locally).

   Optional Clerk URLs (defaults match this repo):

   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/forms/new`

3. **Database**

   ```bash
   pnpm db:migrate:dev
   ```

4. **Run**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (unit tests) |
| `pnpm i18n:check` | Verify translations are up to date (`--frozen`) |
| `pnpm i18n:init` | Initialize lingo.dev config interactively |
| `pnpm i18n:sync` | Sync translations via lingo.dev |
| `pnpm db:migrate:dev` | Create/apply migrations (dev) |
| `pnpm db:migrate` | Apply migrations (deploy) |
| `pnpm db:studio` | Prisma Studio |

## Features

- **Dashboard** (`/dashboard`) — forms you own
- **Templates** — blank, contact, RSVP, event
- **Builder** — short/long text, email, number, date, multiple choice; EN / AR / FR / ES labels
- **Public forms** (`/f/[slug]`) — no sign-in for respondents; honeypot + in-memory rate limit on submit
- **Manage** — publish, unpublish, duplicate, delete; CSV/JSON export of responses (`/api/forms/[formId]/export`)
- **Locale routing** — prefix URLs with locale like `/en/...` or `/ar/...` and use the global switcher

## Localization workflow (lingo.dev)

1. Add or update source copy in `locales/en.json`.
2. Run `pnpm i18n:sync` to generate/update `ar`, `fr`, and `es` locale files.
3. Run `pnpm i18n:check` to fail if translations are out of sync.
4. Open a locale path in browser (`/en`, `/ar`, `/fr`, `/es`) and verify UI + form flows.

## Production notes

- Submit rate limiting uses an **in-memory** store (fine for a single Node instance). For multiple instances, replace `lib/rate-limit.ts` with Redis (e.g. Upstash).
- If you add **webhook** routes under `/api/...` that must not require a user session, add their paths to the public matcher in `proxy.ts`.

## License

Private / your terms.
