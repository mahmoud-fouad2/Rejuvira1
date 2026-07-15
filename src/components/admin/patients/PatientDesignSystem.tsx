import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="admin-page-header patient-page-header">
      <div>
        {eyebrow ? <span className="patient-page-header__eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="admin-page-header__actions">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <article className="patient-kpi-card">
      <span className="patient-kpi-card__icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

export function FilterBar({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-card patient-filter-card patient-filter-card--system">
      <div className="admin-card__header">
        <div>
          <strong className="admin-card__title">{title}</strong>
          {description ? (
            <p className="admin-text-soft patient-card-subtitle">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function DataTable({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="admin-card patient-table-card patient-data-card">
      <div className="admin-card__header">
        <div>
          <strong className="admin-card__title">{title}</strong>
          {description ? (
            <p className="admin-text-soft patient-card-subtitle">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="admin-table-wrap patient-table-wrap">{children}</div>
      {footer ? <div className="patient-data-card__footer">{footer}</div> : null}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className="patient-empty-state">
      <span className="patient-empty-state__icon" aria-hidden="true">
        {icon ?? "•"}
      </span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div className="patient-empty-state__action">{action}</div> : null}
    </section>
  );
}

export function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="patient-form-section">
      <div className="patient-form-section__header">
        <span className="patient-form-section__step">{step}</span>
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function ModalFooter({
  note,
  children,
}: {
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="patient-form-footer">
      {note ? <span>{note}</span> : <span />}
      {children}
    </div>
  );
}
