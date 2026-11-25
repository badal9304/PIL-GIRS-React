import { serve } from '@/shared/api';
import { contractDirectorySchema, type ContractDirectory } from '../model/contract';
import { CONTRACT_SEED } from './contract.seed';

/** Contracts with their rates and versions (sample data until the contract service is connected). */
export function fetchContractDirectory(): Promise<ContractDirectory> {
  return serve('contracts', contractDirectorySchema, () => CONTRACT_SEED);
}
