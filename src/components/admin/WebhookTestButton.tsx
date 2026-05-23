"use client";

import { useState } from "react";

type TestState =
  | { status: "idle"; message: string }
  | { status: "success"; message: string; response: string }
  | { status: "error"; message: string; response: string };

export function WebhookTestButton({
  token,
  serviceLabel,
}: {
  token: string;
  serviceLabel?: string | null | undefined;
}) {
  const [state, setState] = useState<TestState>({
    status: "idle",
    message: "",
  });
  const [isPending, setIsPending] = useState(false);

  async function testWebhook() {
    if (isPending) return;
    setIsPending(true);
    setState({ status: "idle", message: "" });
    try {
      const response = await fetch(`/api/webhooks/${token}?dryRun=1`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-requested-with": "fetch",
        },
        body: JSON.stringify({
          testMode: true,
          fullName: "Webhook Test",
          phone: "0500000000",
          email: "test@example.com",
          message: "Test request from admin panel",
          serviceName: serviceLabel || "General inquiry",
          source: "Admin webhook test",
          submittedAt: new Date().toISOString(),
        }),
      });
      const text = await response.text();
      setState({
        status: response.ok ? "success" : "error",
        message: response.ok ? "Success" : "Failed",
        response: text.slice(0, 900),
      });
    } catch (error) {
      setState({
        status: "error",
        message: "Failed",
        response: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        className="admin-btn-secondary w-fit"
        onClick={testWebhook}
        disabled={isPending}
      >
        {isPending ? "Testing..." : "Test Webhook"}
      </button>
      {state.status !== "idle" ? (
        <div
          className={`rounded-xl border p-3 text-xs ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <strong>{state.message}</strong>
          <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap">
            {state.response}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
