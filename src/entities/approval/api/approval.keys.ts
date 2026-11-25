export const approvalKeys = {
  all: ['approvals'] as const,
  requests: () => [...approvalKeys.all, 'requests'] as const,
};
