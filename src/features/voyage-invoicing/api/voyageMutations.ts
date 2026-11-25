'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { saveVoyageChanges, voyageKeys, type VoyageChanges } from '@/entities/voyage';

export interface VoyageActions {
  /** Applies the actions taken at once (optimistic) and saves them; rolls back if saving fails. */
  commit: (changes: VoyageChanges) => Promise<void>;
}

export function useVoyageActions(): VoyageActions {
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: saveVoyageChanges,
    onMutate: async (changes) => {
      await qc.cancelQueries({ queryKey: voyageKeys.changes() });
      const previous = qc.getQueryData<VoyageChanges>(voyageKeys.changes());
      qc.setQueryData<VoyageChanges>(voyageKeys.changes(), changes);
      return { previous };
    },
    onError: (_e, _changes, ctx) => {
      if (ctx?.previous) qc.setQueryData(voyageKeys.changes(), ctx.previous);
    },
  });
  const { mutateAsync } = save;
  return useMemo(
    () => ({
      commit: async (changes) => {
        await mutateAsync(changes);
      },
    }),
    [mutateAsync],
  );
}
