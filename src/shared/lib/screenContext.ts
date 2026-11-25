import { z } from 'zod';
import { readStore, removeStore, writeStore } from './storage';

/**
 * Hand-off between screens: an action on one screen (e.g. Invoice List → "Request refund") stores what was
 * selected, then opens the target screen, which takes the context once and pre-selects the record.
 */
const KEY = 'girs.ctx';
const TTL_MS = 10 * 60 * 1000;

const screenContextSchema = z.object({
  page: z.string(),
  action: z.string().optional(),
  label: z.string().optional(),
  inv: z.string().optional(),
  fromName: z.string().optional(),
  back: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  at: z.number().optional(),
});

export type ScreenContext = z.infer<typeof screenContextSchema>;

export function putScreenContext(ctx: Omit<ScreenContext, 'at'>): void {
  writeStore(KEY, JSON.stringify({ ...ctx, at: Date.now() }));
}

/** Returns the context meant for `page` (once), or null. */
export function takeScreenContext(page: string): ScreenContext | null {
  const raw = readStore(KEY);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = screenContextSchema.safeParse(parsed);
  if (!result.success || result.data.page !== page || Date.now() - (result.data.at ?? 0) > TTL_MS) return null;
  removeStore(KEY);
  return result.data;
}
