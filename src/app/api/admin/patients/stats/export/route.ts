import { NextRequest, NextResponse } from "next/server";
import { AppointmentStatus, MessageStatus, PatientAccountStatus } from "@prisma/client";

import { auth } from "@/auth";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvRow(cells: (string | number)[]): string {
  return cells
    .map((cell) => {
      const value = String(cell);
      return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    })
    .join(",");
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !hasPortalCapability(role, "stats.export")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const now = new Date();
  const fromDate = from ? new Date(from) : new Date(now.getFullYear(), 0, 1);
  const toDate = to ? new Date(`${to}T23:59:59+03:00`) : now;
  const range = { gte: fromDate, lte: toDate };

  const [
    totalPatients,
    newPatients,
    pendingAccounts,
    completedProcedures,
    unreadMessages,
    overdueFollowUps,
    feedbackAgg,
    lowFeedback,
  ] = await prisma.$transaction([
    prisma.patient.count({ where: { archivedAt: null } }),
    prisma.patient.count({ where: { archivedAt: null, createdAt: range } }),
    prisma.patient.count({
      where: { archivedAt: null, accountStatus: PatientAccountStatus.PENDING },
    }),
    prisma.procedure.count({
      where: { archivedAt: null, status: "COMPLETED", procedureDate: range },
    }),
    prisma.patientMessage.count({
      where: { senderType: "PATIENT", status: MessageStatus.UNREAD },
    }),
    prisma.followUpAppointment.count({
      where: {
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        appointmentDate: { lt: now },
      },
    }),
    prisma.patientFeedback.aggregate({
      where: { submittedAt: range },
      _avg: { overallRating: true },
      _count: true,
    }),
    prisma.patientFeedback.count({
      where: { submittedAt: range, overallRating: { lte: 2 } },
    }),
  ]);

  const rows = [
    ["المؤشر", "القيمة"],
    ["إجمالي المرضى", totalPatients],
    ["مرضى جدد في الفترة", newPatients],
    ["حسابات غير مفعلة", pendingAccounts],
    ["عمليات مكتملة في الفترة", completedProcedures],
    ["رسائل غير مقروءة", unreadMessages],
    ["متابعات متأخرة", overdueFollowUps],
    ["عدد التقييمات", feedbackAgg._count],
    [
      "متوسط التقييم",
      feedbackAgg._avg.overallRating
        ? feedbackAgg._avg.overallRating.toFixed(2)
        : "0",
    ],
    ["تقييمات منخفضة (≤2)", lowFeedback],
  ];

  const csv = "﻿" + rows.map((row) => csvRow(row)).join("\r\n");
  const date = now.toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rejuvera-patient-stats-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
