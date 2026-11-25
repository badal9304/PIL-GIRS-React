export const voyageKeys = {
  all: ['voyages'] as const,
  month: (port: string, month: string) => [...voyageKeys.all, 'month', port, month] as const,
  ddContainers: (cc: string) => [...voyageKeys.all, 'dd', cc] as const,
  changes: () => [...voyageKeys.all, 'changes'] as const,
};
