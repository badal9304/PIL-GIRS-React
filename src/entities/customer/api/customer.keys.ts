export const customerKeys = {
  all: ['customers'] as const,
  directory: () => [...customerKeys.all, 'directory'] as const,
};
