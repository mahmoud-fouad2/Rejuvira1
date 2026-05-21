import { recordAppLog } from "@/lib/app-log";

type FormWebhookSettings = {
  integrations: {
    formWebhookEnabled: boolean;
    formWebhookUrl: string;
    formWebhookSecret: string;
  };
};

type DispatchFormWebhookInput = {
  settings: FormWebhookSettings;
  payload: Record<string, unknown>;
  failureMessage: string;
  timeoutMs?: number;
};

export async function dispatchFormWebhook({
  settings,
  payload,
  failureMessage,
  timeoutMs = 3500,
}: DispatchFormWebhookInput) {
  if (!settings.integrations.formWebhookEnabled) return;
  if (!settings.integrations.formWebhookUrl.trim()) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(settings.integrations.formWebhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(settings.integrations.formWebhookSecret
          ? {
              "x-rejuvera-webhook-secret":
                settings.integrations.formWebhookSecret,
              "x-rejuvira-webhook-secret":
                settings.integrations.formWebhookSecret,
            }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    await recordAppLog({
      level: "warn",
      kind: "webhook",
      message: failureMessage,
      meta: {
        error: error instanceof Error ? error.message : "unknown",
        source: payload.source,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}
