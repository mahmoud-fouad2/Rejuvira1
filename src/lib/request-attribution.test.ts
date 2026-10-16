import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { REQUEST_ATTRIBUTION_SCRIPT } from "./request-attribution.ts";

const now = 1_800_000_000_000;
const day = 24 * 60 * 60 * 1000;
type Input = {
  name: string;
  type: string;
  value: string;
  form?: object | null;
};

function harness(
  options: {
    href?: string;
    stored?: string;
    blockedStorage?: boolean;
    readOnlyHistory?: boolean;
    inputs?: Input[];
  } = {},
) {
  let href = options.href ?? "https://rejuvera.sa/";
  const storage = new Map<string, string>();
  if (options.stored) storage.set("rejuvera_utm", options.stored);
  let storageWrites = 0;
  let mutation: (() => void) | undefined;
  const windowListeners = new Map<string, () => void>();
  const documentListeners = new Map<
    string,
    { listener: () => void; capture: boolean }
  >();
  const inputs = options.inputs ?? [];
  const defaultForm = {};
  const addInput = (
    name: string,
    value = "",
    type = "hidden",
    form = defaultForm,
  ) => {
    const input = { name, value, type, form };
    inputs.push(input);
    return input;
  };
  const nativeCalls: Array<{ receiver: unknown; args: unknown[] }> = [];
  const history = {
    pushState: function (...args: unknown[]) {
      nativeCalls.push({ receiver: this, args });
      if (args[2] === "/throw") throw new Error("native history failure");
      if (args[2] != null) href = new URL(String(args[2]), href).href;
      return "native result";
    },
    replaceState: function (...args: unknown[]) {
      nativeCalls.push({ receiver: this, args });
      if (args[2] != null) href = new URL(String(args[2]), href).href;
      return "native result";
    },
  };
  if (options.readOnlyHistory) Object.freeze(history);
  const window = {
    history,
    location: {
      get href() {
        return href;
      },
    },
    get localStorage() {
      if (options.blockedStorage) throw new Error("storage denied");
      return {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storageWrites++;
          storage.set(key, value);
        },
        removeItem: (key: string) => storage.delete(key),
      };
    },
    addEventListener: (event: string, listener: () => void) => {
      windowListeners.set(event, listener);
    },
  };
  const context = vm.createContext({
    window,
    URL,
    Date: class extends Date {
      static now() {
        return now;
      }
    },
    document: {
      referrer: "https://example.test/entry",
      documentElement: {},
      querySelectorAll: (selector: string) => {
        const name = selector.match(
          /^input\[type="hidden"\]\[name="([^"]+)"\]$/,
        )?.[1];
        return inputs.filter(
          (input) => input.type === "hidden" && input.name === name,
        );
      },
      addEventListener: (
        event: string,
        listener: () => void,
        capture: boolean,
      ) => documentListeners.set(event, { listener, capture }),
    },
    MutationObserver: class {
      constructor(callback: () => void) {
        mutation = callback;
      }
      observe() {}
    },
  });
  const boot = () => vm.runInContext(REQUEST_ATTRIBUTION_SCRIPT, context);
  return {
    window,
    history,
    storage,
    nativeCalls,
    documentListeners,
    addInput,
    boot,
    stored: () => JSON.parse(storage.get("rejuvera_utm") ?? "{}"),
    storageWrites: () => storageWrites,
    mutate: () => mutation?.(),
    pop: (url: string) => {
      href = new URL(url, href).href;
      windowListeners.get("popstate")?.();
    },
    setUrl: (url: string) => {
      href = new URL(url, href).href;
    },
  };
}

test("initial URL attribution fills hidden aliases without touching visible fields", () => {
  const h = harness({
    href: "https://rejuvera.sa/p/example?utm_source=google&utm_campaign=campaign&gclid=sample_click",
  });
  const source = h.addInput("utm_source");
  const alias = h.addInput("utmSource");
  const click = h.addInput("gclid");
  const landing = h.addInput("landingPageUrl");
  const visible = h.addInput("utm_source", "", "text");
  h.boot();
  assert.equal(source.value, "google");
  assert.equal(alias.value, "google");
  assert.equal(click.value, "sample_click");
  assert.equal(landing.value, h.window.location.href);
  assert.equal(visible.value, "");
  assert.equal(h.stored().__capturedAt, now);
});

test("query-only SPA navigation replaces the full campaign set and updates owned fields", () => {
  const h = harness({
    href: "https://rejuvera.sa/?utm_source=google&gclid=sample_google&wbraid=sample_web",
  });
  const source = h.addInput("utm_source");
  const click = h.addInput("gclid");
  const braid = h.addInput("wbraid");
  h.boot();
  const state = { next: true };
  const destination = "/?utm_source=facebook&utm_campaign=new_campaign";
  assert.equal(h.history.replaceState(state, "", destination), "native result");
  assert.equal(source.value, "facebook");
  assert.equal(click.value, "");
  assert.equal(braid.value, "");
  assert.equal(h.stored().gclid, undefined);
  assert.equal(h.stored().wbraid, undefined);
  assert.equal(h.stored().utm_campaign, "new_campaign");
  assert.equal(h.nativeCalls[0]?.receiver, h.history);
  assert.deepEqual(h.nativeCalls[0]?.args, [state, "", destination]);
});

test("internal navigation without campaign parameters retains the last touch for new forms", () => {
  const landing = "https://rejuvera.sa/?utm_source=google&gclid=sample_click";
  const h = harness({ href: landing });
  h.boot();
  const capturedAt = h.stored().__capturedAt;
  h.history.pushState({}, "", "/contact");
  const source = h.addInput("utm_source");
  const click = h.addInput("gclid");
  const page = h.addInput("pageUrl");
  h.mutate();
  assert.equal(source.value, "google");
  assert.equal(click.value, "sample_click");
  assert.equal(page.value, landing);
  assert.equal(h.stored().__capturedAt, capturedAt);
  assert.equal(h.storageWrites(), 1);
});

test("server and externally edited hidden fields are never overwritten", () => {
  const h = harness({ href: "https://rejuvera.sa/?utm_source=google" });
  const server = h.addInput("utmSource", "server_source", "hidden", {});
  const external = h.addInput("utm_source");
  h.boot();
  external.value = "external_source";
  h.history.pushState({}, "", "/contact?utm_source=facebook");
  assert.equal(server.value, "server_source");
  assert.equal(external.value, "external_source");
  external.value = "";
  h.mutate();
  assert.equal(external.value, "facebook");
});

test("a form's external cohort cannot acquire click IDs from another source or block other forms", () => {
  const h = harness({
    href: "https://rejuvera.sa/?utm_source=google&utm_campaign=current_campaign&gclid=sample_google",
  });
  const externalForm = {};
  const serverSource = h.addInput(
    "utm_source",
    "facebook",
    "hidden",
    externalForm,
  );
  const serverCampaign = h.addInput(
    "utm_campaign",
    "server_campaign",
    "hidden",
    externalForm,
  );
  const protectedClick = h.addInput("gclid", "", "hidden", externalForm);
  const otherSource = h.addInput("utm_source");
  const otherClick = h.addInput("gclid");
  h.boot();
  assert.equal(serverSource.value, "facebook");
  assert.equal(serverCampaign.value, "server_campaign");
  assert.equal(protectedClick.value, "");
  assert.equal(otherSource.value, "google");
  assert.equal(otherClick.value, "sample_google");
});

test("an external source edit removes only script-owned fields from its previous cohort", () => {
  const h = harness({
    href: "https://rejuvera.sa/?utm_source=google&gclid=sample_google",
  });
  const source = h.addInput("utm_source");
  const click = h.addInput("gclid");
  const serverClick = h.addInput("gclid", "server_click", "hidden", {});
  h.boot();
  assert.equal(click.value, "sample_google");
  source.value = "facebook";
  h.mutate();
  assert.equal(source.value, "facebook");
  assert.equal(click.value, "");
  assert.equal(serverClick.value, "server_click");
});

test("matching server context may be completed without replacing its values", () => {
  const h = harness({
    href: "https://rejuvera.sa/?utm_source=google&gclid=sample_google",
  });
  const source = h.addInput("utm_source", "google");
  const click = h.addInput("gclid");
  h.boot();
  assert.equal(source.value, "google");
  assert.equal(click.value, "sample_google");
});

test("a form reset refills attribution for a second submission without losing the last touch", () => {
  const h = harness({
    href: "https://rejuvera.sa/?utm_source=google&gclid=sample_click",
  });
  const source = h.addInput("utm_source");
  const click = h.addInput("gclid");
  h.boot();
  source.value = "";
  click.value = "";
  const submit = h.documentListeners.get("submit");
  submit?.listener();
  assert.equal(source.value, "google");
  assert.equal(click.value, "sample_click");
  h.history.pushState({}, "", "/contact?utm_source=facebook");
  source.value = "";
  click.value = "";
  submit?.listener();
  assert.equal(source.value, "facebook");
  assert.equal(click.value, "");
});

test("valid stored context survives a direct visit but expires after 90 days", () => {
  for (const age of [89 * day, 90 * day + 1]) {
    const h = harness({
      stored: JSON.stringify({
        __capturedAt: now - age,
        __landingPage: "https://rejuvera.sa/p/entry",
        utm_source: "google",
        gclid: "sample_stored",
      }),
    });
    const source = h.addInput("utm_source");
    const click = h.addInput("gclid");
    h.boot();
    assert.equal(source.value, age < 90 * day ? "google" : "");
    assert.equal(click.value, age < 90 * day ? "sample_stored" : "");
    if (age > 90 * day) assert.equal(h.storage.has("rejuvera_utm"), false);
  }
});

test("blocked localStorage cannot suppress current attribution or later SPA touches", () => {
  const h = harness({
    href: "https://rejuvera.sa/?utm_source=google&gclid=sample_click",
    blockedStorage: true,
  });
  const source = h.addInput("utm_source");
  const click = h.addInput("gclid");
  assert.doesNotThrow(h.boot);
  assert.equal(source.value, "google");
  assert.equal(click.value, "sample_click");
  h.history.pushState({}, "", "/contact?utm_source=facebook");
  assert.equal(source.value, "facebook");
  assert.equal(click.value, "");
});

test("popstate and pre-submit capture refresh attribution even without writable History APIs", () => {
  const h = harness({ readOnlyHistory: true });
  const source = h.addInput("utm_source");
  h.boot();
  h.pop("/contact?utm_source=bing");
  assert.equal(source.value, "bing");
  h.setUrl("/contact?utm_source=facebook");
  const submit = h.documentListeners.get("submit");
  assert.equal(submit?.capture, true);
  submit?.listener();
  assert.equal(source.value, "facebook");
});

test("bootstrap is idempotent and native History errors are preserved", () => {
  const h = harness();
  h.boot();
  h.boot();
  assert.throws(
    () => h.history.pushState({}, "", "/throw"),
    /native history failure/,
  );
  assert.equal(h.nativeCalls.length, 1);
  assert.equal(h.window.location.href, "https://rejuvera.sa/");
});
