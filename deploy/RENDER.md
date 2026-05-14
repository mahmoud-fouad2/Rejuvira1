# Deploying Rejuvira Center to Render.com

This document is the source of truth for **production deployment** of
the Rejuvira Center web app on [Render.com](https://render.com).

The full set of build/runtime variables is declared in
[`.env.example`](../.env.example). Add every variable listed there to
**Render → Service → Environment** before the first deploy.

---

## 1) Node runtime

| Setting | Value |
| --- | --- |
| Runtime | `Node` |
| Region | `Frankfurt` (Europe) or `Oregon` — match the Neon region |
| Plan | `Starter` allocates **512MB RAM**. Next.js production often exceeds that under modest traffic — expect **OOM / instance restarts** on Starter. Prefer **`standard`** (**2GB**) for reliable production (**Render → Billing / change plan**). |
| Node version | `>= 22` (Render auto-detects `engines.node` from `package.json`) |
| Persistent disk | **Not required.** All uploads go to Cloudflare R2. |

The repository's [`render.yaml`](../render.yaml) declares the service
and the full env-var skeleton (values are not committed; set them in
the Render dashboard).

## 2) Build & start commands

Use these **exact** strings in Render → Settings → Build & Deploy:

```bash
# Build command (--include=dev: Render sets NODE_ENV=production; without this,
# devDependencies like Prisma CLI / Tailwind tooling may be skipped and the build fails.)
npm ci --include=dev --no-audit --no-fund && npx prisma generate && npm run prisma:migrate:deploy:retry && npm run build
```

```bash
# Start command — standalone Node server (smaller footprint than `next start` / npm wrapper)
# and caps V8 heap for 512MB Render instances (tune if you upgrade plan).
cd .next/standalone && NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=460" node server.js
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
- `npm ci` (not `npm install`) is used so the build is reproducible
  from `package-lock.json`.
- The Next.js build is `next build` (with `output: "standalone"` set
  in `next.config.ts`).

## 3) Health check

| Setting | Value |
| --- | --- |
| Health check path | `/api/health` |
| Expected status | `200 OK` |
| Response body | `{ "status": "ok", ... }` (JSON) |

## 4) Environment variables (Render → Environment)

Copy these into the dashboard. Required values **must** be set before
the first deploy. Optional values can be added later.

| Key | Required | Sample value | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Neon **pooled** URI (`…-pooler…` host when Neon offers it) | Used by the app at runtime (serverless-friendly). If Neon does not give a separate pooled string, use their default **non‑pooling** URI. Optional Prisma tightening: append `?connection_limit=5&pool_timeout=10` **after** `sslmode=require` (`&connection_limit=5…`) — adjust for traffic. |
| `DIRECT_URL` | Yes | Neon **direct** URI (non-pooler host) | Required for `prisma migrate deploy` during build (advisory locks). Do **not** point both at the pooler-only endpoint. |
| `NEXTAUTH_URL` | Yes | `https://rejuveracenter.sa` | Public base URL for NextAuth callbacks. |
| `NEXTAUTH_SECRET` | Yes | `<random 32+ bytes>` | NextAuth session encryption secret. Generate with `openssl rand -base64 32`. Render can auto-generate this. |
| `AUTH_URL` | Yes | `https://rejuveracenter.sa` | NextAuth v5 mirror of `NEXTAUTH_URL`. |
| `AUTH_SECRET` | Yes | same as `NEXTAUTH_SECRET` | NextAuth v5 mirror of `NEXTAUTH_SECRET`. |
| `SITE_URL` | Yes | `https://rejuveracenter.sa` | Used by SEO, sitemap, robots, OG. |
| `R2_ACCOUNT_ID` | Yes | `b7e00c4c9c0ba3b4b20a0b001e2b14ac` | Cloudflare R2 account id. |
| `R2_ENDPOINT` | Yes | `https://b7e00c4c9c0ba3b4b20a0b001e2b14ac.r2.cloudflarestorage.com` | R2 S3-compatible endpoint. |
| `R2_BUCKET` | Yes | `rejuvera` | Target bucket name. |
| `R2_ACCESS_KEY_ID` | Yes | _from Cloudflare R2 → API Tokens_ | R2 access key id. |
| `R2_SECRET_ACCESS_KEY` | Yes | _from Cloudflare R2 → API Tokens_ | R2 secret access key. |
| `R2_PUBLIC_BASE_URL` | Optional | `https://cdn.rejuveracenter.sa` | Public CDN/custom domain prefix; when set, uploads expose direct public URLs. |
| `RECAPTCHA_SITE_KEY` | Yes | `6LddL-osAAAAAGw48jLbjDZqd0LNRJtLNP1BCR09` | reCAPTCHA v3 site key. |
| `RECAPTCHA_SECRET_KEY` | Yes | `6LddL-osAAAAADyUqH0399qBwVVY2-jAi0Rjj1D5` | reCAPTCHA v3 secret. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Yes | same as `RECAPTCHA_SITE_KEY` | Site key exposed to the browser. |
| `CONTACT_PHONE_PRIMARY` | Optional | `0114999959` | Initial seed for DB Settings. |
| `CONTACT_PHONE_SECONDARY` | Optional | `9200 17403` | Initial seed for DB Settings. |
| `CONTACT_EMAIL_PRIMARY` | Optional | `info@rejuveracenter.sa` | Initial seed for DB Settings. |
| `CONTACT_EMAIL_SECONDARY` | Optional | `info@rejuveracenter.com.sa` | Initial seed for DB Settings. |
| `GOOGLE_MAPS_EMBED_URL` | Optional | `https://www.google.com/maps/embed?...` | Initial seed for `contact.mapsEmbedUrl`. |
| `NEXT_TELEMETRY_DISABLED` | Optional | `1` | Disables Next.js anonymous telemetry. |
| `NODE_OPTIONS` | Optional | Omit in dashboard | The **start command** already appends `--max-old-space-size=460` inside `.next/standalone`. Add extra Node flags here only when you want them applied consistently. |
| `HOSTNAME` | Optional | `0.0.0.0` | Declared in `render.yaml`; ensures the standalone server binds publicly (Render supplies `PORT`). |

> Secrets that the user has **not yet provided**:
> - `R2_ACCESS_KEY_ID`
> - `R2_SECRET_ACCESS_KEY`
> Create them in Cloudflare R2 → _Manage R2 API Tokens_ → _Create
> API Token_ → _Object Read & Write on bucket `rejuvera`_.

## 5) Cron jobs (Render Cron)

The repository can drive backup and content-revalidation work via
Render Cron jobs that hit authenticated HTTP endpoints on the running
service. Example daily backup at 04:30 KSA (01:30 UTC):

```yaml
- type: cron
  name: rejuvira-nightly-backup
  schedule: "30 1 * * *"
  dockerCommand: |
    curl -sS -X POST \
      -H "Authorization: Bearer $BACKUP_TRIGGER_TOKEN" \
      https://rejuveracenter.sa/api/admin/backup
  envVars:
    - key: BACKUP_TRIGGER_TOKEN
      sync: false
```

Set `BACKUP_TRIGGER_TOKEN` to the same value as the corresponding
variable on the web service so the backup endpoint can authorize
unattended calls.

## 6) Domain & TLS

1. Add `rejuveracenter.sa` and `www.rejuveracenter.sa` as **custom
   domains** in Render → Settings → Custom Domains.
2. Point Cloudflare DNS at the Render CNAME shown in the dashboard.
3. Render auto-provisions Let's Encrypt certificates.
4. After DNS propagation, ensure `NEXTAUTH_URL` / `AUTH_URL` /
   `SITE_URL` all match the final public domain.

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

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Liveness probe (Render health check). |
| `POST /api/admin/upload` | Authenticated upload to R2 (multipart form). |
| `POST /api/admin/backup` | Authenticated nightly JSON snapshot of the content tables, stored in R2 under `backups/yyyy/mm/dd-{ulid}.json`. |

All `/api/admin/*` routes require a signed-in admin session. The
admin maintenance dashboard (`/admin/maintenance`) exposes manual
trigger buttons for the same actions.

## 9) Troubleshooting deploy failures

### `P1001: Can't reach database server at HOST:5432`

Render logs show the hostname **`HOST`** when **`DATABASE_URL` / `DIRECT_URL`** still contain a placeholder copy‑paste from a template (e.g. `...@HOST/neondb` instead of the real Neon host).

**Fix:**

1. Open the [**Neon**](https://console.neon.tech) project → **Connection details**.
2. Copy the **full** PostgreSQL URI (with real hostname like `ep-xxxx-xx.region.aws.neon.tech`, never the literal word `HOST`).
3. In Render → **Environment**:
   - Set **`DATABASE_URL`** to Neon’s **pooled** connection string (recommended for the running app; often labeled “Pooled” or compatible with serverless).
   - Set **`DIRECT_URL`** to Neon’s **direct** connection string (used by `prisma migrate deploy` during build). Neon documents using `-pooler` vs non‑pooler endpoints — follow Neon’s “Migrations” / **direct connection** guidance so migrations bypass PgBouncer where needed.
4. Both URLs must include **`?sslmode=require`** at the end.
5. Redeploy.

After fixing, Prisma should resolve something like `ep-flat-bread-….neon.tech`, not `HOST`.

### `P1002: … timed out … postgres advisory lock`

Prisma Migrate waits up to **10 seconds** for `pg_advisory_lock`; this cannot be raised from config.
Timeouts often happen when:

- Neon compute was **asleep** and wakes slowly during the build.
- **Two Render deploys** run `migrate deploy` at once (auto-deploy + manual redeploy).
- Another session still holds the migrate lock.

**Fix (repo):** the build uses `npm run prisma:migrate:deploy:retry`, which retries several times with a pause between attempts.

**Fix (ops):** keep Neon reachable during deploy; avoid triggering overlapping deploys; ensure **`DIRECT_URL`** is the **direct** (non-pooler) connection string Neon documents for migrations.

Last resort (single-worker setups only): set **`PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1`** on Render — Prisma documents this for clustered DBs; disabling removes collision protection, so do not use if multiple processes might migrate concurrently.
