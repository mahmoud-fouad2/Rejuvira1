import { UserRole } from "@prisma/client";

/**
 * Capability map for the patient-portal admin area. Route-level access is
 * enforced by `permissionMatrix` in `admin-permissions.ts`; these fine-
 * grained checks gate what a role can DO inside those routes and must be
 * re-checked inside every server action / API route (never UI-only).
 */

const ALL_PORTAL_ROLES: readonly UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MEDICAL_DIRECTOR,
  UserRole.DOCTOR,
  UserRole.NURSE,
  UserRole.COORDINATOR,
  UserRole.RECEPTIONIST,
  UserRole.AUDITOR,
];

export type PortalCapability =
  | "patients.view"
  | "patients.viewFullPhone"
  | "patients.create"
  | "patients.edit"
  | "patients.archive"
  | "patients.import"
  | "patients.viewInternalNotes"
  | "patients.sendActivation"
  | "procedures.view"
  | "procedures.create"
  | "procedures.edit"
  | "procedures.editInstructions"
  | "procedures.publishInstructions"
  | "procedures.viewStaffNotes"
  | "templates.view"
  | "templates.edit"
  | "templates.approve"
  | "followUps.view"
  | "followUps.manage"
  | "messages.view"
  | "messages.reply"
  | "feedback.view"
  | "feedback.manage"
  | "documents.view"
  | "documents.upload"
  | "documents.download"
  | "stats.view"
  | "stats.export"
  | "audit.view"
  | "settings.manage"
  | "pdf.print";

const CAPABILITIES: Record<PortalCapability, readonly UserRole[]> = {
  "patients.view": ALL_PORTAL_ROLES,
  "patients.viewFullPhone": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.COORDINATOR,
    UserRole.RECEPTIONIST,
  ],
  "patients.create": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.COORDINATOR,
  ],
  "patients.edit": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COORDINATOR],
  "patients.archive": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "patients.import": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COORDINATOR],
  "patients.viewInternalNotes": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
    UserRole.NURSE,
  ],
  "patients.sendActivation": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.COORDINATOR,
  ],
  "procedures.view": ALL_PORTAL_ROLES,
  "procedures.create": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.COORDINATOR,
    UserRole.DOCTOR,
  ],
  "procedures.edit": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.COORDINATOR,
    UserRole.DOCTOR,
  ],
  "procedures.editInstructions": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
  ],
  "procedures.publishInstructions": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
  ],
  "procedures.viewStaffNotes": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
    UserRole.NURSE,
  ],
  "templates.view": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.COORDINATOR,
    UserRole.AUDITOR,
  ],
  "templates.edit": [
    UserRole.SUPER_ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
  ],
  "templates.approve": [UserRole.SUPER_ADMIN, UserRole.MEDICAL_DIRECTOR],
  "followUps.view": ALL_PORTAL_ROLES,
  "followUps.manage": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.COORDINATOR,
    UserRole.NURSE,
    UserRole.DOCTOR,
  ],
  "messages.view": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.COORDINATOR,
  ],
  "messages.reply": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.COORDINATOR,
  ],
  "feedback.view": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.AUDITOR,
  ],
  "feedback.manage": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "documents.view": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.COORDINATOR,
  ],
  "documents.upload": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.COORDINATOR,
  ],
  "documents.download": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.COORDINATOR,
  ],
  "stats.view": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.AUDITOR,
  ],
  "stats.export": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "audit.view": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUDITOR],
  "settings.manage": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  "pdf.print": [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.COORDINATOR,
  ],
};

export function hasPortalCapability(
  role: UserRole | undefined,
  capability: PortalCapability,
): boolean {
  if (!role) return false;
  return CAPABILITIES[capability].includes(role);
}

/** Throwable guard for server actions and API routes. */
export function assertPortalCapability(
  role: UserRole | undefined,
  capability: PortalCapability,
): void {
  if (!hasPortalCapability(role, capability)) {
    throw new Error("FORBIDDEN");
  }
}

/** Mask a phone number for roles without full-phone access: 05xx•••xx89 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "•••";
  return `${digits.slice(0, 4)}•••${digits.slice(-2)}`;
}

export function displayPhone(
  phone: string,
  role: UserRole | undefined,
): string {
  return hasPortalCapability(role, "patients.viewFullPhone")
    ? phone
    : maskPhone(phone);
}
