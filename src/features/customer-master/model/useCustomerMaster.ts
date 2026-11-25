'use client';

import { useQuery } from '@tanstack/react-query';
import { customerDirectoryQuery } from '@/entities/customer';
import { useToastServices } from '@/entities/notification';
import { useQueryScreen } from '@/shared/hooks/useQueryScreen';
import { useCustomerActions } from '../api/customerMutations';
import { CustomerMasterCModel } from './layoutCModel';
import { CustomerMasterDModel } from './layoutDModel';

/** Customer Master layout C: values (null while loading) and load status. */
export function useCustomerMasterC() {
  return useQueryScreen(useQuery(customerDirectoryQuery()), () => new CustomerMasterCModel(), useToastServices(), useCustomerActions());
}

/** Customer Master layout D: values (null while loading) and load status. */
export function useCustomerMasterD() {
  return useQueryScreen(useQuery(customerDirectoryQuery()), () => new CustomerMasterDModel(), useToastServices(), useCustomerActions());
}
