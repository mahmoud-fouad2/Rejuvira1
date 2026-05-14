"use client";

import { UserRole } from "@prisma/client";
import { useActionState } from "react";

import {
  updateAdminUserRoleAction,
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

export function AdminUserRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const [state, formAction, isPending] = useActionState(
    updateAdminUserRoleAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 md:flex-row md:items-center"
    >
      <input type="hidden" name="id" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        className="border-line bg-surface text-ink focus:border-gold rounded-[1rem] border px-4 py-2.5 text-sm outline-none"
      >
        {roleOptions.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-canvas rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "جارٍ الحفظ" : "حفظ"}
      </button>
      <span
        className={`text-xs ${state.status === "error" ? "text-burgundy" : "text-ink-faint"}`}
      >
        {state.message || "تحديث الدور مباشرة من البطاقة."}
      </span>
    </form>
  );
}
