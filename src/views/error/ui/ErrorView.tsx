'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** Unexpected error while rendering a screen: what happened and a retry. */
export function ErrorView({ error, onRetry }: { error: Error; onRetry: () => void }): ReactNode {
  const { t } = useTranslation('common');
  return (
    <main className="theme min-h-screen flex flex-col items-center justify-center gap-3 bg-bg text-ink font-sans" role="alert">
      <h1 className="m-0 text-[17px] font-semibold">{t('Something went wrong on this screen.')}</h1>
      <p className="m-0 text-muted mono">{error.message}</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        {t('Try again')}
      </button>
    </main>
  );
}
