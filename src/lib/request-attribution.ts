/** Self-contained browser bootstrap; keep its CSP nonce on the layout Script. */
export const REQUEST_ATTRIBUTION_SCRIPT = String.raw`(function () {
  if (window.__rejuveraAttributionInstalled) return;
  window.__rejuveraAttributionInstalled = true;

  var storageKey = "rejuvera_utm";
  var maxAge = 90 * 24 * 60 * 60 * 1000;
  var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid"];
  var aliases = {utm_source: "utmSource", utm_medium: "utmMedium", utm_campaign: "utmCampaign", utm_content: "utmContent", utm_term: "utmTerm"};
  var ownedValues = new WeakMap();
  var initialLandingPage = window.location.href;
  var initialReferrer = document.referrer || "";
  var lastSeenUrl = "";
  var stored = {};

  function clean(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
  }

  function persist(value) {
    try {
      if (value) window.localStorage.setItem(storageKey, JSON.stringify(value));
      else window.localStorage.removeItem(storageKey);
    } catch (error) {
      // In-memory attribution and the current URL still work without storage.
    }
  }

  try {
    var previous = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    if (previous && typeof previous === "object" && !Array.isArray(previous)) {
      var capturedAt = Number(previous.__capturedAt);
      if (Number.isFinite(capturedAt) && capturedAt > 0 && Date.now() - capturedAt <= maxAge) {
        stored = {__capturedAt: capturedAt, __landingPage: clean(previous.__landingPage, 2000), __referrer: clean(previous.__referrer, 2000)};
        keys.forEach(function (key) {
          var value = clean(previous[key], 250);
          if (value) stored[key] = value;
        });
      } else if (Object.keys(previous).length) {
        persist(null);
      }
    }
  } catch (error) {
    // A blocked or malformed localStorage entry must not suppress current UTMs.
  }

  function refreshContext() {
    if (stored.__capturedAt && Date.now() - stored.__capturedAt > maxAge) {
      stored = {};
      persist(null);
    }
    var href = window.location.href;
    if (href === lastSeenUrl) return;
    lastSeenUrl = href;
    var params = new URL(href).searchParams;
    var current = {};
    keys.forEach(function (key) {
      var value = clean(params.get(key), 250);
      if (value) current[key] = value;
    });
    if (!Object.keys(current).length) return;
    // A new campaign touch replaces the whole set; never carry an old click ID.
    stored = Object.assign({__capturedAt: Date.now(), __landingPage: href, __referrer: initialReferrer}, current);
    persist(stored);
  }

  function fillField(input, value) {
    if (ownedValues.has(input)) {
      if (input.value !== "" && input.value !== ownedValues.get(input)) {
        ownedValues.delete(input);
        return;
      }
    } else if (input.value !== "") {
      return;
    }
    input.value = value;
    ownedValues.set(input, value);
  }

  function collectNamedFields(groups, name, value, isAttribution) {
    document.querySelectorAll('input[type="hidden"][name="' + name + '"]').forEach(function (input) {
      var owner = input.form || input;
      if (!groups.has(owner)) groups.set(owner, []);
      groups.get(owner).push({input: input, value: value, isAttribution: isAttribution});
    });
  }

  function sync() {
    try {
      refreshContext();
      var groups = new Map();
      keys.forEach(function (key) {
        var value = stored[key] || "";
        collectNamedFields(groups, key, value, true);
        if (aliases[key]) collectNamedFields(groups, aliases[key], value, true);
      });
      var landingPage = stored.__landingPage || initialLandingPage;
      collectNamedFields(groups, "pageUrl", landingPage, false);
      collectNamedFields(groups, "landingPageUrl", landingPage, false);
      collectNamedFields(groups, "referrerUrl", stored.__referrer || initialReferrer, false);
      groups.forEach(function (fields) {
        var differentContext = fields.some(function (field) {
          var input = field.input;
          var isOwned = ownedValues.has(input) && input.value === ownedValues.get(input);
          return field.isAttribution && input.value !== "" && !isOwned && input.value !== field.value;
        });
        fields.forEach(function (field) {
          var input = field.input;
          if (differentContext) {
            // Preserve the form's external context; remove only our own old values.
            if (ownedValues.has(input) && input.value === ownedValues.get(input)) {
              input.value = "";
              ownedValues.set(input, "");
            }
          } else {
            fillField(input, field.value);
          }
        });
      });
    } catch (error) {
      // Attribution is optional and must not interrupt navigation or submission.
    }
  }

  // Next and other client-side routers may update the query without changing DOM.
  ["pushState", "replaceState"].forEach(function (name) {
    try {
      var original = window.history[name];
      window.history[name] = function () {
        var result = original.apply(this, arguments);
        sync();
        return result;
      };
    } catch (error) {
      // DOM/popstate/submit hooks still work if the History methods are read-only.
    }
  });
  window.addEventListener("popstate", sync);
  window.addEventListener("pageshow", sync);
  document.addEventListener("submit", sync, true);
  sync();
  new MutationObserver(sync).observe(document.documentElement, {childList: true, subtree: true});
})();`;
