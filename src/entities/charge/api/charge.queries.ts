import { queryOptions } from '@tanstack/react-query';
import { fetchChargeDirectory } from './charge.api';
import { chargeKeys } from './charge.keys';

export const chargeDirectoryQuery = () => queryOptions({ queryKey: chargeKeys.directory(), queryFn: fetchChargeDirectory });
