"use client";

import { UserRole } from "@/lib/prisma-enums";
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
  { value: UserRole.SUPER_ADMIN, label: "إدارة عليا / Super Admin" },
  { value: UserRole.ADMIN, label: "مدير / Admin" },
  { value: UserRole.EDITOR, label: "محرر / Editor" },
  { value: UserRole.VIEWER, label: "كول سنتر / Leads only" },
] as const;

export function AdminUserRoleForm({
  userId,
  currentRole,
  positionTitle,
  department,
  isActive = true,
  canDeactivate = true,
}: {
  userId: string;
  currentRole: UserRole;
  positionTitle?: string | undefined;
  department?: string | undefined;
  isActive?: boolean | undefined;
  canDeactivate?: boolean | undefined;
}) {
  const [state, formAction, isPending] = useActionState(
    updateAdminUserRoleAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid min-w-[18rem] gap-2">
      <input type="hidden" name="id" value={userId} />
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          name="positionTitle"
          defaultValue={positionTitle ?? ""}
          className="admin-input !py-1.5 !text-xs"
          placeholder="Position"
        />
        <input
          name="department"
          defaultValue={department ?? ""}
          className="admin-input !py-1.5 !text-xs"
          placeholder="Department"
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <label className="admin-chip cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={isActive}
            disabled={!canDeactivate}
            className="accent-[var(--admin-accent)]"
          />
          <span className="lang-ar">نشط</span>
          <span className="lang-en">Active</span>
        </label>
        <select
          name="role"
          defaultValue={currentRole}
          className="admin-input !w-auto !py-1.5 !text-xs"
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
          className="admin-btn-secondary"
        >
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
      </div>
      {state.message ? (
        <span
          className={`text-[11px] ${state.status === "error" ? "text-burgundy" : "text-emerald"}`}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
