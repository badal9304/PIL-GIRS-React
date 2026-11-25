'use client';

import { useQuery } from '@tanstack/react-query';
import { invoiceWorkspaceQuery } from '@/entities/invoice';
import { useToastServices } from '@/entities/notification';
import { useQueryScreen } from '@/shared/hooks/useQueryScreen';
import { readStore, removeStore } from '@/shared/lib/storage';
import { useInvoiceActions } from '../api/invoiceMutations';
import { InvoiceListModel, type InvoiceListLink } from './invoiceListModel';

/** Search text handed over from global search ("Search … in Enquiry & Monitoring"), taken once. */
function takeHandedSearch(): string {
  const q = readStore('girs.find');
  if (q) removeStore('girs.find');
  return q ?? '';
}

/**
 * Invoice List: values (null while loading) and load status. `params` are the URL search params
 * (?q=, ?rv=, ?open=, ?tab=); the screen is re-created when they change.
 */
export function useInvoiceList(params: URLSearchParams) {
  const query = useQuery(invoiceWorkspaceQuery());
  return useQueryScreen(
    query,
    () => {
      const link: InvoiceListLink = {
        q: takeHandedSearch() || params.get('q') || '',
        rv: params.get('rv') ?? '',
        open: params.get('open') ?? '',
        tab: params.get('tab') ?? '',
      };
      return new InvoiceListModel(link, query.data?.ready ?? []);
    },
    useToastServices(),
    useInvoiceActions(),
  );
}
