import { queryOptions } from '@tanstack/react-query';
import { fetchCustomerDirectory } from './customer.api';
import { customerKeys } from './customer.keys';

export const customerDirectoryQuery = () => queryOptions({ queryKey: customerKeys.directory(), queryFn: fetchCustomerDirectory });
