"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { createAdminUser, updateAdminUserRole } from "@/lib/content-repository";

export type AdminUserActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
});

const roleUpdateSchema = z.object({
  id: z.string().min(3),
  role: z.nativeEnum(UserRole),
});

async function ensureSuperAdmin() {
  const session = await auth();

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function createAdminUserAction(
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  try {
    await ensureSuperAdmin();
  } catch {
    return {
      status: "error",
      message: "لا تتوفر صلاحية كافية لإضافة حساب جديد.",
    };
  }

  const parsed = initialUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "يرجى استكمال بيانات الحساب بصورة صحيحة.",
    };
  }

  try {
    await createAdminUser(parsed.data);
  } catch {
    return {
      status: "error",
      message:
        "تعذر إضافة الحساب بالبيانات الحالية. يرجى مراجعة البريد الإلكتروني والمحاولة مجددًا.",
    };
  }

  revalidatePath("/admin/users");

  return {
    status: "success",
    message: "تمت إضافة الحساب بنجاح.",
  };
}

export async function updateAdminUserRoleAction(
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  let session;

  try {
    session = await ensureSuperAdmin();
  } catch {
    return {
      status: "error",
      message: "لا تتوفر صلاحية كافية لتعديل الدور.",
    };
  }

  const parsed = roleUpdateSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "بيانات الدور غير مكتملة.",
    };
  }

  if (
    session.user.id === parsed.data.id &&
    parsed.data.role !== UserRole.SUPER_ADMIN
  ) {
    return {
      status: "error",
      message:
        "لا يمكن خفض صلاحية الحساب المسؤول عن الإدارة العليا من نفس الجلسة.",
    };
  }

  try {
    await updateAdminUserRole(parsed.data);
  } catch {
    return {
      status: "error",
      message: "تعذر تحديث الدور في الوقت الحالي.",
    };
  }

  revalidatePath("/admin/users");

  return {
    status: "success",
    message: "تم تحديث الدور بنجاح.",
  };
}
