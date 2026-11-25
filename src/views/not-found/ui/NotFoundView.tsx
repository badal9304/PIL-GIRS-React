'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PATH } from '@/shared/constants/screens';

/** Unknown address: says so and links to the start screen. */
export function NotFoundView(): ReactNode {
  const { t } = useTranslation('common');
  return (
    <main className="theme min-h-screen flex flex-col items-center justify-center gap-3 bg-bg text-ink font-sans">
      <h1 className="m-0 text-[17px] font-semibold">{t('This screen does not exist.')}</h1>
      <p className="m-0 text-muted">{t('Check the address, or open a screen from the menu.')}</p>
      <Link href={DEFAULT_PATH} className="btn btn-primary no-underline">
        {t('Go to Invoice List')}
      </Link>
    </main>
  );
}
