import { NotificationChannel, NotificationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getPortalSettings } from "@/lib/portal/settings";

/**
 * Patient notification queue. This ONLY enqueues in-app notifications with
 * status PENDING — it never sends real SMS/WhatsApp/email. Wiring an actual
 * provider is a deliberate future step gated behind admin configuration, so
 * no messages leave the system until that is set up and approved.
 *
 * Security: notification titles/bodies must not contain sensitive medical
 * detail beyond a generic "there is an update" message for external
 * channels. In-app entries may reference the procedure by name since they
 * are only visible after the patient authenticates.
 */

export type PortalNotificationEvent =
  | "account_activation"
  | "activation_resent"
  | "instructions_published"
  | "instructions_updated"
  | "procedure_reminder"
  | "followup_reminder"
  | "message_reply"
  | "feedback_request";

type EnqueueInput = {
  patientId: string;
  procedureId?: string | null;
  event: PortalNotificationEvent;
  title: string;
  body: string;
  scheduledFor?: Date | null;
  channel?: NotificationChannel;
};

export async function enqueuePortalNotification(input: EnqueueInput) {
  const settings = await getPortalSettings();
  if (!settings.notificationsEnabled) return null;
  try {
    return await prisma.patientNotification.create({
      data: {
        patientId: input.patientId,
        procedureId: input.procedureId ?? null,
        event: input.event,
        channel: input.channel ?? NotificationChannel.IN_APP,
        title: input.title,
        body: input.body,
        status: NotificationStatus.PENDING,
        scheduledFor: input.scheduledFor ?? null,
      },
    });
  } catch (error) {
    console.warn(
      "[portal-notifications] enqueue failed",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
