'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePhrase } from '@/shared/hooks/usePhrase';
import { useToast, useToastMessage } from '../model/hooks';

/** Bottom-right status message. Its own component so a toast re-renders only itself. */
export function Toast(): ReactNode {
  const { t } = useTranslation('common');
  const { tx } = usePhrase();
  const { close } = useToast();
  const message = useToastMessage();
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-5 end-5 z-60 flex items-center gap-3 max-w-130 min-h-11 pr-2 pl-4 rounded-[8px] bg-ink text-bg shadow-[0_8px_24px_rgba(0,0,0,.25)] box-border"
    >
      {tx(message)}
      <button className="btn btn-sm" onClick={close}>
        {t('Close')}
      </button>
    </div>
  );
}
