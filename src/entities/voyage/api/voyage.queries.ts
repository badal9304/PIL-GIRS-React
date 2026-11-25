import { queryOptions } from '@tanstack/react-query';
import { fetchDdContainers, fetchVoyageChanges, fetchVoyageMonth } from './voyage.api';
import { voyageKeys } from './voyage.keys';

export const voyageMonthQuery = (port: string, month: string) =>
  queryOptions({ queryKey: voyageKeys.month(port, month), queryFn: () => fetchVoyageMonth(port, month) });

export const ddContainersQuery = (cc: string) =>
  queryOptions({ queryKey: voyageKeys.ddContainers(cc), queryFn: () => fetchDdContainers(cc) });

export const voyageChangesQuery = () => queryOptions({ queryKey: voyageKeys.changes(), queryFn: fetchVoyageChanges });
