import { queryOptions } from '@tanstack/react-query';
import { fetchContractDirectory } from './contract.api';
import { contractKeys } from './contract.keys';

export const contractDirectoryQuery = () => queryOptions({ queryKey: contractKeys.directory(), queryFn: fetchContractDirectory });
