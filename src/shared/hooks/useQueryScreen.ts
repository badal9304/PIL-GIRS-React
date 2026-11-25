'use client';

import type { ScreenModel, ScreenServices, ScreenStatus } from '../lib/screenModel';
import { useScreenModel } from './useScreenModel';

/**
 * A screen model fed by one query: returns the view values (null until the data loads) and the load status.
 * `key` re-renders the values when inputs kept outside the model state change (e.g. the top-bar location).
 */
/** The parts of a query result (or several combined) a screen needs. */
export interface QueryState<D> {
  data: D | undefined;
  isError: boolean;
  error: Error | null;
  refetch: () => unknown;
}

export function useQueryScreen<D, A, V>(
  query: QueryState<D>,
  create: () => ScreenModel<object, V, D, A>,
  services: ScreenServices,
  actions: A,
  key = '',
): { vals: V | null; status: ScreenStatus } {
  const model = useScreenModel(create, services, query.data, actions);
  return {
    vals: model ? model.vals(key) : null,
    status: { isError: query.isError, error: query.error, retry: () => void query.refetch() },
  };
}
