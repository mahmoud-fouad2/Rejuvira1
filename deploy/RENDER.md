# Deploying Rejuvera Center to Render.com

This document is the source of truth for **production deployment** of
the Rejuvera Center web app on [Render.com](https://render.com).

The full set of build/runtime variables is declared in
[`.env.example`](../.env.example). Add every variable listed there to
**Render â†’ Service â†’ Environment** before the first deploy.

---

## 1) Node runtime

| Setting         | Value                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime         | `Node`                                                                                                                                                                                                                                           |
| Region          | `Frankfurt` (Europe) or `Oregon` â€” match the Neon region                                                                                                                                                                                       |
| Plan            | `Starter` allocates **512MB RAM**. Next.js production often exceeds that under modest traffic â€” expect **OOM / instance restarts** on Starter. Prefer **`standard`** (**2GB**) for reliable production (**Render â†’ Billing / change plan**). |
| Node version    | `>= 22` (Render auto-detects `engines.node` from `package.json`)                                                                                                                                                                                 |
| Persistent disk | **Not required.** All uploads go to Cloudflare R2.                                                                                                                                                                                               |

The repository's [`render.yaml`](../render.yaml) declares the service
and the full env-var skeleton (values are not committed; set them in
the Render dashboard).

## 2) Build & start commands

Use these **exact** strings in Render â†’ Settings â†’ Build & Deploy:

```bash
# Build command (--include=dev: Render sets NODE_ENV=production; without this,
# devDependencies like Prisma CLI / Tailwind tooling may be skipped and the build fails.)
npm ci --include=dev --no-audit --no-fund && npx prisma generate && npm run prisma:migrate:deploy:retry && npm run seed:core && npm run seed:landing && npm run build
```

```bash
# Start command â€” standalone Node server (smaller than `npm run start`) with a
# capped V8 heap (~460MB) so the web process stays under Render Starterâ€™s ~512MB limit.
npm run start:standalone
```

Local smoke (after `npm run build`): `npm run start:standalone` (runs `server.js` with correct cwd).

Notes:

- `npm run build` ends with copying `public/` and `.next/static/` into
  `.next/standalone/` so the standalone `server.js` can serve assets (see
  `scripts/sync-standalone-assets.mjs`).
- `prisma migrate deploy` runs during the build (via
  `npm run prisma:migrate:deploy:retry`) so schema stays in sync before
  rollout. The wrapper retries on transient **P1002** advisory-lock timeouts
  (common with Neon cold starts or overlapping Render builds).
- `npm run seed:core` runs after migrations and before the build. It upserts
  the core departments, services, doctors, and brand/contact defaults. The seed
  is idempotent and also reconciles missing core records if the saved seed
  version exists but records were removed later.
- Do not run `seed:core` in the start command. Admin editors can change
  service-doctor-device relations in production, and restart-time seeds must
  not rewrite those edits.
- `npm run seed:landing` then creates the 6 ready advertising landing pages
  under `/admin/pages`. It skips existing slugs by default so admin edits are
  preserved; use `LANDING_SEED_FORCE=1 npm run seed:landing` only when you
  intentionally want to re-apply the templates.
- `npm ci` (not `npm install`) is used so the build is reproducible
  from `package-lock.json`.
- The Next.js build is `next build` (with `output: "standalone"` set
  in `next.config.ts`).

## 3) Health check

| Setting           | Value                            |
| ----------------- | -------------------------------- |
| Health check path | `/api/health`                    |
| Expected status   | `200 OK`                         |
| Response body     | `{ "status": "ok", ... }` (JSON) |

## 4) Environment variables (Render â†’ Environment)

Copy these into the dashboard. Required values **must** be set before
the first deploy. Optional values can be added later.

| Key                              | Required | Sample value                                                   | Purpose                                                                                                                                                                                                                                                                                            |
| -------------------------------- | -------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                   | Yes      | Neon **pooled** URI (`â€¦-poolerâ€¦` host when Neon offers it) | Used by the app at runtime (serverless-friendly). If Neon does not give a separate pooled string, use their default **nonâ€‘pooling** URI. Optional Prisma tightening: append `?connection_limit=5&pool_timeout=10` **after** `sslmode=require` (`&connection_limit=5â€¦`) â€” adjust for traffic. |
| `DIRECT_URL`                     | Yes      | Neon **direct** URI (non-pooler host)                          | Required for `prisma migrate deploy` during build (advisory locks). Do **not** point both at the pooler-only endpoint.                                                                                                                                                                             |
| `AUTH_TRUST_HOST`                | Yes      | `true`                                                         | Required for trusted-host auth. Do not set `NEXTAUTH_URL` or `AUTH_URL` when serving Render preview URLs and `rejuvera.sa` from the same service.                                                                                                                                                  |
| `NEXTAUTH_SECRET`                | Yes      | `<random 32+ bytes>`                                           | NextAuth session encryption secret. Generate with `openssl rand -base64 32`. Render can auto-generate this.                                                                                                                                                                                        |
| `AUTH_SECRET`                    | Yes      | same as `NEXTAUTH_SECRET`                                      | NextAuth v5 mirror of `NEXTAUTH_SECRET`.                                                                                                                                                                                                                                                           |
| `SITE_URL`                       | Yes      | `https://rejuvera.sa`                                          | Used by SEO, sitemap, robots, OG.                                                                                                                                                                                                                                                                  |
| `R2_ACCOUNT_ID`                  | Yes      | `<cloudflare-account-id>`                                      | Cloudflare R2 account id.                                                                                                                                                                                                                                                                          |
| `R2_ENDPOINT`                    | Yes      | `https://<cloudflare-account-id>.r2.cloudflarestorage.com`     | R2 S3-compatible endpoint.                                                                                                                                                                                                                                                                         |
| `R2_BUCKET`                      | Yes      | `rejuvera`                                                     | Target bucket name.                                                                                                                                                                                                                                                                                |
| `R2_ACCESS_KEY_ID`               | Yes      | _from Cloudflare R2 â†’ API Tokens_                            | R2 access key id.                                                                                                                                                                                                                                                                                  |
| `R2_SECRET_ACCESS_KEY`           | Yes      | _from Cloudflare R2 â†’ API Tokens_                            | R2 secret access key.                                                                                                                                                                                                                                                                              |
| `R2_PUBLIC_BASE_URL`             | Optional | `https://cdn.rejuvera.sa`                                      | Public CDN/custom domain prefix; when set, uploads expose direct public URLs.                                                                                                                                                                                                                      |
| `RECAPTCHA_SITE_KEY`             | Yes      | `<recaptcha-site-key>`                                         | reCAPTCHA v3 site key.                                                                                                                                                                                                                                                                             |
| `RECAPTCHA_SECRET_KEY`           | Yes      | `<recaptcha-secret-key>`                                       | reCAPTCHA v3 secret.                                                                                                                                                                                                                                                                               |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Yes      | same as `RECAPTCHA_SITE_KEY`                                   | Site key exposed to the browser.                                                                                                                                                                                                                                                                   |
| `CONTACT_PHONE_PRIMARY`          | Optional | `0114999959`                                                   | Initial seed for DB Settings.                                                                                                                                                                                                                                                                      |
| `CONTACT_PHONE_SECONDARY`        | Optional | `9200 17403`                                                   | Initial seed for DB Settings.                                                                                                                                                                                                                                                                      |
| `CONTACT_EMAIL_PRIMARY`          | Optional | `info@rejuvera.sa`                                             | Initial seed for DB Settings.                                                                                                                                                                                                                                                                      |
| `CONTACT_EMAIL_SECONDARY`        | Optional | `info@rejuvera.sa`                                             | Initial seed for DB Settings.                                                                                                                                                                                                                                                                      |
| `GOOGLE_MAPS_EMBED_URL`          | Optional | `https://www.google.com/maps/embed?...`                        | Initial seed for `contact.mapsEmbedUrl`.                                                                                                                                                                                                                                                           |
| `NEXT_TELEMETRY_DISABLED`        | Optional | `1`                                                            | Disables Next.js anonymous telemetry.                                                                                                                                                                                                                                                              |
| `NODE_OPTIONS`                   | Optional | e.g. `--inspect` extras                                        | Rarely needed â€” the Render **start command** already passes `--max-old-space-size` via `node`. Extra flags merge with Node defaults.                                                                                                                                                             |
| `HOSTNAME`                       | Optional | `0.0.0.0`                                                      | Declared in `render.yaml`; ensures the standalone server binds publicly (Render supplies `PORT`).                                                                                                                                                                                                  |

> Secrets that the user has **not yet provided**:
>
> - `R2_ACCESS_KEY_ID`
> - `R2_SECRET_ACCESS_KEY`
>   Create them in Cloudflare R2 â†’ _Manage R2 API Tokens_ â†’ _Create
>   API Token_ â†’ _Object Read & Write on bucket `rejuvera`_.

## 5) Cron jobs (Render Cron)

The repository can drive backup and content-revalidation work via
Render Cron jobs that hit authenticated HTTP endpoints on the running
service. Example daily backup at 04:30 KSA (01:30 UTC):

```yaml
- type: cron
  name: rejuvera-nightly-backup
  schedule: "30 1 * * *"
  dockerCommand: |
    curl -sS -X POST \
      -H "Authorization: Bearer $BACKUP_TRIGGER_TOKEN" \
      https://rejuvera.sa/api/admin/backup
  envVars:
    - key: BACKUP_TRIGGER_TOKEN
      sync: false
```

Set `BACKUP_TRIGGER_TOKEN` to the same value as the corresponding
variable on the web service so the backup endpoint can authorize
unattended calls.

## 6) Domain & TLS

1. Add `rejuvera.sa` and `www.rejuvera.sa` as **custom domains** in
   Render settings.
2. Point Cloudflare DNS at the Render CNAME shown in the dashboard.
3. Render auto-provisions Let's Encrypt certificates.
4. Keep `SITE_URL=https://rejuvera.sa` as the SEO canonical domain, and
   remove `NEXTAUTH_URL` / `AUTH_URL` so admin login redirects stay on the
   same domain the user opened.

## 7) Local development

```bash
cp .env.example .env
# Fill in DATABASE_URL, DIRECT_URL, R2_*, RECAPTCHA_*, NEXTAUTH_SECRET.

npm ci
npx prisma generate
npm run dev
```

The dev server runs at `http://localhost:3000`. The admin panel lives
at `/admin` and seeded admin credentials can be created with
`npm run seed:admin` once `DATABASE_URL` is set.

## 8) Operational endpoints

| Route                    | Purpose                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `GET /api/health`        | Liveness probe (Render health check).                                                                           |
| `POST /api/admin/upload` | Authenticated upload to R2 (multipart form).                                                                    |
| `POST /api/admin/backup` | Authenticated nightly JSON snapshot of the content tables, stored in R2 under `backups/yyyy/mm/dd-{ulid}.json`. |

All `/api/admin/*` routes require a signed-in admin session. The
admin maintenance dashboard (`/admin/maintenance`) exposes manual
trigger buttons for the same actions.

## 9) Troubleshooting deploy failures

### `P1001: Can't reach database server at HOST:5432`

Render logs show the hostname **`HOST`** when **`DATABASE_URL` / `DIRECT_URL`** still contain a placeholder copyâ€‘paste from a template (e.g. `...@HOST/neondb` instead of the real Neon host).

**Fix:**

1. Open the [**Neon**](https://console.neon.tech) project â†’ **Connection details**.
2. Copy the **full** PostgreSQL URI (with real hostname like `ep-xxxx-xx.region.aws.neon.tech`, never the literal word `HOST`).
3. In Render â†’ **Environment**:
   - Set **`DATABASE_URL`** to Neonâ€™s **pooled** connection string (recommended for the running app; often labeled â€œPooledâ€ or compatible with serverless).
   - Set **`DIRECT_URL`** to Neonâ€™s **direct** connection string (used by `prisma migrate deploy` during build). Neon documents using `-pooler` vs nonâ€‘pooler endpoints â€” follow Neonâ€™s â€œMigrationsâ€ / **direct connection** guidance so migrations bypass PgBouncer where needed.
4. Both URLs must include **`?sslmode=require`** at the end.
5. Redeploy.

After fixing, Prisma should resolve something like `ep-flat-bread-â€¦.neon.tech`, not `HOST`.

### `P1002: â€¦ timed out â€¦ postgres advisory lock`

Prisma Migrate waits up to **10 seconds** for `pg_advisory_lock`; this cannot be raised from config.
Timeouts often happen when:

- Neon compute was **asleep** and wakes slowly during the build.
- **Two Render deploys** run `migrate deploy` at once (auto-deploy + manual redeploy).
- Another session still holds the migrate lock.

**Fix (repo):** the build uses `npm run prisma:migrate:deploy:retry`, which retries several times with a pause between attempts.

**Fix (ops):** keep Neon reachable during deploy; avoid triggering overlapping deploys; ensure **`DIRECT_URL`** is the **direct** (non-pooler) connection string Neon documents for migrations.

Last resort (single-worker setups only): set **`PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1`** on Render â€” Prisma documents this for clustered DBs; disabling removes collision protection, so do not use if multiple processes might migrate concurrently.

### Ran out of memory (512MB) / instance restarting

Starter instances cap RAM at ~**512MB** total â€” **RSS** includes V8 heap, buffers, native Prisma/driver memory, Next.js caches, concurrent requests, exports (PDF/XLS), etc.

**Operational fixes:**

- Prefer upgrading the web service to **Standard (2GB)** when traffic or admin exports are non-trivial.
- The production start path uses **standalone `server.js`** plus `node --max-old-space-size=460` to avoid the Node/V8 allocator claiming the whole slab at once â€” if you upgrade plans you can raise/remove that cap via the documented start command tweak.
