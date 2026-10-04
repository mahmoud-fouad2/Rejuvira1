export type LeadSaveResponse = {
  ok?: boolean;
  status?: string;
  duplicate?: boolean;
  saved?: boolean;
  requestId?: string;
};

export function isConfirmedSavedLead(
  responseOk: boolean,
  data: LeadSaveResponse | null,
) {
  return Boolean(
    responseOk &&
      data?.ok === true &&
      data.status === "success" &&
      data.duplicate !== true &&
      data.saved === true &&
      typeof data.requestId === "string" &&
      data.requestId.trim().length > 0,
  );
}
