"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Route } from "next";

import type {
  IntegrationLogDTO,
  IntegrationToolDTO,
  IntegrationParameter,
  IntegrationHeader,
  IntegrationAuthConfig,
  IntegrationResponseMapping,
  ParameterType,
} from "@/lib/integration-tools-shared";
import { isValidToolName } from "@/lib/integration-tools-shared";

type ToolType = "WEBHOOK" | "API_CALL";
type AuthType = "NONE" | "BEARER" | "API_KEY" | "BASIC";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FormState {
  name: string;
  description: string;
  type: ToolType;
  method: HttpMethod;
  url: string;
  headers: IntegrationHeader[];
  authType: AuthType;
  authConfig: IntegrationAuthConfig;
  parameters: IntegrationParameter[];
  bodyTemplate: string;
  responseMapping: IntegrationResponseMapping;
  aiInstructions: string;
  timeoutMs: number;
  isActive: boolean;
}

function fromTool(tool?: IntegrationToolDTO): FormState {
  return {
    name: tool?.name ?? "",
    description: tool?.description ?? "",
    type: (tool?.type as ToolType) ?? "WEBHOOK",
    method: (tool?.method as HttpMethod) ?? "POST",
    url: tool?.url ?? "",
    headers: tool?.headers?.length ? tool.headers : [{ key: "", value: "" }],
    authType: (tool?.authType as AuthType) ?? "NONE",
    authConfig: tool?.authConfig ?? {},
    parameters: tool?.parameters ?? [],
    bodyTemplate: tool?.bodyTemplate ?? "",
    responseMapping: tool?.responseMapping ?? {},
    aiInstructions: tool?.aiInstructions ?? "",
    timeoutMs: tool?.timeoutMs ?? 10000,
    isActive: tool?.isActive ?? true,
  };
}

interface Props {
  tool?: IntegrationToolDTO;
  initialLogs?: IntegrationLogDTO[];
}

export function IntegrationToolForm({ tool, initialLogs = [] }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => fromTool(tool));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testParams, setTestParams] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of tool?.parameters ?? []) {
      init[p.name] = p.example ?? "";
    }
    return init;
  });
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    httpStatus: number | null;
    body: unknown;
    elapsed: number;
    error?: string;
  } | null>(null);
  const [logs, setLogs] = useState<IntegrationLogDTO[]>(initialLogs);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function setHeader(idx: number, patch: Partial<IntegrationHeader>) {
    setState((prev) => ({
      ...prev,
      headers: prev.headers.map((h, i) => (i === idx ? { ...h, ...patch } : h)),
    }));
  }

  function addHeader() {
    setState((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: "", value: "" }],
    }));
  }

  function removeHeader(idx: number) {
    setState((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== idx),
    }));
  }

  function setParameter(idx: number, patch: Partial<IntegrationParameter>) {
    setState((prev) => ({
      ...prev,
      parameters: prev.parameters.map((p, i) =>
        i === idx ? { ...p, ...patch } : p,
      ),
    }));
  }

  function addParameter() {
    setState((prev) => ({
      ...prev,
      parameters: [
        ...prev.parameters,
        {
          name: "",
          type: "string",
          required: true,
          description: "",
          example: "",
          enumOptions: [],
        },
      ],
    }));
  }

  function removeParameter(idx: number) {
    setState((prev) => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== idx),
    }));
  }

  function nameError(): string | null {
    if (!state.name) return "Name is required.";
    if (!isValidToolName(state.name)) {
      return "Use lowercase letters, digits, underscores. Start with a letter.";
    }
    return null;
  }

  function payload() {
    return {
      name: state.name.trim(),
      description: state.description.trim(),
      type: state.type,
      method: state.method,
      url: state.url.trim(),
      headers: state.headers.filter((h) => h.key.trim()),
      authType: state.authType,
      authConfig: state.authConfig,
      parameters: state.parameters
        .filter((p) => p.name.trim())
        .map((p) => ({
          ...p,
          enumOptions: p.enumOptions ?? [],
        })),
      bodyTemplate: state.bodyTemplate.trim() ? state.bodyTemplate : null,
      responseMapping: state.responseMapping,
      aiInstructions: state.aiInstructions.trim()
        ? state.aiInstructions
        : null,
      timeoutMs: state.timeoutMs,
      isActive: state.isActive,
    };
  }

  async function save() {
    setError(null);
    setSuccess(null);
    const ne = nameError();
    if (ne) {
      setError(ne);
      return;
    }
    if (!state.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!state.url.trim()) {
      setError("Endpoint URL is required.");
      return;
    }
    try {
      new URL(state.url);
    } catch {
      setError("Endpoint URL is invalid.");
      return;
    }

    startTransition(async () => {
      try {
        const isEdit = Boolean(tool?.id);
        const res = await fetch(
          isEdit
            ? `/api/admin/integration-tools/${tool!.id}`
            : `/api/admin/integration-tools`,
          {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload()),
          },
        );
        const json = await res.json();
        if (!res.ok || json.status !== "success") {
          throw new Error(json.message ?? "Failed to save.");
        }
        setSuccess(isEdit ? "Saved." : "Created.");
        const created = json.data as IntegrationToolDTO;
        if (!isEdit) {
          router.push(
            `/admin/integration-tools/${created.id}` as Route,
          );
          router.refresh();
        } else {
          router.refresh();
        }
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  async function runTest() {
    if (!tool?.id) {
      setError("Save the integration before testing.");
      return;
    }
    setTestResult(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/integration-tools/${tool.id}/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params: testParams }),
        },
      );
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message ?? "Test failed.");
      }
      const r = json.data as {
        success: boolean;
        message: string;
        raw: { httpStatus: number | null; body: unknown };
        executionMs: number;
        error?: string;
      };
      setTestResult({
        success: r.success,
        message: r.message,
        httpStatus: r.raw.httpStatus,
        body: r.raw.body,
        elapsed: r.executionMs,
        ...(r.error ? { error: r.error } : {}),
      });
      // refresh logs
      const logRes = await fetch(
        `/api/admin/integration-tools/${tool.id}/logs?limit=10`,
      );
      const logJson = await logRes.json();
      if (logJson.status === "success") setLogs(logJson.data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="rv-itool-form">
      {error ? (
        <div className="rv-itool-alert is-error" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rv-itool-alert is-success" role="status">
          {success}
        </div>
      ) : null}

      {/* Section A: Basic Information */}
      <section className="rv-itool-section">
        <header className="rv-itool-section__head">
          <h2>
            <span className="lang-ar">المعلومات الأساسية</span>
            <span className="lang-en">Basic Information</span>
          </h2>
        </header>
        <div className="rv-itool-grid-2">
          <label className="rv-itool-field">
            <span className="rv-itool-field__label">
              <span className="lang-ar">اسم الأداة</span>
              <span className="lang-en">Tool Name</span>
              <em className="rv-itool-required">*</em>
            </span>
            <input
              type="text"
              value={state.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g., get_weather, send_email, check_inventory"
              className="rv-itool-input"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="rv-itool-field__hint">
              Use lowercase with underscores (snake_case)
            </span>
          </label>
          <label className="rv-itool-field rv-itool-field--full">
            <span className="rv-itool-field__label">
              <span className="lang-ar">الوصف</span>
              <span className="lang-en">Description</span>
              <em className="rv-itool-required">*</em>
            </span>
            <textarea
              value={state.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe what this tool does and when the agent should use it. Be specific."
              className="rv-itool-textarea"
              rows={3}
            />
            <span className="rv-itool-field__hint">
              The AI uses this to decide when to call your tool
            </span>
          </label>
        </div>
      </section>

      {/* Section B: Tool Type */}
      <section className="rv-itool-section">
        <header className="rv-itool-section__head">
          <h2>
            <span className="lang-ar">نوع الأداة</span>
            <span className="lang-en">Tool Type</span>
          </h2>
        </header>
        <div className="rv-itool-radio-cards">
          <label
            className={`rv-itool-radio-card ${state.type === "API_CALL" ? "is-active" : ""}`}
          >
            <input
              type="radio"
              name="type"
              checked={state.type === "API_CALL"}
              onChange={() => update("type", "API_CALL")}
            />
            <div>
              <strong>API Call</strong>
              <p>
                Make HTTP GET/POST requests to external APIs — fetch data,
                create records, trigger actions.
              </p>
            </div>
          </label>
          <label
            className={`rv-itool-radio-card ${state.type === "WEBHOOK" ? "is-active" : ""}`}
          >
            <input
              type="radio"
              name="type"
              checked={state.type === "WEBHOOK"}
              onChange={() => update("type", "WEBHOOK")}
            />
            <div>
              <strong>Webhook</strong>
              <p>
                POST data to any endpoint — n8n, Make, Zapier, or your own
                server.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Section C: Endpoint Configuration */}
      <section className="rv-itool-section">
        <header className="rv-itool-section__head">
          <h2>
            <span className="lang-ar">إعدادات الـ Endpoint</span>
            <span className="lang-en">Endpoint Configuration</span>
          </h2>
        </header>
        <div className="rv-itool-grid-2">
          <label className="rv-itool-field">
            <span className="rv-itool-field__label">
              <span className="lang-en">Method</span>
            </span>
            <select
              className="rv-itool-input"
              value={state.method}
              onChange={(e) => update("method", e.target.value as HttpMethod)}
            >
              {(["GET", "POST", "PUT", "PATCH", "DELETE"] as const).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="rv-itool-field">
            <span className="rv-itool-field__label">
              <span className="lang-en">Endpoint URL</span>
              <em className="rv-itool-required">*</em>
            </span>
            <input
              type="url"
              className="rv-itool-input"
              value={state.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://api.example.com/v1/resource"
              spellCheck={false}
            />
          </label>
        </div>

        <div className="rv-itool-subsection">
          <div className="rv-itool-subsection__head">
            <strong>
              <span className="lang-en">Headers</span>
              <span className="lang-ar">الترويسات</span>
            </strong>
            <button
              type="button"
              className="rv-itool-btn rv-itool-btn--neutral rv-itool-btn--small"
              onClick={addHeader}
            >
              + Add Header
            </button>
          </div>
          {state.headers.map((h, idx) => (
            <div key={idx} className="rv-itool-row">
              <input
                className="rv-itool-input"
                placeholder="Header name (e.g. Authorization)"
                value={h.key}
                onChange={(e) => setHeader(idx, { key: e.target.value })}
              />
              <input
                className="rv-itool-input"
                placeholder="Header value"
                value={h.value}
                onChange={(e) => setHeader(idx, { value: e.target.value })}
              />
              <button
                type="button"
                className="rv-itool-btn rv-itool-btn--danger rv-itool-btn--small"
                onClick={() => removeHeader(idx)}
                aria-label="Remove header"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="rv-itool-subsection">
          <div className="rv-itool-subsection__head">
            <strong>
              <span className="lang-en">Authentication</span>
              <span className="lang-ar">المصادقة</span>
            </strong>
          </div>
          <div className="rv-itool-radio-row">
            {(["NONE", "BEARER", "API_KEY", "BASIC"] as AuthType[]).map((a) => (
              <label
                key={a}
                className={`rv-itool-pill ${state.authType === a ? "is-active" : ""}`}
              >
                <input
                  type="radio"
                  name="authType"
                  checked={state.authType === a}
                  onChange={() => update("authType", a)}
                />
                {a === "NONE"
                  ? "None"
                  : a === "BEARER"
                    ? "Bearer Token"
                    : a === "API_KEY"
                      ? "API Key"
                      : "Basic Auth"}
              </label>
            ))}
          </div>
          {state.authType === "BEARER" ? (
            <input
              className="rv-itool-input"
              placeholder="sk_live_..."
              value={state.authConfig.token ?? ""}
              onChange={(e) =>
                update("authConfig", {
                  ...state.authConfig,
                  token: e.target.value,
                })
              }
              autoComplete="off"
              spellCheck={false}
            />
          ) : null}
          {state.authType === "API_KEY" ? (
            <div className="rv-itool-grid-2">
              <input
                className="rv-itool-input"
                placeholder="Header name (default: x-api-key)"
                value={state.authConfig.headerName ?? ""}
                onChange={(e) =>
                  update("authConfig", {
                    ...state.authConfig,
                    headerName: e.target.value,
                  })
                }
              />
              <input
                className="rv-itool-input"
                placeholder="API key value"
                value={state.authConfig.key ?? ""}
                onChange={(e) =>
                  update("authConfig", {
                    ...state.authConfig,
                    key: e.target.value,
                  })
                }
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          ) : null}
          {state.authType === "BASIC" ? (
            <div className="rv-itool-grid-2">
              <input
                className="rv-itool-input"
                placeholder="Username"
                value={state.authConfig.username ?? ""}
                onChange={(e) =>
                  update("authConfig", {
                    ...state.authConfig,
                    username: e.target.value,
                  })
                }
              />
              <input
                className="rv-itool-input"
                type="password"
                placeholder="Password"
                value={state.authConfig.password ?? ""}
                onChange={(e) =>
                  update("authConfig", {
                    ...state.authConfig,
                    password: e.target.value,
                  })
                }
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* Section D: Parameters */}
      <section className="rv-itool-section">
        <header className="rv-itool-section__head">
          <h2>
            <span className="lang-ar">المعاملات</span>
            <span className="lang-en">Parameters</span>{" "}
            <small>(Optional)</small>
          </h2>
          <button
            type="button"
            className="rv-itool-btn rv-itool-btn--neutral rv-itool-btn--small"
            onClick={addParameter}
          >
            + Add Parameter
          </button>
        </header>
        <p className="rv-itool-hint">
          What data should the AI extract and pass to your tool?
        </p>
        {state.parameters.length === 0 ? (
          <p className="rv-itool-empty-inline">
            <span className="lang-en">No parameters yet.</span>
            <span className="lang-ar">لا توجد معاملات بعد.</span>
          </p>
        ) : null}
        {state.parameters.map((p, idx) => (
          <div key={idx} className="rv-itool-param">
            <div className="rv-itool-param__grid">
              <label className="rv-itool-field">
                <span className="rv-itool-field__label">Name</span>
                <input
                  className="rv-itool-input"
                  value={p.name}
                  onChange={(e) => setParameter(idx, { name: e.target.value })}
                  placeholder="e.g. mobile"
                  spellCheck={false}
                />
              </label>
              <label className="rv-itool-field">
                <span className="rv-itool-field__label">Type</span>
                <select
                  className="rv-itool-input"
                  value={p.type}
                  onChange={(e) =>
                    setParameter(idx, { type: e.target.value as ParameterType })
                  }
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="date">date</option>
                  <option value="enum">enum</option>
                </select>
              </label>
              <label className="rv-itool-field rv-itool-field--check">
                <input
                  type="checkbox"
                  checked={p.required}
                  onChange={(e) =>
                    setParameter(idx, { required: e.target.checked })
                  }
                />
                Required
              </label>
              <button
                type="button"
                className="rv-itool-btn rv-itool-btn--danger rv-itool-btn--small"
                onClick={() => removeParameter(idx)}
                aria-label="Remove parameter"
              >
                ×
              </button>
            </div>
            <label className="rv-itool-field">
              <span className="rv-itool-field__label">Description</span>
              <input
                className="rv-itool-input"
                value={p.description ?? ""}
                onChange={(e) =>
                  setParameter(idx, { description: e.target.value })
                }
                placeholder="What this value means."
              />
            </label>
            <label className="rv-itool-field">
              <span className="rv-itool-field__label">Example</span>
              <input
                className="rv-itool-input"
                value={p.example ?? ""}
                onChange={(e) =>
                  setParameter(idx, { example: e.target.value })
                }
                placeholder="9665XXXXXXXX"
              />
            </label>
            {p.type === "enum" ? (
              <label className="rv-itool-field">
                <span className="rv-itool-field__label">
                  Options (comma separated)
                </span>
                <input
                  className="rv-itool-input"
                  value={(p.enumOptions ?? []).join(", ")}
                  onChange={(e) =>
                    setParameter(idx, {
                      enumOptions: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="confirmed, cancelled, no_reply"
                />
              </label>
            ) : null}
          </div>
        ))}
      </section>

      {/* Section E: Body Template */}
      {state.method !== "GET" && state.method !== "DELETE" ? (
        <section className="rv-itool-section">
          <header className="rv-itool-section__head">
            <h2>
              <span className="lang-ar">قالب الجسم</span>
              <span className="lang-en">Request Body Template</span>
            </h2>
          </header>
          <p className="rv-itool-hint">
            Use {`{{paramName}}`} placeholders to inject parameter values.
          </p>
          <textarea
            className="rv-itool-textarea rv-itool-textarea--code"
            rows={8}
            value={state.bodyTemplate}
            onChange={(e) => update("bodyTemplate", e.target.value)}
            placeholder={`{\n  "mobile": "{{mobile}}",\n  "doctor_id": "{{doctor_id}}",\n  "date": "{{date}}"\n}`}
            spellCheck={false}
          />
        </section>
      ) : null}

      {/* Section F: Response Mapping */}
      <section className="rv-itool-section">
        <header className="rv-itool-section__head">
          <h2>
            <span className="lang-ar">تخطيط الاستجابة</span>
            <span className="lang-en">Response Mapping</span>
          </h2>
        </header>
        <p className="rv-itool-hint">
          Use simple paths like <code>$.success</code>, <code>$.data</code>.
        </p>
        <div className="rv-itool-grid-3">
          <label className="rv-itool-field">
            <span className="rv-itool-field__label">success</span>
            <input
              className="rv-itool-input"
              value={state.responseMapping.success ?? ""}
              onChange={(e) =>
                update("responseMapping", {
                  ...state.responseMapping,
                  success: e.target.value,
                })
              }
              placeholder="$.success"
              spellCheck={false}
            />
          </label>
          <label className="rv-itool-field">
            <span className="rv-itool-field__label">message</span>
            <input
              className="rv-itool-input"
              value={state.responseMapping.message ?? ""}
              onChange={(e) =>
                update("responseMapping", {
                  ...state.responseMapping,
                  message: e.target.value,
                })
              }
              placeholder="$.message"
              spellCheck={false}
            />
          </label>
          <label className="rv-itool-field">
            <span className="rv-itool-field__label">data</span>
            <input
              className="rv-itool-input"
              value={state.responseMapping.data ?? ""}
              onChange={(e) =>
                update("responseMapping", {
                  ...state.responseMapping,
                  data: e.target.value,
                })
              }
              placeholder="$.data"
              spellCheck={false}
            />
          </label>
        </div>
      </section>

      {/* Section G: AI Instructions */}
      <section className="rv-itool-section">
        <header className="rv-itool-section__head">
          <h2>
            <span className="lang-ar">تعليمات الذكاء الاصطناعي</span>
            <span className="lang-en">AI Usage Instructions</span>
          </h2>
        </header>
        <textarea
          className="rv-itool-textarea"
          rows={4}
          value={state.aiInstructions}
          onChange={(e) => update("aiInstructions", e.target.value)}
          placeholder="When should the AI use this tool? Example: Use this tool when the caller asks to book an appointment after the patient has been identified and available slots have been checked."
        />
      </section>

      {/* Section: Status + timeout */}
      <section className="rv-itool-section">
        <header className="rv-itool-section__head">
          <h2>
            <span className="lang-ar">إعدادات إضافية</span>
            <span className="lang-en">Advanced</span>
          </h2>
        </header>
        <div className="rv-itool-grid-2">
          <label className="rv-itool-field">
            <span className="rv-itool-field__label">Timeout (ms)</span>
            <input
              type="number"
              min={1000}
              max={60000}
              step={500}
              className="rv-itool-input"
              value={state.timeoutMs}
              onChange={(e) =>
                update(
                  "timeoutMs",
                  Math.max(1000, Math.min(60000, Number(e.target.value) || 10000)),
                )
              }
            />
          </label>
          <label className="rv-itool-field rv-itool-field--check">
            <input
              type="checkbox"
              checked={state.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
            />
            <span>Active</span>
          </label>
        </div>
      </section>

      {/* Save bar */}
      <div className="rv-itool-savebar">
        <button
          type="button"
          className="rv-itool-btn rv-itool-btn--neutral"
          onClick={() =>
            router.push("/admin/integration-tools" as Route)
          }
          disabled={pending}
        >
          <span className="lang-ar">إلغاء</span>
          <span className="lang-en">Cancel</span>
        </button>
        <button
          type="button"
          className="rv-itool-btn rv-itool-btn--primary"
          onClick={save}
          disabled={pending}
        >
          {pending ? (
            <span className="lang-en">Saving…</span>
          ) : (
            <>
              <span className="lang-ar">حفظ</span>
              <span className="lang-en">Save</span>
            </>
          )}
        </button>
      </div>

      {/* Test panel (only after save) */}
      {tool?.id ? (
        <section className="rv-itool-section rv-itool-section--test">
          <header className="rv-itool-section__head">
            <h2>
              <span className="lang-ar">اختبار التكامل</span>
              <span className="lang-en">Test Integration</span>
            </h2>
            <button
              type="button"
              className="rv-itool-btn rv-itool-btn--primary"
              onClick={runTest}
            >
              Run Test
            </button>
          </header>
          {state.parameters.length > 0 ? (
            <div className="rv-itool-grid-2">
              {state.parameters.map((p) => (
                <label key={p.name} className="rv-itool-field">
                  <span className="rv-itool-field__label">
                    {p.name}
                    {p.required ? <em className="rv-itool-required">*</em> : null}
                  </span>
                  <input
                    className="rv-itool-input"
                    value={testParams[p.name] ?? ""}
                    onChange={(e) =>
                      setTestParams((prev) => ({
                        ...prev,
                        [p.name]: e.target.value,
                      }))
                    }
                    placeholder={p.example ?? ""}
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="rv-itool-hint">No parameters defined.</p>
          )}
          {testResult ? (
            <div
              className={`rv-itool-test-result ${testResult.success ? "is-ok" : "is-err"}`}
            >
              <p>
                <strong>
                  {testResult.success ? "Success" : "Error"} —{" "}
                  {testResult.message}
                </strong>
              </p>
              <p className="rv-itool-meta">
                HTTP: {testResult.httpStatus ?? "—"} · {testResult.elapsed} ms
              </p>
              <pre className="rv-itool-pre">
                {JSON.stringify(testResult.body, null, 2)}
              </pre>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Logs */}
      {tool?.id ? (
        <section className="rv-itool-section">
          <header className="rv-itool-section__head">
            <h2>
              <span className="lang-ar">السجلات</span>
              <span className="lang-en">Recent Logs</span>
            </h2>
          </header>
          {logs.length === 0 ? (
            <p className="rv-itool-hint">No logs yet.</p>
          ) : (
            <ul className="rv-itool-logs">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className={`rv-itool-log ${log.status === "ok" ? "is-ok" : "is-err"}`}
                >
                  <div className="rv-itool-log__head">
                    <span
                      className={`rv-itool-log__dot rv-itool-log__dot--${log.status === "ok" ? "ok" : "err"}`}
                      aria-hidden
                    />
                    <strong>{log.status === "ok" ? "OK" : "Error"}</strong>
                    <span className="rv-itool-meta">
                      HTTP {log.httpStatus ?? "—"} · {log.executionMs} ms ·{" "}
                      {new Date(log.createdAt).toLocaleString("en-GB", {
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {log.error ? (
                    <p className="rv-itool-log__err">{log.error}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
