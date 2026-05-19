import { UserRole } from "@prisma/client";

import { deleteAdminUserAction } from "@/app/admin/users/actions";
import { auth } from "@/auth";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { AdminListControls } from "@/components/admin/AdminListControls";
import { AdminUserCreateForm } from "@/components/forms/AdminUserCreateForm";
import { AdminUserRoleForm } from "@/components/forms/AdminUserRoleForm";
import {
  getRoleLabel,
  permissionMatrix,
  roleLabels,
} from "@/lib/admin-permissions";
import { getAdminUsers } from "@/lib/content-repository";

const roleOrder: readonly UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.VIEWER,
];

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([auth(), getAdminUsers()]);
  const groupedUsers = roleOrder.map((role) => ({
    role,
    label: roleLabels[role],
    users: users.filter((user) => user.role === role),
  }));
  const canManage = session?.user?.role === UserRole.SUPER_ADMIN;
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: users.length },
    ...groupedUsers.map((group) => ({
      value: group.role,
      labelAr: roleLabels[group.role],
      labelEn: group.role.replace("_", " "),
      count: group.users.length,
    })),
    {
      value: "inactive",
      labelAr: "غير نشط",
      labelEn: "Inactive",
      count: users.filter((user) => user.isActive === false).length,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">المستخدمون والصلاحيات</span>
            <span className="lang-en">Users &amp; permissions</span>
          </h1>
          <p>
            <span className="lang-ar">{users.length} حساب</span>
            <span className="lang-en">{users.length} accounts</span>
          </p>
        </div>
        {canManage ? (
          <div className="admin-page-header__actions">
            <AdminAddModal
              triggerArabic="إضافة حساب"
              triggerEnglish="Add user"
              titleArabic="إضافة حساب جديد"
              titleEnglish="New user"
            >
              <AdminUserCreateForm />
            </AdminAddModal>
          </div>
        ) : null}
      </div>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">By role</div>
            <div className="admin-card__title">
              <span className="lang-ar">توزيع الحسابات</span>
              <span className="lang-en">Accounts by role</span>
            </div>
          </div>
        </div>
        <div className="admin-data-list">
          {groupedUsers.map((group) => (
            <div key={group.role} className="admin-data-row">
              <div>
                <p className="admin-data-row__title">
                  {roleLabels[group.role]}
                </p>
                <p className="admin-data-row__meta" dir="ltr">
                  {group.role}
                </p>
              </div>
              <span className="admin-data-row__value">
                {group.users.length}
              </span>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Accounts</div>
            <div className="admin-card__title">
              <span className="lang-ar">الحسابات</span>
              <span className="lang-en">Accounts</span>
            </div>
          </div>
        </div>
        <AdminListControls targetId="admin-users-list" tabs={tabs} />
        <div className="admin-data-list" data-admin-list="admin-users-list">
          {users.map((user) => (
            <div
              key={user.id}
              className="admin-data-row grid-cols-[1fr_auto] !items-start"
              data-admin-row
              data-admin-status={
                user.isActive === false ? "inactive" : user.role
              }
              data-admin-search={[
                user.name,
                user.email,
                user.role,
                user.positionTitle,
                user.department,
                getRoleLabel(user.role),
              ].join(" ")}
            >
              <div className="min-w-0">
                <p className="admin-data-row__title truncate">{user.name}</p>
                <p className="admin-data-row__meta truncate" dir="ltr">
                  {user.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="admin-chip">{getRoleLabel(user.role)}</span>
                  {user.positionTitle ? (
                    <span className="admin-chip">{user.positionTitle}</span>
                  ) : null}
                  {user.department ? (
                    <span className="admin-chip">{user.department}</span>
                  ) : null}
                  <span
                    className={`admin-chip ${user.isActive === false ? "!border-burgundy/30 !text-burgundy" : ""}`}
                  >
                    <span className="lang-ar">
                      {user.isActive === false ? "غير نشط" : "نشط"}
                    </span>
                    <span className="lang-en">
                      {user.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </span>
                  <span className="admin-chip">
                    <span className="lang-ar">طلبات: {user.leadCount}</span>
                    <span className="lang-en">Leads: {user.leadCount}</span>
                  </span>
                </div>
              </div>
              <div className="grid justify-items-end gap-2">
                {canManage ? (
                  <AdminUserRoleForm
                    userId={user.id}
                    currentRole={user.role}
                    positionTitle={user.positionTitle}
                    department={user.department}
                    isActive={user.isActive !== false}
                    canDeactivate={session?.user?.id !== user.id}
                  />
                ) : null}
                {canManage && session?.user?.id !== user.id ? (
                  <form action={deleteAdminUserAction}>
                    <input type="hidden" name="id" value={user.id} />
                    <button type="submit" className="admin-btn-danger">
                      <span className="lang-ar">تعطيل الحساب</span>
                      <span className="lang-en">Disable</span>
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Matrix</div>
            <div className="admin-card__title">
              <span className="lang-ar">مصفوفة الصلاحيات</span>
              <span className="lang-en">Permission matrix</span>
            </div>
          </div>
        </div>
        <div className="admin-data-list">
          {permissionMatrix.map((rule) => (
            <div key={rule.prefix} className="admin-data-row">
              <div>
                <p className="admin-data-row__title">{rule.label}</p>
                <p className="admin-data-row__meta" dir="ltr">
                  {rule.prefix}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rule.roles.map((role) => (
                  <span key={role} className="admin-chip">
                    {roleLabels[role]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
