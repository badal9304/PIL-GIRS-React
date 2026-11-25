import { z } from 'zod';

/** A change to master data waiting in the approvals inbox. */
export const changeRequestInputSchema = z.object({
  screen: z.string().min(1),
  kind: z.enum(['new', 'edit', 'copy', 'delete', 'activate', 'deactivate']),
  code: z.string(),
  changes: z.record(z.string(), z.string()),
  reason: z.string().optional(),
});
export type ChangeRequestInput = z.infer<typeof changeRequestInputSchema>;

export const changeRequestSchema = changeRequestInputSchema.extend({
  requestNo: z.string().regex(/^REQ-\d{6}$/),
  submittedAt: z.string(),
});
export type ChangeRequest = z.infer<typeof changeRequestSchema>;
