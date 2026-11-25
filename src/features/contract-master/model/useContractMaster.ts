'use client';

import { useQuery } from '@tanstack/react-query';
import { contractDirectoryQuery } from '@/entities/contract';
import { useToastServices } from '@/entities/notification';
import { useQueryScreen } from '@/shared/hooks/useQueryScreen';
import { useContractActions } from '../api/changeRequest';
import { ContractMasterCModel } from './layoutCModel';
import { ContractMasterDModel } from './layoutDModel';

/** Contract Master layout C: values (null while loading) and load status. */
export function useContractMasterC() {
  return useQueryScreen(useQuery(contractDirectoryQuery()), () => new ContractMasterCModel(), useToastServices(), useContractActions());
}

/** Contract Master layout D: values (null while loading) and load status. */
export function useContractMasterD() {
  return useQueryScreen(useQuery(contractDirectoryQuery()), () => new ContractMasterDModel(), useToastServices(), useContractActions());
}
