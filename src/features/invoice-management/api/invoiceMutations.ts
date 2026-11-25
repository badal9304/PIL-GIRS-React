'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  invoiceKeys,
  saveInvoiceChanges,
  submitCreditNote,
  type CreditNote,
  type InvoiceChanges,
  type InvoiceWorkspace,
} from '@/entities/invoice';

export interface InvoiceActions {
  /** Applies GIRS changes at once (optimistic) and saves them; rolls back if saving fails. */
  commit: (changes: InvoiceChanges) => Promise<void>;
  submitCreditNote: (cn: CreditNote) => Promise<void>;
}

export function useInvoiceActions(): InvoiceActions {
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: saveInvoiceChanges,
    onMutate: async (changes) => {
      await qc.cancelQueries({ queryKey: invoiceKeys.workspace() });
      const previous = qc.getQueryData<InvoiceWorkspace>(invoiceKeys.workspace());
      if (previous) qc.setQueryData<InvoiceWorkspace>(invoiceKeys.workspace(), { ...previous, changes });
      return { previous };
    },
    onError: (_e, _changes, ctx) => {
      if (ctx?.previous) qc.setQueryData(invoiceKeys.workspace(), ctx.previous);
    },
  });
  const cn = useMutation({ mutationFn: submitCreditNote });
  const { mutateAsync: saveAsync } = save;
  const { mutateAsync: cnAsync } = cn;
  return useMemo(
    () => ({
      commit: async (changes) => {
        await saveAsync(changes);
      },
      submitCreditNote: async (c) => {
        await cnAsync(c);
      },
    }),
    [saveAsync, cnAsync],
  );
}
