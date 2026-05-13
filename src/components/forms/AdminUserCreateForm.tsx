"use client";

import { UserRole } from "@prisma/client";
import { useActionState } from "react";

import {
  createAdminUserAction,
  type AdminUserActionState,
} from "@/app/admin/users/actions";

const initialState: AdminUserActionState = {
  status: "idle",
  message: "",
};

const roleOptions = [
  { value: UserRole.SUPER_ADMIN, label: "إدارة عليا" },
  { value: UserRole.ADMIN, label: "مدير" },
  { value: UserRole.EDITOR, label: "محرر" },
  { value: UserRole.VIEWER, label: "مراقب" },
] as const;

export function AdminUserCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createAdminUserAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          placeholder="اسم المستخدم"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="البريد الإلكتروني"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <input
          name="password"
          type="password"
          placeholder="كلمة المرور الأولية"
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
          required
        />
        <select
          name="role"
          defaultValue={UserRole.VIEWER}
          className="border-line bg-surface text-ink focus:border-gold rounded-[1.15rem] border px-4 py-3 text-sm outline-none"
        >
          {roleOptions.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>
      {state.message ? (
        <p
          className={`text-sm ${state.status === "success" ? "text-emerald" : "text-burgundy"}`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-[1.15rem] px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "جاري الإضافة..." : "إضافة حساب"}
      </button>
    </form>
  );
}
