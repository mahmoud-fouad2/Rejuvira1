import {
  AppointmentStatus,
  ChecklistPhase,
  MessageSenderType,
  MessageStatus,
  PatientAccountStatus,
  PatientGender,
  Prisma,
  ProcedureStatus,
  TemplateStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { normalizeSaudiMobileNumber } from "@/lib/saudi-phone";

/**
 * Patient-portal data access layer. All list queries paginate on the
 * server; callers never load the full table. Access control lives in the
 * server actions / routes calling into this module.
 */

// ------------------------------------------------------------------
// File numbers
// ------------------------------------------------------------------

const FILE_NUMBER_PREFIX = "RJ";

/** Next sequential file number, e.g. RJ-2026-00042. */
export async function generateFileNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${FILE_NUMBER_PREFIX}-${year}-`;
  const latest = await prisma.patient.findFirst({
    where: { fileNumber: { startsWith: prefix } },
    orderBy: { fileNumber: "desc" },
    select: { fileNumber: true },
  });
  const lastSeq = latest
    ? Number.parseInt(latest.fileNumber.slice(prefix.length), 10)
    : 0;
  const next = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}

// ------------------------------------------------------------------
// Patients
// ------------------------------------------------------------------

export type PatientListFilters = {
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
  accountStatus?: PatientAccountStatus | "ALL" | undefined;
  procedureStatus?: ProcedureStatus | "ALL" | undefined;
  doctorId?: string | undefined;
  category?: string | undefined;
  hasUnreadMessages?: boolean | undefined;
  includeArchived?: boolean | undefined;
  from?: string | undefined;
  to?: string | undefined;
};

export type PatientListItem = {
  id: string;
  fileNumber: string;
  fullNameAr: string;
  phone: string;
  accountStatus: PatientAccountStatus;
  archivedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  activatedAt: Date | null;
  latestProcedure: {
    id: string;
    name: string;
    status: ProcedureStatus;
    procedureDate: Date | null;
    doctorName: string | null;
  } | null;
  nextAppointment: Date | null;
  unreadMessages: number;
};

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

export async function listPatients(filters: PatientListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(5, filters.pageSize ?? PAGE_SIZE_DEFAULT),
  );

  const where: Prisma.PatientWhereInput = {};

  if (!filters.includeArchived) {
    where.archivedAt = null;
  }
  if (filters.accountStatus && filters.accountStatus !== "ALL") {
    where.accountStatus = filters.accountStatus;
  }
  if (filters.search?.trim()) {
    const term = filters.search.trim();
    const phoneDigits = term.replace(/\D/g, "");
    where.OR = [
      { fullNameAr: { contains: term, mode: "insensitive" } },
      { fullNameEn: { contains: term, mode: "insensitive" } },
      { fileNumber: { contains: term, mode: "insensitive" } },
      ...(phoneDigits.length >= 4
        ? [{ phone: { contains: phoneDigits } }]
        : []),
    ];
  }
  if (filters.from) {
    where.createdAt = { ...(where.createdAt as object), gte: new Date(filters.from) };
  }
  if (filters.to) {
    where.createdAt = {
      ...(where.createdAt as object),
      lte: new Date(`${filters.to}T23:59:59+03:00`),
    };
  }

  const procedureFilter: Prisma.ProcedureWhereInput = { archivedAt: null };
  if (filters.procedureStatus && filters.procedureStatus !== "ALL") {
    procedureFilter.status = filters.procedureStatus;
  }
  if (filters.doctorId && filters.doctorId !== "ALL") {
    procedureFilter.doctorId = filters.doctorId;
  }
  if (filters.category && filters.category !== "ALL") {
    procedureFilter.category = filters.category;
  }
  if (
    (filters.procedureStatus && filters.procedureStatus !== "ALL") ||
    (filters.doctorId && filters.doctorId !== "ALL") ||
    (filters.category && filters.category !== "ALL")
  ) {
    where.procedures = { some: procedureFilter };
  }
  if (filters.hasUnreadMessages) {
    where.messages = {
      some: { status: MessageStatus.UNREAD, senderType: MessageSenderType.PATIENT },
    };
  }

  const [total, rows] = await prisma.$transaction([
    prisma.patient.count({ where }),
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        fileNumber: true,
        fullNameAr: true,
        phone: true,
        accountStatus: true,
        archivedAt: true,
        lastLoginAt: true,
        createdAt: true,
        account: { select: { activatedAt: true } },
        procedures: {
          where: { archivedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            customProcedureName: true,
            status: true,
            procedureDate: true,
            doctor: { select: { nameAr: true } },
            surgeonName: true,
            template: { select: { nameAr: true } },
          },
        },
        appointments: {
          where: {
            status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
            appointmentDate: { gte: new Date() },
          },
          orderBy: { appointmentDate: "asc" },
          take: 1,
          select: { appointmentDate: true },
        },
        _count: {
          select: {
            messages: {
              where: {
                status: MessageStatus.UNREAD,
                senderType: MessageSenderType.PATIENT,
              },
            },
          },
        },
      },
    }),
  ]);

  const items: PatientListItem[] = rows.map((row) => {
    const proc = row.procedures[0];
    return {
      id: row.id,
      fileNumber: row.fileNumber,
      fullNameAr: row.fullNameAr,
      phone: row.phone,
      accountStatus: row.accountStatus,
      archivedAt: row.archivedAt,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
      activatedAt: row.account?.activatedAt ?? null,
      latestProcedure: proc
        ? {
            id: proc.id,
            name:
              proc.customProcedureName ||
              proc.template?.nameAr ||
              "إجراء غير مسمى",
            status: proc.status,
            procedureDate: proc.procedureDate,
            doctorName: proc.doctor?.nameAr || proc.surgeonName || null,
          }
        : null,
      nextAppointment: row.appointments[0]?.appointmentDate ?? null,
      unreadMessages: row._count.messages,
    };
  });

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type CreatePatientInput = {
  fileNumber?: string | undefined;
  fullNameAr: string;
  fullNameEn?: string | undefined;
  phone: string;
  email?: string | undefined;
  dateOfBirth?: Date | undefined;
  gender?: PatientGender | undefined;
  emergencyContactName?: string | undefined;
  emergencyContactPhone?: string | undefined;
  preferredLanguage?: string | undefined;
  internalNotes?: string | undefined;
  createdById?: string | undefined;
  createdByName?: string | undefined;
};

export type PatientDuplicateCheck = {
  fileNumberTaken: boolean;
  phoneMatches: { id: string; fileNumber: string; fullNameAr: string }[];
};

export async function checkPatientDuplicates(
  phone: string,
  fileNumber?: string,
  excludePatientId?: string,
): Promise<PatientDuplicateCheck> {
  const normalizedPhone = normalizeSaudiMobileNumber(phone);
  const [byFile, byPhone] = await Promise.all([
    fileNumber
      ? prisma.patient.findUnique({
          where: { fileNumber },
          select: { id: true },
        })
      : Promise.resolve(null),
    prisma.patient.findMany({
      where: {
        phone: normalizedPhone,
        ...(excludePatientId ? { id: { not: excludePatientId } } : {}),
      },
      select: { id: true, fileNumber: true, fullNameAr: true },
      take: 5,
    }),
  ]);
  return {
    fileNumberTaken: Boolean(
      byFile && (!excludePatientId || byFile.id !== excludePatientId),
    ),
    phoneMatches: byPhone,
  };
}

export async function createPatient(input: CreatePatientInput) {
  const normalizedPhone = normalizeSaudiMobileNumber(input.phone);
  const fileNumber = input.fileNumber?.trim() || (await generateFileNumber());

  return prisma.$transaction(async (tx) => {
    const existing = await tx.patient.findUnique({
      where: { fileNumber },
      select: { id: true },
    });
    if (existing) {
      throw new Error("FILE_NUMBER_TAKEN");
    }
    const patient = await tx.patient.create({
      data: {
        fileNumber,
        fullNameAr: input.fullNameAr.trim(),
        fullNameEn: input.fullNameEn?.trim() || null,
        phone: normalizedPhone,
        email: input.email?.trim() || null,
        dateOfBirth: input.dateOfBirth ?? null,
        gender: input.gender ?? null,
        emergencyContactName: input.emergencyContactName?.trim() || null,
        emergencyContactPhone: input.emergencyContactPhone?.trim() || null,
        preferredLanguage: input.preferredLanguage === "en" ? "en" : "ar",
        internalNotes: input.internalNotes?.trim() || null,
        accountStatus: PatientAccountStatus.PENDING,
        createdById: input.createdById ?? null,
        createdByName: input.createdByName ?? null,
        account: {
          create: {
            loginIdentifier: normalizedPhone,
          },
        },
      },
      include: { account: true },
    });
    return patient;
  });
}

export type UpdatePatientInput = Partial<
  Omit<CreatePatientInput, "createdById" | "createdByName" | "fileNumber">
> & {
  accountStatus?: PatientAccountStatus;
};

export async function updatePatient(id: string, input: UpdatePatientInput) {
  const data: Prisma.PatientUpdateInput = {};
  if (input.fullNameAr !== undefined) data.fullNameAr = input.fullNameAr.trim();
  if (input.fullNameEn !== undefined)
    data.fullNameEn = input.fullNameEn?.trim() || null;
  if (input.phone !== undefined) {
    data.phone = normalizeSaudiMobileNumber(input.phone);
  }
  if (input.email !== undefined) data.email = input.email?.trim() || null;
  if (input.dateOfBirth !== undefined) data.dateOfBirth = input.dateOfBirth;
  if (input.gender !== undefined) data.gender = input.gender;
  if (input.emergencyContactName !== undefined)
    data.emergencyContactName = input.emergencyContactName?.trim() || null;
  if (input.emergencyContactPhone !== undefined)
    data.emergencyContactPhone = input.emergencyContactPhone?.trim() || null;
  if (input.preferredLanguage !== undefined)
    data.preferredLanguage = input.preferredLanguage === "en" ? "en" : "ar";
  if (input.internalNotes !== undefined)
    data.internalNotes = input.internalNotes?.trim() || null;
  if (input.accountStatus !== undefined)
    data.accountStatus = input.accountStatus;

  return prisma.patient.update({ where: { id }, data });
}

export async function archivePatient(
  id: string,
  by: { id?: string; name?: string },
) {
  return prisma.patient.update({
    where: { id },
    data: {
      archivedAt: new Date(),
      archivedById: by.id ?? null,
      archivedByName: by.name ?? null,
      accountStatus: PatientAccountStatus.ARCHIVED,
    },
  });
}

export async function restorePatient(id: string) {
  return prisma.patient.update({
    where: { id },
    data: {
      archivedAt: null,
      archivedById: null,
      archivedByName: null,
      accountStatus: PatientAccountStatus.PENDING,
    },
  });
}

export async function getPatientFile(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      account: true,
      procedures: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          template: { select: { id: true, nameAr: true, version: true } },
          doctor: { select: { id: true, nameAr: true } },
          appointments: { orderBy: { appointmentDate: "asc" } },
          checklistItems: { orderBy: [{ phase: "asc" }, { sortOrder: "asc" }] },
          feedback: true,
        },
      },
      appointments: {
        orderBy: { appointmentDate: "desc" },
        take: 50,
        include: { doctor: { select: { nameAr: true } } },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 100 },
      documents: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
      },
      feedback: { orderBy: { submittedAt: "desc" } },
    },
  });
}

// ------------------------------------------------------------------
// Procedure templates
// ------------------------------------------------------------------

export async function listTemplates(options?: {
  status?: TemplateStatus | "ALL" | undefined;
  category?: string | undefined;
  includeArchived?: boolean | undefined;
}) {
  const where: Prisma.ProcedureTemplateWhereInput = {};
  if (options?.status && options.status !== "ALL") {
    where.status = options.status;
  } else if (!options?.includeArchived) {
    where.status = { not: TemplateStatus.ARCHIVED };
  }
  if (options?.category && options.category !== "ALL") {
    where.category = options.category;
  }
  return prisma.procedureTemplate.findMany({
    where,
    orderBy: [{ category: "asc" }, { nameAr: "asc" }, { version: "desc" }],
  });
}

export async function getTemplate(id: string) {
  return prisma.procedureTemplate.findUnique({ where: { id } });
}

export type TemplateContentInput = {
  nameAr: string;
  nameEn?: string | undefined;
  category: string;
  preOperationContentAr?: string | undefined;
  preOperationContentEn?: string | undefined;
  operationDayContentAr?: string | undefined;
  operationDayContentEn?: string | undefined;
  postOperationContentAr?: string | undefined;
  postOperationContentEn?: string | undefined;
  warningSignsAr?: string | undefined;
  warningSignsEn?: string | undefined;
  followUpContentAr?: string | undefined;
  followUpContentEn?: string | undefined;
  checklistJson?: unknown | undefined;
};

export async function createTemplate(
  input: TemplateContentInput,
  by: { id?: string; name?: string },
) {
  return prisma.procedureTemplate.create({
    data: {
      ...normalizeTemplateContent(input),
      status: TemplateStatus.DRAFT,
      version: 1,
      createdById: by.id ?? null,
      createdByName: by.name ?? null,
    },
  });
}

function normalizeTemplateContent(input: TemplateContentInput) {
  return {
    nameAr: input.nameAr.trim(),
    nameEn: input.nameEn?.trim() || null,
    category: input.category.trim(),
    preOperationContentAr: input.preOperationContentAr?.trim() || null,
    preOperationContentEn: input.preOperationContentEn?.trim() || null,
    operationDayContentAr: input.operationDayContentAr?.trim() || null,
    operationDayContentEn: input.operationDayContentEn?.trim() || null,
    postOperationContentAr: input.postOperationContentAr?.trim() || null,
    postOperationContentEn: input.postOperationContentEn?.trim() || null,
    warningSignsAr: input.warningSignsAr?.trim() || null,
    warningSignsEn: input.warningSignsEn?.trim() || null,
    followUpContentAr: input.followUpContentAr?.trim() || null,
    followUpContentEn: input.followUpContentEn?.trim() || null,
    ...(input.checklistJson !== undefined
      ? { checklistJson: input.checklistJson as Prisma.InputJsonValue }
      : {}),
  };
}

/**
 * Editing an approved template never mutates it silently: a new DRAFT
 * version is created and linked via parentTemplateId. Draft templates are
 * edited in place.
 */
export async function updateTemplate(
  id: string,
  input: TemplateContentInput,
  by: { id?: string; name?: string },
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.procedureTemplate.findUniqueOrThrow({
      where: { id },
    });
    if (current.status === TemplateStatus.DRAFT) {
      return tx.procedureTemplate.update({
        where: { id },
        data: normalizeTemplateContent(input),
      });
    }
    return tx.procedureTemplate.create({
      data: {
        ...normalizeTemplateContent(input),
        status: TemplateStatus.DRAFT,
        version: current.version + 1,
        parentTemplateId: current.parentTemplateId ?? current.id,
        createdById: by.id ?? null,
        createdByName: by.name ?? null,
      },
    });
  });
}

export async function approveTemplate(
  id: string,
  by: { id?: string; name?: string },
) {
  return prisma.$transaction(async (tx) => {
    const template = await tx.procedureTemplate.findUniqueOrThrow({
      where: { id },
    });
    if (template.status !== TemplateStatus.DRAFT) {
      throw new Error("TEMPLATE_NOT_DRAFT");
    }
    // Archive previously approved versions of the same template family.
    const familyId = template.parentTemplateId ?? template.id;
    await tx.procedureTemplate.updateMany({
      where: {
        status: TemplateStatus.MEDICALLY_APPROVED,
        OR: [{ id: familyId }, { parentTemplateId: familyId }],
      },
      data: { status: TemplateStatus.ARCHIVED },
    });
    return tx.procedureTemplate.update({
      where: { id },
      data: {
        status: TemplateStatus.MEDICALLY_APPROVED,
        approvedById: by.id ?? null,
        approvedByName: by.name ?? null,
        approvedAt: new Date(),
      },
    });
  });
}

export async function archiveTemplate(id: string) {
  return prisma.procedureTemplate.update({
    where: { id },
    data: { status: TemplateStatus.ARCHIVED },
  });
}

// ------------------------------------------------------------------
// Procedures
// ------------------------------------------------------------------

export type CreateProcedureInput = {
  patientId: string;
  procedureTemplateId?: string | undefined;
  customProcedureName?: string | undefined;
  category?: string | undefined;
  doctorId?: string | undefined;
  surgeonName?: string | undefined;
  procedureDate?: Date | undefined;
  procedureTime?: string | undefined;
  arrivalTime?: string | undefined;
  location?: string | undefined;
  status?: ProcedureStatus | undefined;
  patientVisibleNotes?: string | undefined;
  privateStaffNotes?: string | undefined;
  createdById?: string | undefined;
  createdByName?: string | undefined;
};

type ChecklistSeedItem = {
  title: string;
  description?: string;
  phase: ChecklistPhase;
  isRequired?: boolean;
};

function parseChecklistSeed(json: unknown): ChecklistSeedItem[] {
  if (!Array.isArray(json)) return [];
  const validPhases = new Set(Object.values(ChecklistPhase));
  return json.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const phase =
      typeof record.phase === "string" &&
      validPhases.has(record.phase as ChecklistPhase)
        ? (record.phase as ChecklistPhase)
        : null;
    if (!title || !phase) return [];
    return [
      {
        title,
        phase,
        ...(typeof record.description === "string"
          ? { description: record.description }
          : {}),
        isRequired: record.isRequired === true,
      },
    ];
  });
}

/**
 * Creating a procedure snapshots the approved template content into the
 * procedure record, so later template edits never change what a patient
 * was already given.
 */
export async function createProcedure(input: CreateProcedureInput) {
  return prisma.$transaction(async (tx) => {
    let instructionFields: Prisma.ProcedureCreateInput extends never
      ? never
      : Partial<{
          preOperationInstructions: string | null;
          operationDayInstructions: string | null;
          postOperationInstructions: string | null;
          warningSigns: string | null;
          followUpInstructions: string | null;
        }> = {};
    let templateVersion: number | null = null;
    let category = input.category?.trim() || null;
    let checklistSeed: ChecklistSeedItem[] = [];

    if (input.procedureTemplateId) {
      const template = await tx.procedureTemplate.findUniqueOrThrow({
        where: { id: input.procedureTemplateId },
      });
      if (template.status !== TemplateStatus.MEDICALLY_APPROVED) {
        throw new Error("TEMPLATE_NOT_APPROVED");
      }
      templateVersion = template.version;
      category = category ?? template.category;
      instructionFields = {
        preOperationInstructions: template.preOperationContentAr,
        operationDayInstructions: template.operationDayContentAr,
        postOperationInstructions: template.postOperationContentAr,
        warningSigns: template.warningSignsAr,
        followUpInstructions: template.followUpContentAr,
      };
      checklistSeed = parseChecklistSeed(template.checklistJson);
    }

    const procedure = await tx.procedure.create({
      data: {
        patient: { connect: { id: input.patientId } },
        ...(input.procedureTemplateId
          ? { template: { connect: { id: input.procedureTemplateId } } }
          : {}),
        templateVersion,
        customProcedureName: input.customProcedureName?.trim() || null,
        category,
        ...(input.doctorId
          ? { doctor: { connect: { id: input.doctorId } } }
          : {}),
        surgeonName: input.surgeonName?.trim() || null,
        procedureDate: input.procedureDate ?? null,
        procedureTime: input.procedureTime?.trim() || null,
        arrivalTime: input.arrivalTime?.trim() || null,
        location: input.location?.trim() || null,
        status: input.status ?? ProcedureStatus.DRAFT,
        patientVisibleNotes: input.patientVisibleNotes?.trim() || null,
        privateStaffNotes: input.privateStaffNotes?.trim() || null,
        createdById: input.createdById ?? null,
        createdByName: input.createdByName ?? null,
        ...instructionFields,
      },
    });

    if (checklistSeed.length) {
      await tx.procedureChecklistItem.createMany({
        data: checklistSeed.map((item, index) => ({
          procedureId: procedure.id,
          patientId: input.patientId,
          title: item.title,
          description: item.description ?? null,
          phase: item.phase,
          sortOrder: index,
          isRequired: item.isRequired ?? false,
        })),
      });
    }

    return procedure;
  });
}

export type UpdateProcedureInput = Partial<
  Omit<CreateProcedureInput, "patientId" | "createdById" | "createdByName">
> & {
  preOperationInstructions?: string | undefined;
  operationDayInstructions?: string | undefined;
  postOperationInstructions?: string | undefined;
  warningSigns?: string | undefined;
  followUpInstructions?: string | undefined;
  updatedById?: string | undefined;
  updatedByName?: string | undefined;
};

const INSTRUCTION_KEYS = [
  "preOperationInstructions",
  "operationDayInstructions",
  "postOperationInstructions",
  "warningSigns",
  "followUpInstructions",
] as const;

export async function updateProcedure(id: string, input: UpdateProcedureInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.procedure.findUniqueOrThrow({ where: { id } });

    const data: Prisma.ProcedureUpdateInput = {
      updatedById: input.updatedById ?? null,
      updatedByName: input.updatedByName ?? null,
    };
    if (input.customProcedureName !== undefined)
      data.customProcedureName = input.customProcedureName?.trim() || null;
    if (input.category !== undefined)
      data.category = input.category?.trim() || null;
    if (input.doctorId !== undefined) {
      data.doctor = input.doctorId
        ? { connect: { id: input.doctorId } }
        : { disconnect: true };
    }
    if (input.surgeonName !== undefined)
      data.surgeonName = input.surgeonName?.trim() || null;
    if (input.procedureDate !== undefined)
      data.procedureDate = input.procedureDate ?? null;
    if (input.procedureTime !== undefined)
      data.procedureTime = input.procedureTime?.trim() || null;
    if (input.arrivalTime !== undefined)
      data.arrivalTime = input.arrivalTime?.trim() || null;
    if (input.location !== undefined)
      data.location = input.location?.trim() || null;
    if (input.status !== undefined) data.status = input.status;
    if (input.patientVisibleNotes !== undefined)
      data.patientVisibleNotes = input.patientVisibleNotes?.trim() || null;
    if (input.privateStaffNotes !== undefined)
      data.privateStaffNotes = input.privateStaffNotes?.trim() || null;

    // Instruction edits after publication bump the version so patients are
    // asked to re-read and re-acknowledge.
    let instructionsChanged = false;
    for (const key of INSTRUCTION_KEYS) {
      const value = input[key];
      if (value !== undefined && (value?.trim() || null) !== current[key]) {
        data[key] = value?.trim() || null;
        instructionsChanged = true;
      }
    }
    if (instructionsChanged && current.instructionsPublishedAt) {
      data.instructionsVersion = current.instructionsVersion + 1;
    }

    return tx.procedure.update({ where: { id }, data });
  });
}

export async function publishProcedureInstructions(id: string) {
  return prisma.procedure.update({
    where: { id },
    data: { instructionsPublishedAt: new Date() },
  });
}

export async function archiveProcedure(id: string) {
  return prisma.procedure.update({
    where: { id },
    data: { archivedAt: new Date() },
  });
}

export async function getProcedureWithPatient(id: string) {
  return prisma.procedure.findUnique({
    where: { id },
    include: {
      patient: { include: { account: true } },
      template: true,
      doctor: { select: { id: true, nameAr: true, nameEn: true } },
      appointments: { orderBy: { appointmentDate: "asc" } },
      checklistItems: { orderBy: [{ phase: "asc" }, { sortOrder: "asc" }] },
    },
  });
}

export type ProcedureListFilters = {
  page?: number | undefined;
  pageSize?: number | undefined;
  status?: ProcedureStatus | "ALL" | undefined;
  doctorId?: string | undefined;
  category?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
};

export async function listProcedures(filters: ProcedureListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(5, filters.pageSize ?? PAGE_SIZE_DEFAULT),
  );
  const where: Prisma.ProcedureWhereInput = { archivedAt: null };
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.doctorId && filters.doctorId !== "ALL")
    where.doctorId = filters.doctorId;
  if (filters.category && filters.category !== "ALL")
    where.category = filters.category;
  if (filters.from)
    where.procedureDate = { gte: new Date(filters.from) };
  if (filters.to)
    where.procedureDate = {
      ...(where.procedureDate as object),
      lte: new Date(`${filters.to}T23:59:59+03:00`),
    };

  const [total, items] = await prisma.$transaction([
    prisma.procedure.count({ where }),
    prisma.procedure.findMany({
      where,
      orderBy: [{ procedureDate: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        patient: {
          select: { id: true, fullNameAr: true, fileNumber: true, phone: true },
        },
        template: { select: { nameAr: true } },
        doctor: { select: { nameAr: true } },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// ------------------------------------------------------------------
// Follow-up appointments
// ------------------------------------------------------------------

export type CreateAppointmentInput = {
  procedureId: string;
  patientId: string;
  appointmentDate: Date;
  appointmentTime?: string | undefined;
  appointmentType?: string | undefined;
  doctorId?: string | undefined;
  notes?: string | undefined;
  patientVisibleNotes?: string | undefined;
  createdById?: string | undefined;
  createdByName?: string | undefined;
};

export async function createAppointment(input: CreateAppointmentInput) {
  return prisma.followUpAppointment.create({
    data: {
      procedureId: input.procedureId,
      patientId: input.patientId,
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime?.trim() || null,
      appointmentType: input.appointmentType?.trim() || null,
      doctorId: input.doctorId || null,
      notes: input.notes?.trim() || null,
      patientVisibleNotes: input.patientVisibleNotes?.trim() || null,
      createdById: input.createdById ?? null,
      createdByName: input.createdByName ?? null,
    },
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  notes?: string,
) {
  return prisma.followUpAppointment.update({
    where: { id },
    data: {
      status,
      ...(notes !== undefined ? { notes: notes.trim() || null } : {}),
    },
  });
}

export type AppointmentListFilters = {
  page?: number | undefined;
  pageSize?: number | undefined;
  status?: AppointmentStatus | "ALL" | undefined;
  doctorId?: string | undefined;
  overdueOnly?: boolean | undefined;
  from?: string | undefined;
  to?: string | undefined;
};

export async function listAppointments(filters: AppointmentListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(5, filters.pageSize ?? PAGE_SIZE_DEFAULT),
  );
  const where: Prisma.FollowUpAppointmentWhereInput = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.doctorId && filters.doctorId !== "ALL")
    where.doctorId = filters.doctorId;
  if (filters.overdueOnly) {
    where.status = {
      in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
    };
    where.appointmentDate = { lt: new Date() };
  } else {
    if (filters.from) where.appointmentDate = { gte: new Date(filters.from) };
    if (filters.to)
      where.appointmentDate = {
        ...(where.appointmentDate as object),
        lte: new Date(`${filters.to}T23:59:59+03:00`),
      };
  }

  const [total, items] = await prisma.$transaction([
    prisma.followUpAppointment.count({ where }),
    prisma.followUpAppointment.findMany({
      where,
      orderBy: { appointmentDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        patient: {
          select: { id: true, fullNameAr: true, fileNumber: true, phone: true },
        },
        procedure: {
          select: {
            id: true,
            customProcedureName: true,
            template: { select: { nameAr: true } },
          },
        },
        doctor: { select: { nameAr: true } },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// ------------------------------------------------------------------
// Messages
// ------------------------------------------------------------------

export type MessageListFilters = {
  page?: number | undefined;
  pageSize?: number | undefined;
  status?: MessageStatus | "ALL" | undefined;
  urgentOnly?: boolean | undefined;
};

export async function listMessages(filters: MessageListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(5, filters.pageSize ?? PAGE_SIZE_DEFAULT),
  );
  const where: Prisma.PatientMessageWhereInput = {
    senderType: MessageSenderType.PATIENT,
  };
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.urgentOnly) where.isUrgent = true;

  const [total, items] = await prisma.$transaction([
    prisma.patientMessage.count({ where }),
    prisma.patientMessage.findMany({
      where,
      orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        patient: {
          select: { id: true, fullNameAr: true, fileNumber: true },
        },
        procedure: {
          select: {
            id: true,
            customProcedureName: true,
            template: { select: { nameAr: true } },
          },
        },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function replyToMessage(input: {
  messageId: string;
  reply: string;
  senderUserId?: string | undefined;
  senderUserName?: string | undefined;
}) {
  return prisma.$transaction(async (tx) => {
    const original = await tx.patientMessage.findUniqueOrThrow({
      where: { id: input.messageId },
    });
    const reply = await tx.patientMessage.create({
      data: {
        patientId: original.patientId,
        procedureId: original.procedureId,
        parentMessageId: original.id,
        senderType: MessageSenderType.STAFF,
        senderUserId: input.senderUserId ?? null,
        senderUserName: input.senderUserName ?? null,
        category: original.category,
        message: input.reply.trim(),
        status: MessageStatus.READ,
      },
    });
    await tx.patientMessage.update({
      where: { id: original.id },
      data: {
        status: MessageStatus.REPLIED,
        repliedAt: new Date(),
        readAt: original.readAt ?? new Date(),
      },
    });
    return reply;
  });
}

export async function setMessageStatus(id: string, status: MessageStatus) {
  const data: Prisma.PatientMessageUpdateInput = { status };
  if (status === MessageStatus.READ) data.readAt = new Date();
  if (status === MessageStatus.CLOSED) data.closedAt = new Date();
  return prisma.patientMessage.update({ where: { id }, data });
}

// ------------------------------------------------------------------
// Checklist
// ------------------------------------------------------------------

export async function addChecklistItem(input: {
  procedureId: string;
  patientId: string;
  title: string;
  description?: string | undefined;
  phase: ChecklistPhase;
  dueDate?: Date | undefined;
  isRequired?: boolean | undefined;
}) {
  const maxOrder = await prisma.procedureChecklistItem.aggregate({
    where: { procedureId: input.procedureId },
    _max: { sortOrder: true },
  });
  return prisma.procedureChecklistItem.create({
    data: {
      procedureId: input.procedureId,
      patientId: input.patientId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      phase: input.phase,
      dueDate: input.dueDate ?? null,
      isRequired: input.isRequired ?? false,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });
}

export async function verifyChecklistItem(id: string, verified: boolean) {
  return prisma.procedureChecklistItem.update({
    where: { id },
    data: { staffVerifiedAt: verified ? new Date() : null },
  });
}

export async function deleteChecklistItem(id: string) {
  return prisma.procedureChecklistItem.delete({ where: { id } });
}
