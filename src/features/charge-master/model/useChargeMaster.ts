'use client';

import { useQueries } from '@tanstack/react-query';
import { chargeDirectoryQuery } from '@/entities/charge';
import { contractDirectoryQuery } from '@/entities/contract';
import { useToastServices } from '@/entities/notification';
import { useQueryScreen, type QueryState } from '@/shared/hooks/useQueryScreen';
import { useChargeActions } from '../api/changeRequest';
import { ChargeMasterCModel } from './layoutCModel';
import { ChargeMasterDModel, type ChargeScreenData } from './layoutDModel';

/** Charges plus the contracts that price them, as one query state (the combined object is memoised by TanStack). */
function useChargeScreenData(): QueryState<ChargeScreenData> {
  return useQueries({
    queries: [chargeDirectoryQuery(), contractDirectoryQuery()],
    combine: ([charges, contracts]) => ({
      data: charges.data && contracts.data ? { charges: charges.data, contracts: contracts.data } : undefined,
      isError: charges.isError || contracts.isError,
      error: charges.error ?? contracts.error,
      refetch: () => Promise.all([charges.refetch(), contracts.refetch()]),
    }),
  });
}

/** Charge Master layout C: values (null while loading) and load status. */
export function useChargeMasterC() {
  return useQueryScreen(useChargeScreenData(), () => new ChargeMasterCModel(), useToastServices(), useChargeActions());
}

/** Charge Master layout D: values (null while loading) and load status. */
export function useChargeMasterD() {
  return useQueryScreen(useChargeScreenData(), () => new ChargeMasterDModel(), useToastServices(), useChargeActions());
}
