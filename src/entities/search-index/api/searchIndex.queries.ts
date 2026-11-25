import { queryOptions } from '@tanstack/react-query';
import { fetchSearchItems } from './searchIndex.api';
import { searchIndexKeys } from './searchIndex.keys';

export const searchItemsQuery = () => queryOptions({ queryKey: searchIndexKeys.items(), queryFn: fetchSearchItems });
