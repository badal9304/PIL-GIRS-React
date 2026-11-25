export const contractKeys = {
  all: ['contracts'] as const,
  directory: () => [...contractKeys.all, 'directory'] as const,
};
