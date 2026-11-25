export const invoiceKeys = {
  all: ['invoices'] as const,
  workspace: () => [...invoiceKeys.all, 'workspace'] as const,
};
