import { z } from 'zod';

/**
 * Voyage invoicing (Home): voyages loading (E) or discharging (I) at the working location per day, their B/L
 * invoicing state, D&D containers, and the actions taken in GIRS (generated invoices, follow-ups, ROE).
 */

/** invoiced, ready, ROE not received, data not received, split-payer unconfirmed (B/L counts) */
export const blStateSchema = z.tuple([z.number(), z.number(), z.number(), z.number(), z.number()]);

export const voyageSchema = z.object({
  /** Unique per day: voyage no. + "@" + date. */
  id: z.string(),
  no: z.string(),
  dir: z.enum(['E', 'I']),
  vessel: z.string(),
  svc: z.string(),
  ent: z.string(),
  pol: z.string(),
  pod: z.string(),
  /** Working location (port) and the other end of the leg. */
  here: z.string(),
  other: z.string(),
  date: z.string(),
  /** B/Ls on the voyage. */
  bls: z.number().int().nonnegative(),
  /** Average B/L amount (USD). */
  avg: z.number(),
  st: blStateSchema,
  /** Currency pair needing an ROE ("USD → SGD"). */
  pair: z.string(),
});
export type Voyage = z.infer<typeof voyageSchema>;

/** Voyages by date (ISO) for one port and month. */
export const voyageMonthSchema = z.record(z.string(), z.array(voyageSchema));
export type VoyageMonth = z.infer<typeof voyageMonthSchema>;

export const ddStatusSchema = z.enum(['ready', 'roe', 'tariff', 'milestone', 'waiver', 'out', 'invoiced']);
export type DdStatus = z.infer<typeof ddStatusSchema>;

export const ddContainerSchema = z.object({
  cn: z.string(),
  sz: z.string(),
  cust: z.string(),
  dir: z.enum(['E', 'I']),
  bl: z.string(),
  /** Gate-out date. */
  out: z.string(),
  /** Return date ("" while with the customer). */
  back: z.string(),
  /** Free days. */
  free: z.number(),
  type: z.string(),
  st: ddStatusSchema,
});
export type DdContainer = z.infer<typeof ddContainerSchema>;

/** A charge added while reviewing a B/L. */
export const addedBlChargeSchema = z.object({
  code: z.string().default(''),
  q: z.string().optional(),
  qty: z.union([z.string(), z.number()]).default(''),
  uom: z.string().default(''),
  unit: z.union([z.string(), z.number()]).default(''),
  cur: z.string().default(''),
  t: z.record(z.string(), z.number()).optional(),
});
export type AddedBlCharge = z.infer<typeof addedBlChargeSchema>;

export const blEditSchema = z.object({ cust: z.string(), add: z.array(addedBlChargeSchema).default([]) });
export type BlEdit = z.infer<typeof blEditSchema>;

/** Actions taken in GIRS (kept per user). */
export const voyageChangesSchema = z.object({
  /** B/Ls generated in bulk per voyage id. */
  gen: z.record(z.string(), z.number()).default({}),
  /** B/Ls generated one by one: voyage id -> { B/L index: 1 }. */
  blGen: z.record(z.string(), z.record(z.string(), z.number())).default({}),
  /** Review edits per B/L ("voyage id#index"). */
  riEd: z.record(z.string(), blEditSchema).default({}),
  /** Follow-ups sent: key -> time. */
  fu: z.record(z.string(), z.string()).default({}),
  /** ROE requested per currency pair -> time. */
  roeReq: z.record(z.string(), z.string()).default({}),
  /** ROE entered per currency pair. */
  roeSet: z.record(z.string(), z.number()).default({}),
  /** D&D containers invoiced. */
  ddGen: z.record(z.string(), z.number()).default({}),
  /** D&D chases sent per reason -> time. */
  ddAct: z.record(z.string(), z.string()).default({}),
});
export type VoyageChanges = z.infer<typeof voyageChangesSchema>;

export const EMPTY_VOYAGE_CHANGES: VoyageChanges = { gen: {}, blGen: {}, riEd: {}, fu: {}, roeReq: {}, roeSet: {}, ddGen: {}, ddAct: {} };

export const VOYAGE_CHANGE_KEYS = ['gen', 'blGen', 'riEd', 'fu', 'roeReq', 'roeSet', 'ddGen', 'ddAct'] as const;
