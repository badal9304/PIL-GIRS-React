import { queryOptions } from '@tanstack/react-query';
import { fetchInvoiceWorkspace } from './invoice.api';
import { invoiceKeys } from './invoice.keys';

export const invoiceWorkspaceQuery = () => queryOptions({ queryKey: invoiceKeys.workspace(), queryFn: fetchInvoiceWorkspace });
