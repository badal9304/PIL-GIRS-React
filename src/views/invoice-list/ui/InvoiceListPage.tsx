'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import { useInvoiceList } from '@/features/invoice-management';
import { ScreenLoadState } from '@/shared/ui';
import { InvoiceListScreen } from './InvoiceListView';

function InvoiceList({ params }: { params: URLSearchParams }): ReactNode {
  const { t } = useTranslation('invoices');
  const { vals, status } = useInvoiceList(params);
  if (!vals) return <ScreenLoadState topBar={<AppHeader />} title={t('Invoice List')} status={status} />;
  return <InvoiceListScreen v={vals} />;
}

/** Deep links (?q=, ?open=<invoice no>, ?rv=<B/L>, ?tab=ready) start the screen in that state. */
function WithParams(): ReactNode {
  const params = useSearchParams();
  return <InvoiceList key={params.toString()} params={params} />;
}

/** Invoicing › Invoice List: Ready to invoice (B/Ls from LMS) and Invoices. */
export function InvoiceListView(): ReactNode {
  return (
    <Suspense fallback={null}>
      <WithParams />
    </Suspense>
  );
}
