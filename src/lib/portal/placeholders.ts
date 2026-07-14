/**
 * Instruction-template placeholder substitution. Templates and per-patient
 * instruction copies may contain {{variables}} that are resolved at render
 * time (portal pages and PDF generation).
 */

export type PlaceholderContext = {
  patientName?: string | null | undefined;
  fileNumber?: string | null | undefined;
  procedureName?: string | null | undefined;
  procedureDate?: string | null | undefined;
  procedureTime?: string | null | undefined;
  doctorName?: string | null | undefined;
  arrivalTime?: string | null | undefined;
  followUpDate?: string | null | undefined;
  clinicPhone?: string | null | undefined;
  additionalNotes?: string | null | undefined;
};

const KEY_MAP: Record<string, keyof PlaceholderContext> = {
  patient_name: "patientName",
  file_number: "fileNumber",
  procedure_name: "procedureName",
  procedure_date: "procedureDate",
  procedure_time: "procedureTime",
  doctor_name: "doctorName",
  arrival_time: "arrivalTime",
  follow_up_date: "followUpDate",
  clinic_phone: "clinicPhone",
  additional_notes: "additionalNotes",
};

export function renderPlaceholders(
  text: string | null | undefined,
  context: PlaceholderContext,
): string {
  if (!text) return "";
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, rawKey: string) => {
    const key = KEY_MAP[rawKey];
    if (!key) return match;
    const value = context[key];
    return value ? String(value) : "—";
  });
}
