'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScreenStatus } from '../../lib/screenModel';
import { ScreenHeader, ScreenTemplate } from './ScreenTemplate';

/** Shown until a screen's data has loaded: a skeleton, or the error with a retry. */
export function ScreenLoadState({ topBar, title, status }: { topBar: ReactNode; title: string; status: ScreenStatus }): ReactNode {
  const { t } = useTranslation('common');
  return (
    <ScreenTemplate topBar={topBar} header={<ScreenHeader title={title} />}>
      {status.isError ? (
        <section className="card flex-auto flex flex-col items-center justify-center gap-3 min-h-90" role="alert">
          <h2 className="m-0 text-[16px] font-semibold">{t('This screen could not load its data.')}</h2>
          {status.error ? <p className="m-0 text-muted mono text-[12px]">{status.error.message}</p> : null}
          <button type="button" className="btn btn-primary" onClick={status.retry}>
            {t('Try again')}
          </button>
        </section>
      ) : (
        <section className="card flex-auto min-h-90 flex flex-col gap-3 p-5" aria-busy="true" aria-label={t('Loading…')}>
          {[70, 100, 92, 100, 84, 96].map((w, i) => (
            <div key={i} className="h-4 rounded-[4px] bg-neutral animate-pulse" style={{ width: w + '%' }} />
          ))}
        </section>
      )}
    </ScreenTemplate>
  );
}
