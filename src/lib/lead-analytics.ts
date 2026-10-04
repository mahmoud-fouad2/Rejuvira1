export function buildLeadDataLayerEvent(requestId: string, formType?: string) {
  return {
    event: "lead_submit",
    request_id: requestId,
    form_name: formType || "lead",
  } as const;
}

export function buildContactClickDataLayerEvent(
  kind: "phone" | "whatsapp",
  eventId: string,
) {
  return {
    event: kind === "phone" ? "phone_click" : "whatsapp_click",
    event_id: eventId,
  } as const;
}
