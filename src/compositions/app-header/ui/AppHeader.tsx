'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ENTITIES, HUBS, PENDING_APPROVALS } from '@/entities/organization';
import { GlobalSearch } from '@/features/global-search';
import { useSettings, useSettingsActions } from '@/features/settings';
import { usePhrase } from '@/shared/hooks/usePhrase';
import { routeOf } from '@/shared/lib/routing';
import { UserMenu } from './UserMenu';

const chevron = (
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
    className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** App header: global search, working location, entity, fiscal period, approvals and profile. */
export function AppHeader(): ReactNode {
  const { t } = useTranslation('common');
  const { tx } = usePhrase();
  const { hub, entity, theme } = useSettings();
  const { hubChanged, entityChanged } = useSettingsActions();
  const pending = t('{{count}} pending approvals', { count: PENDING_APPROVALS });

  return (
    <div className="h-13 flex-none flex items-center gap-3 px-5 bg-surface border-b border-b-line2 box-border">
      <GlobalSearch theme={theme} />
      <div className="flex-auto" />
      <div className="relative">
        <label htmlFor="ghub" className="sr">
          {t('Hub')}
        </label>
        <select id="ghub" className="select select-sm w-37" value={hub} onChange={(e) => hubChanged(e.target.value)}>
          {HUBS.map((h) => (
            <option key={h.code} value={h.code}>
              {tx(h.label)}
            </option>
          ))}
        </select>
        {chevron}
      </div>
      <div className="relative">
        <label htmlFor="gent" className="sr">
          {t('Entity')}
        </label>
        <select id="gent" className="select select-sm w-25" value={entity} onChange={(e) => entityChanged(e.target.value)}>
          {ENTITIES.map((v) => (
            <option key={v} value={v}>
              {tx(v)}
            </option>
          ))}
        </select>
        {chevron}
      </div>
      <span className="chip bg-okbg text-ok h-8 rounded-[6px]">
        <span className="size-2 rounded-full bg-okdot" />
        {t('Period [Fiscal period] · Open')}
      </span>
      <Link href={routeOf('approvals-inbox.html')} className="btn btn-icon relative no-underline" aria-label={pending} title={pending}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
        </svg>
        <span className="mono absolute -top-1.5 -end-1.5 min-w-4.5 h-4.5 px-1 rounded-[9px] bg-brand text-onaccent text-[12px] leading-[18px] text-center box-border">
          {PENDING_APPROVALS}
        </span>
      </Link>
      <UserMenu />
    </div>
  );
}
