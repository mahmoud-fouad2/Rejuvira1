import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import {
  PublicContentCache,
  type PublicContentKey,
} from "./public-content-cache.ts";

test("1000 concurrent catalog reads run one database operation and warm reads reuse it", async () => {
  const cache = new PublicContentCache();
  let calls = 0;
  const load = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 5));
    return [{ slug: "service" }];
  };
  const results = await Promise.all(
    Array.from({ length: 1000 }, () => cache.read("services", load)),
  );
  assert.equal(calls, 1);
  assert.equal(results.length, 1000);
  await cache.read("services", load);
  assert.equal(calls, 1);
  assert.equal(cache.stats().joined, 999);
  assert.equal(cache.stats().pending, 0);
});

test("TTL expiry reloads, results are isolated and dates remain dates", async () => {
  let now = 0,
    calls = 0;
  const cache = new PublicContentCache(10, 10000, () => now);
  const load = async () => ({
    names: [String(++calls)],
    updatedAt: new Date(0),
  });
  const first = await cache.read("doctors", load);
  first.names.push("caller mutation");
  const second = await cache.read("doctors", load);
  assert.deepEqual(second.names, ["1"]);
  assert.ok(second.updatedAt instanceof Date);
  now = 10;
  assert.deepEqual((await cache.read("doctors", load)).names, ["2"]);
});

test("edits invalidate immediately and an older pending query cannot resurrect stale data", async () => {
  const cache = new PublicContentCache();
  let finish!: (value: string) => void;
  const old = cache.read(
    "services",
    () =>
      new Promise<string>((r) => {
        finish = r;
      }),
  );
  await Promise.resolve();
  cache.clear();
  assert.equal(await cache.read("services", async () => "new"), "new");
  finish("old");
  assert.equal(await old, "old");
  assert.equal(await cache.read("services", async () => "incorrect"), "new");
});

test("failed DB operations and oversized results are never stored", async () => {
  const cache = new PublicContentCache(1000, 20);
  await assert.rejects(
    cache.read("settings", async () => {
      throw new Error("db down");
    }),
  );
  assert.equal(cache.stats().entries, 0);
  await cache.read("settings", async () => "x".repeat(100));
  assert.equal(cache.stats().entries, 0);
  assert.equal(await cache.read("settings", async () => "ok"), "ok");
});

test("serialized budget and fixed keys bound cache growth; patient/session keys are forbidden", async () => {
  const cache = new PublicContentCache(1000, 30);
  for (const key of [
    "doctors",
    "services",
    "devices",
    "categories",
    "settings",
  ] as const) {
    await cache.read(key, async () => "x".repeat(15));
    assert.ok(cache.stats().bytes <= 30);
    assert.ok(cache.stats().entries <= 5);
  }
  for (const key of ["patients", "contactSubmissions", "sessions"]) {
    await assert.rejects(
      cache.read(key as PublicContentKey, async () => "private"),
    );
  }
});

test("repository integrates only the five fixed reads and invalidates all catalog mutations", () => {
  const source = readFileSync(
    new URL("./content-repository.ts", import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile(
    "content-repository.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const mutations = [
    "createDoctorDraft",
    "updateDoctorProfile",
    "createServiceDraft",
    "createDeviceDraft",
    "saveSettingsGroup",
    "createServiceCategory",
    "updateServiceCategory",
    "deleteServiceCategory",
    "updateService",
    "updateServiceStatus",
    "deleteService",
    "updateDevice",
    "updateDeviceStatus",
    "deleteDevice",
    "updateDoctorStatus",
    "deleteDoctor",
  ];
  for (const name of mutations) {
    const node = ast.statements.find(
      (n) => ts.isFunctionDeclaration(n) && n.name?.text === name,
    );
    assert.ok(node && ts.isFunctionDeclaration(node) && node.body, name);
    assert.match(node.getText(ast), /invalidatePublicContentCache\(\)/, name);
  }
  assert.equal((source.match(/publicContentCache\.read\(/g) ?? []).length, 5);
  for (const name of [
    "createContactLead",
    "getCrmSubmissions",
    "getAdminUsers",
    "getCustomPageLeadWebhookBySlug",
  ]) {
    const node = ast.statements.find(
      (n) => ts.isFunctionDeclaration(n) && n.name?.text === name,
    )!;
    assert.doesNotMatch(node.getText(ast), /publicContentCache/);
  }
  const prisma = readFileSync(new URL("./prisma.ts", import.meta.url), "utf8");
  assert.match(prisma, /globalForPrisma\.prisma = prisma;/);
  assert.doesNotMatch(prisma, /if \(process\.env\.NODE_ENV !== "production"\)/);
});
