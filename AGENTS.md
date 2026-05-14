# AGENTS.md

## Cursor Cloud specific instructions

### Quick reference

| Task | Command |
|---|---|
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Prisma generate | `npx prisma generate` |
| Migrations | `npx prisma migrate deploy` |
| Seed admin | `ADMIN_SEED_EMAIL=x ADMIN_SEED_PASSWORD=y npm run seed:admin` |
| Prod build | `NODE_ENV=production npm run build` |
| Standalone test | `HOSTNAME=0.0.0.0 PORT=3001 npm run start:standalone` |

### Database

Local dev uses PostgreSQL on localhost. Create a database and set `DATABASE_URL` + `DIRECT_URL` in `.env` (see `.env.example`). Prisma picks up `prisma/.env` too (contains `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1`).

### Build caveat

`npm run build` reads `.env`. If `NODE_ENV=development` is set there, the build fails on `/_global-error` pre-render. Always use `NODE_ENV=production npm run build` when building locally.

### Render 502 context

The standalone server script (`scripts/run-standalone-server.mjs`) caps V8 heap at 460 MB by default for the Render Starter 512 MB plan. Override via `MAX_OLD_SPACE_SIZE` env var or `NODE_OPTIONS`.
