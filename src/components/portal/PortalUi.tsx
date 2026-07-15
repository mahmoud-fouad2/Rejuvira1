import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="portal-page-header">
      <div>
        {eyebrow ? <span className="portal-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="portal-page-header__action">{action}</div> : null}
    </section>
  );
}

export function PatientSummaryCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  href?: string | undefined;
}) {
  const content = (
    <>
      <span className="portal-summary-card__icon" aria-hidden="true">
        {icon ?? null}
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href as Route} className="portal-summary-card">
        {content}
      </Link>
    );
  }

  return <article className="portal-summary-card">{content}</article>;
}

export function PortalCard({
  title,
  description,
  children,
  action,
  compact = false,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "portal-card portal-card--compact" : "portal-card"}>
      <div className="portal-card__header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function PortalEmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section className="portal-empty-state">
      <span className="portal-empty-state__icon" aria-hidden="true">
        {icon ?? "•"}
      </span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div className="portal-empty-state__action">{action}</div> : null}
    </section>
  );
}

export function DocumentCard({
  title,
  type,
  date,
  source,
  expiresAt,
  href,
}: {
  title: string;
  type: string;
  date: string;
  source?: string | null;
  expiresAt?: string | null;
  href: string;
}) {
  return (
    <article className="portal-document-card">
      <div className="portal-document-card__icon" aria-hidden="true">
        PDF
      </div>
      <div>
        <h2>{title}</h2>
        <p>{type}</p>
      </div>
      <dl>
        <div>
          <dt>التاريخ</dt>
          <dd>{date}</dd>
        </div>
        <div>
          <dt>المصدر</dt>
          <dd>{source || "فريق ريجوفيرا"}</dd>
        </div>
        {expiresAt ? (
          <div>
            <dt>متاح حتى</dt>
            <dd>{expiresAt}</dd>
          </div>
        ) : null}
      </dl>
      <div className="portal-document-card__actions">
        <a href={href} target="_blank" rel="noreferrer" className="portal-btn portal-btn--primary">
          عرض
        </a>
        <a href={href} download className="portal-btn portal-btn--secondary">
          تنزيل
        </a>
      </div>
    </article>
  );
}

export function MessageThread({
  children,
  composer,
}: {
  children: ReactNode;
  composer: ReactNode;
}) {
  return (
    <section className="portal-message-thread">
      <div className="portal-message-thread__body">{children}</div>
      <div className="portal-message-thread__composer">{composer}</div>
    </section>
  );
}
