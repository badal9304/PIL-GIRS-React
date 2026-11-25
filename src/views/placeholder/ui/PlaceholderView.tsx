'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import type { Screen } from '@/shared/constants/screens';
import { ScreenHeader, ScreenTemplate } from '@/shared/ui';

/** Placeholder for screens whose design is not built yet. */
export function PlaceholderView({ screen }: { screen: Screen }): ReactNode {
  const { t } = useTranslation('common');
  return (
    <ScreenTemplate topBar={<AppHeader />} header={<ScreenHeader title={t(screen.label)} />}>
      <section className="card flex-auto flex flex-col items-center justify-center gap-3 min-h-90 text-muted" aria-live="polite">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 21h18" />
          <path d="M5 21V10l7-5 7 5v11" />
          <path d="M9 21v-6h6v6" />
        </svg>
        <h2 className="m-0 text-[16px] font-semibold leading-[22px] text-ink">{t('Design under process')}</h2>
      </section>
    </ScreenTemplate>
  );
}
