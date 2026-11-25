'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  createCustomer,
  customerKeys,
  deleteCustomer,
  updateCustomer,
  type Customer,
  type CustomerUpdate,
  type NewCustomerInput,
} from '@/entities/customer';

export interface CustomerActions {
  create: (input: NewCustomerInput) => Promise<Customer>;
  update: (update: CustomerUpdate) => Promise<Customer>;
  remove: (id: string) => Promise<void>;
}

/** Create / edit / delete customer codes; each refreshes the customer directory. */
export function useCustomerActions(): CustomerActions {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: customerKeys.all });
  const create = useMutation({ mutationFn: createCustomer, onSuccess });
  const update = useMutation({ mutationFn: updateCustomer, onSuccess });
  const remove = useMutation({ mutationFn: deleteCustomer, onSuccess });
  return useMemo(
    () => ({ create: create.mutateAsync, update: update.mutateAsync, remove: remove.mutateAsync }),
    [create.mutateAsync, update.mutateAsync, remove.mutateAsync],
  );
}
