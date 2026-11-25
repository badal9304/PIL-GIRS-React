export const chargeKeys = {
  all: ['charges'] as const,
  directory: () => [...chargeKeys.all, 'directory'] as const,
};
