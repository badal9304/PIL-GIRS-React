'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../lib/cx';
import { Button } from '../atoms/controls';
import { Count } from '../atoms/indicators';

/* Messages, filters, navigation and list furniture from the approved UI kit. */

const bannerTone = { info: 'b-info', ok: 'b-ok', warn: 'b-warn', block: 'b-block' } as const;

/** Inline notification. Blocking messages (`block`) are announced as alerts and cannot be dismissed. */
export function Banner({
  tone = 'info',
  icon,
  action,
  onDismiss,
  className,
  children,
}: {
  tone?: keyof typeof bannerTone;
  icon?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation('common');
  return (
    <div className={cx('banner', bannerTone[tone], className)} role={tone === 'block' ? 'alert' : 'status'}>
      {icon}
      <span>{children}</span>
      {action}
      {onDismiss && tone !== 'block' ? (
        <button type="button" className="btn btn-sm btn-icon x" aria-label={t('Dismiss')} onClick={onDismiss}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export type Choice<V extends string> = { value: V; label: ReactNode; count?: ReactNode; disabled?: boolean };

/** Quick filters over a list, with counts. One active at a time. */
export function FilterChips<V extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: Choice<V>[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          className="chipb"
          aria-pressed={it.value === value}
          disabled={it.disabled}
          onClick={() => onChange(it.value)}
        >
          {it.label}
          {it.count !== undefined ? <span>{it.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** Switches between 2–4 views of the same data. Exposed as a radio group. */
export function SegmentedControl<V extends string>({
  label,
  items,
  value,
  onChange,
  className,
}: {
  label: string;
  items: Choice<V>[];
  value: V;
  onChange: (v: V) => void;
  className?: string;
}) {
  return (
    <div className={cx('seg', className)} role="radiogroup" aria-label={label}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="radio"
          aria-checked={it.value === value}
          disabled={it.disabled}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** Areas of one screen. The screen renders the active panel; `idBase` links tabs to it. */
export function Tabs<V extends string>({
  label,
  items,
  value,
  onChange,
  idBase,
}: {
  label: string;
  items: Choice<V>[];
  value: V;
  onChange: (v: V) => void;
  idBase: string;
}) {
  const move = (dir: 1 | -1) => {
    const i = items.findIndex((t) => t.value === value);
    const next = items[(i + dir + items.length) % items.length];
    onChange(next.value);
    document.getElementById(`${idBase}-tab-${next.value}`)?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            id={`${idBase}-tab-${it.value}`}
            type="button"
            className="tabb"
            role="tab"
            aria-selected={on}
            aria-controls={`${idBase}-panel`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(it.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') move(1);
              if (e.key === 'ArrowLeft') move(-1);
            }}
          >
            {it.label}
            {it.count !== undefined ? <Count on={on}>{it.count}</Count> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Groups one topic: title left, actions right. */
export function Card({
  title,
  actions,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { title?: ReactNode; actions?: ReactNode }) {
  return (
    <section className={cx('card', className)} {...rest}>
      {title || actions ? (
        <div className="card-head">
          {title ? <h3 className="card-title">{title}</h3> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Says why a list is empty and what to do next. */
export function EmptyState({
  title,
  hint,
  action,
}: {
  title: ReactNode;
  hint?: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="empty">
      <b>{title}</b>
      {hint ? <span>{hint}</span> : null}
      {action ? (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString('en-US');

/** Under every list that can pass 25 rows. `page` is 1-based. */
export function Pager({
  page,
  pageSize,
  total,
  noun,
  onPage,
  onPageSize,
  sizes = [25, 50, 100],
}: {
  page: number;
  pageSize: number;
  total: number;
  noun: string;
  onPage: (p: number) => void;
  onPageSize?: (n: number) => void;
  sizes?: number[];
}) {
  const { t } = useTranslation('common');
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="pager">
      <span>{t('Showing {{from}}–{{to}} of {{total}} {{noun}}', { from: fmt(from), to: fmt(to), total: fmt(total), noun })}</span>
      <span className="ms-auto inline-flex items-center gap-2">
        {onPageSize ? (
          <>
            <span className="text-muted text-[12px]">{t('Rows per page')}</span>
            <div className="sel w-19">
              <select
                className="select select-sm"
                aria-label={t('Rows per page')}
                value={pageSize}
                onChange={(e) => onPageSize(Number(e.target.value))}
              >
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </>
        ) : null}
        <button type="button" className="btn btn-sm pbtn" aria-label={t('First page')} disabled={page <= 1} onClick={() => onPage(1)}>
          «
        </button>
        <button
          type="button"
          className="btn btn-sm pbtn"
          aria-label={t('Previous page')}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          ‹
        </button>
        <span className="mono text-[13px] min-w-16 text-center">
          {page} / {pages}
        </span>
        <button
          type="button"
          className="btn btn-sm pbtn"
          aria-label={t('Next page')}
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          ›
        </button>
        <button
          type="button"
          className="btn btn-sm pbtn"
          aria-label={t('Last page')}
          disabled={page >= pages}
          onClick={() => onPage(pages)}
        >
          »
        </button>
      </span>
    </div>
  );
}
