export const searchIndexKeys = {
  all: ['search-index'] as const,
  items: () => [...searchIndexKeys.all, 'items'] as const,
};
