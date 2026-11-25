'use client';

import { useQueries, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useToastServices } from '@/entities/notification';
import { TODAY, addDays, ddContainersQuery, hubOf, voyageChangesQuery, voyageMonthQuery, type VoyageMonth } from '@/entities/voyage';
import { useScreenModel } from '@/shared/hooks/useScreenModel';
import type { ScreenStatus } from '@/shared/lib/screenModel';
import { useVoyageActions } from '../api/voyageMutations';
import { requiredMonths, VoyageInvoicingModel, type VoyageScreenData, type VoyageVals } from './voyageInvoicingModel';

/** Merges the loaded months into one day -> voyages map (stable function: TanStack re-runs it only when results change). */
function combineMonths(results: UseQueryResult<VoyageMonth>[]) {
  return {
    days: results.reduce<VoyageMonth>((acc, r) => (r.data ? { ...acc, ...r.data } : acc), {}),
    isError: results.some((r) => r.isError),
    error: results.find((r) => r.error)?.error ?? null,
    refetch: () => Promise.all(results.map((r) => r.refetch())),
  };
}

const INITIAL_MONTHS = requiredMonths({ win: addDays(TODAY, -6), view: 'range', from: TODAY, to: TODAY });

/**
 * Home (Voyage Invoicing and D&D Billing) for the working location and entity chosen in the app header.
 * Loads the voyages of the months the view needs (ribbon, overdue window, selected range), the D&D containers of
 * the country and the actions taken; returns the values (null while loading) and the load status.
 */
export function useVoyageInvoicing(hub: string, entity: string): { vals: VoyageVals | null; status: ScreenStatus } {
  const [, port, cc] = hubOf(hub);
  const [months, setMonths] = useState<string[]>(INITIAL_MONTHS);
  const changes = useQuery(voyageChangesQuery());
  const dd = useQuery(ddContainersQuery(cc));
  const days = useQueries({
    queries: months.map((m) => voyageMonthQuery(port, m)),
    combine: combineMonths,
  });
  const data = useMemo<VoyageScreenData | undefined>(
    () => (changes.data && dd.data ? { days: days.days, dd: dd.data, changes: changes.data } : undefined),
    [changes.data, dd.data, days.days],
  );
  const model = useScreenModel(() => new VoyageInvoicingModel(hub, entity), useToastServices(), data, useVoyageActions());
  model?.setContext(hub, entity);

  // load the months the current view needs once the user moves the ribbon or picks a range
  // (state derived during render: React re-renders at once with the new months)
  const needed = model ? model.requiredMonths() : months;
  if (needed.join() !== months.join()) setMonths(needed);

  return {
    vals: model ? model.vals(hub + '|' + entity) : null,
    status: {
      isError: changes.isError || dd.isError || days.isError,
      error: changes.error ?? dd.error ?? days.error,
      retry: () => {
        void changes.refetch();
        void dd.refetch();
        void days.refetch();
      },
    },
  };
}
