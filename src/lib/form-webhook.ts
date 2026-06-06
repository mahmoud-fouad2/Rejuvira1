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

type DispatchJsonWebhookInput = {
  url: string;
  secret?: string | null | undefined;
  payload: Record<string, unknown>;
  failureMessage: string;
  timeoutMs?: number;
  logMeta?: Record<string, unknown>;
};

export async function dispatchJsonWebhook({
  url,
  secret,
  payload,
  failureMessage,
  timeoutMs = 3500,
  logMeta = {},
}: DispatchJsonWebhookInput) {
  const webhookUrl = url.trim();
  if (!webhookUrl) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(secret?.trim()
          ? {
              "x-rejuvera-webhook-secret": secret.trim(),
              "x-rejuvira-webhook-secret": secret.trim(),
            }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      await recordAppLog({
        level: "warn",
        kind: "webhook",
        message: failureMessage,
        meta: {
          httpStatus: response.status,
          source: payload.source,
          ...logMeta,
        },
      });
    }
  } catch (error) {
    await recordAppLog({
      level: "warn",
      kind: "webhook",
      message: failureMessage,
      meta: {
        error: error instanceof Error ? error.message : "unknown",
        source: payload.source,
        ...logMeta,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function dispatchFormWebhook({
  settings,
  payload,
  failureMessage,
  timeoutMs = 3500,
}: DispatchFormWebhookInput) {
  if (!settings.integrations.formWebhookEnabled) return;
  await dispatchJsonWebhook({
    url: settings.integrations.formWebhookUrl,
    secret: settings.integrations.formWebhookSecret,
    payload,
    failureMessage,
    timeoutMs,
    logMeta: { webhookScope: "global-form" },
  });
}
