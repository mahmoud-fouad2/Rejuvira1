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
  { value: UserRole.SUPER_ADMIN, label: "Super Admin" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.EDITOR, label: "Editor" },
  { value: UserRole.VIEWER, label: "Viewer" },
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
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={userId} />
      <select name="role" defaultValue={currentRole} className="admin-input !py-1.5 !text-xs">
        {roleOptions.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      <button type="submit" disabled={isPending} className="admin-btn-secondary">
        {isPending ? (
          <>
            <span className="lang-ar">حفظ...</span>
            <span className="lang-en">Save...</span>
          </>
        ) : (
          <>
            <span className="lang-ar">حفظ</span>
            <span className="lang-en">Save</span>
          </>
        )}
      </button>
      {state.message ? (
        <span className={`text-[11px] ${state.status === "error" ? "text-burgundy" : "text-emerald"}`}>
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
