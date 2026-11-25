import { z } from 'zod';

/**
 * Customer Master: customer codes grouped under parent customer groups (one legal entity, one tax ID).
 * A customer code is a billing party per country.
 */
export const COUNTRIES = { SG: 'Singapore', MY: 'Malaysia', IN: 'India', CN: 'China', TH: 'Thailand' } as const;
export type CountryCode = keyof typeof COUNTRIES;
export const isCountryCode = (v: string): v is CountryCode => Object.prototype.hasOwnProperty.call(COUNTRIES, v);

/** Sanction / Blacklist screening result. */
export const sanctionSchema = z.enum(['ok', 'sanc', 'black']);
export type SanctionStatus = z.infer<typeof sanctionSchema>;
export const SANCTION_LABEL: Readonly<Record<SanctionStatus, string>> = { ok: 'Not listed', sanc: 'Sanctioned', black: 'Blacklisted' };

export const arrangementSchema = z.enum(['Default', 'Split']);
export type InvoicingArrangement = z.infer<typeof arrangementSchema>;

export const customerGroupSchema = z.object({
  name: z.string().min(1),
  legal: z.string().min(1),
  arr: arrangementSchema,
  tax: z.string().min(1),
  terms: z.string().min(1),
  /** JSON delivery in addition to PDF (default: on). */
  json: z.boolean().optional(),
});
export type CustomerGroup = z.infer<typeof customerGroupSchema>;

export const customerSchema = z.object({
  id: z.string().min(1),
  code: z.string().regex(/^[A-Z]{2}-\d{6}$/),
  name: z.string().min(1),
  /** Parent customer group id. */
  g: z.string().min(1),
  ctry: z.string().length(2),
  st: sanctionSchema,
  /** LMS Customer Master Data reference. */
  ref: z.string(),
  addr: z.string(),
  email: z.string(),
});
export type Customer = z.infer<typeof customerSchema>;

/** contract no., trade lane, validity, approval */
export const customerContractSchema = z.tuple([z.string(), z.string(), z.string(), z.string()]);

export const customerDirectorySchema = z.object({
  groups: z.record(z.string(), customerGroupSchema),
  customers: z.array(customerSchema),
  /** Contracts per customer code. */
  contracts: z.record(z.string(), z.array(customerContractSchema)),
});
export type CustomerDirectory = z.infer<typeof customerDirectorySchema>;

/** Whether the group's documents are also delivered as JSON. */
export const deliversJson = (dir: CustomerDirectory, c: Customer): boolean => dir.groups[c.g]?.json ?? c.g !== 'gC';

/** Changes made in GIRS (create / edit / delete), applied over the LMS directory. */
export const customerChangesSchema = z.object({
  add: z.array(customerSchema).default([]),
  del: z.array(z.string()).default([]),
  groups: z.record(z.string(), customerGroupSchema).default({}),
  gedit: z.record(z.string(), customerGroupSchema.partial()).default({}),
  edit: z.record(z.string(), customerSchema.partial()).default({}),
});
export type CustomerChanges = z.infer<typeof customerChangesSchema>;

export const newCustomerInputSchema = z.object({
  code: z.string().regex(/^[A-Z]{2}-\d{6}$/),
  name: z.string().min(1),
  ctry: z.string().length(2),
  st: sanctionSchema,
  addr: z.string().min(10),
  email: z.email(),
  /** Existing group id, or a new group. */
  group: z.union([z.object({ id: z.string() }), z.object({ newName: z.string().min(1) })]),
  groupFields: customerGroupSchema.omit({ name: true }),
});
export type NewCustomerInput = z.infer<typeof newCustomerInputSchema>;

export const customerUpdateSchema = z.object({
  id: z.string(),
  customer: customerSchema.pick({ name: true, email: true, addr: true, st: true }),
  groupFields: customerGroupSchema.omit({ name: true }),
});
export type CustomerUpdate = z.infer<typeof customerUpdateSchema>;
