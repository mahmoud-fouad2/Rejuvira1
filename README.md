# Rejuvira Center — Web Platform

Production website for Rejuvira Center (`rejuveracenter.sa`) — a
medical dermatology and aesthetic clinic in Riyadh. Built on
**Next.js 16 (App Router)**, **React 19**, **Tailwind v4**, **Prisma
+ Neon Postgres**, and **NextAuth v5**. The Arabic experience is
primary (RTL) with a polished English toggle.

## Quick start

```bash
cp .env.example .env
# Fill DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, R2_*, RECAPTCHA_*.

npm ci
npx prisma generate
npm run dev
```

Open <http://localhost:3000>. The admin panel lives at `/admin`
(`npm run seed:admin` to create the first admin once the database
URL is set).

## Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Run the Next.js dev server on port 3000. |
| `npm run build` | Production build (`next build`). |
| `npm run start` | Start the production server. |
| `npm run lint` | ESLint over the whole repo. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run prisma:generate` | Regenerate the Prisma client. |
| `npm run prisma:migrate:deploy` | Apply pending migrations. |
| `npm run seed:admin` | Create the first admin user. |

## Production deployment

Render.com is the canonical hosting target. See
[`deploy/RENDER.md`](./deploy/RENDER.md) for the build/start
commands, environment variables, health check, custom domain steps,
and cron-job examples (nightly backup, etc.). The repo's
`render.yaml` is a deployable blueprint that mirrors that document.

## Stack

- Next.js 16 App Router, React 19, Tailwind v4.
- Prisma 6 + Neon Postgres (pooled + direct URLs).
- NextAuth v5 (Credentials provider, role-based gating).
- Cloudflare R2 for media uploads (S3-compatible).
- Google reCAPTCHA v3 on the public contact form.
- SSR-first SEO: page metadata, JSON-LD, sitemap/robots/manifest.

## Repo layout

```
src/
  app/           # Next.js App Router pages and route handlers
    admin/       # Authenticated admin panel
    api/         # Route handlers (health, admin/*, auth/*)
  components/    # UI components (server + client)
  lib/           # Domain logic, content repository, helpers
prisma/          # Prisma schema + migrations
public/          # Static assets (fonts, brand, curated media)
deploy/          # Operational documentation
```
