# Render memory guardrails (2026-10-12)

The Starter container repeatedly exceeded its 512 MiB memory limit. Around the
latest failure, Prisma also reported P2024 timeouts in the public services query.
The failure preceded the WhatsApp release as well; that release is not established
as its cause. Burst traffic and queued reads are a likely contributor, not a
proven complete explanation of every spike.

## Changes

- Share one Prisma client across production bundles in the Node process. Preserve
  the existing connection limit, retry behavior and database configuration.
- Deduplicate concurrent reads of five fixed catalog/settings keys. Cache results
  for 10 seconds, with an 8 MiB serialized-data budget and 2 MiB per-result limit.
  The serialized budget is not an exact measurement of object heap usage.
- Return independent clones, preserve Dates, do not cache query failures, and
  invalidate after catalog/settings changes in the repository. In-flight results
  cannot repopulate an invalidated entry. Other processes or direct database
  edits become visible after at most the TTL; no distributed cache was introduced.
- Do not cache leads, patient data, sessions, authenticated HTML or form responses.
  Lead persistence, webhooks, conversion dispatch and tracking code are unchanged.
- On Linux, replace the launcher with the standalone server using `process.execve`
  when supported; retain the previous spawn fallback elsewhere.
- Reserve half the memory of 128–1024 MiB containers outside the V8 old generation.
  The existing 384 MiB setting becomes a 256 MiB old-generation cap on Render's
  512 MiB container. Explicit `NODE_OPTIONS` heap settings still take priority.
  This is not a cap on total RSS or the entire V8 heap; native buffers, young
  generation, code and wrappers still need memory.
- Sample memory every 20 seconds, log routine samples every two minutes, and warn
  at 80% container use or the configured RSS threshold. Catalog metrics contain
  counts/estimated bytes only, not URLs, credentials or patient fields.

## Verification and rollout

- Production build, focused ESLint and 62 memory/form/tracking regression tests
  passed before release. The cache concurrency test shares one loader across
  1,000 simultaneous reads and checks invalidation/expiry/error behavior.
- A local standalone smoke test with the database intentionally disabled finished
  80 GET requests (8 concurrent) without transport errors: homepage/health returned
  200, database-owned custom landing pages returned the expected 404. This test
  does not establish production database performance or eliminate all OOM risks.
- After deployment, verify Live commit, heap startup/process chain, public landing
  responses and cache hits in Render logs. Observe real traffic before concluding
  that the intermittent failures have stopped.
- Roll back by reverting the release commit and deploying that revert. No schema
  migration, hosting-plan change, credentials or Render environment edit is needed.
