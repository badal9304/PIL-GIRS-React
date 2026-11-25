import { z } from 'zod';

/** Contract Master: customer-specific rates, tax set-up and admin fee per contract, versioned and approved. */
export const approvalStatusSchema = z.enum(['Approved', 'Pending approval', 'Draft', 'Rejected']);
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export const APPROVAL_STATUSES: readonly ApprovalStatus[] = approvalStatusSchema.options;

export const adminFeeSchema = z.union([
  z.object({ on: z.literal(true), amt: z.number().nonnegative(), ccy: z.string().length(3), ent: z.string() }),
  z.object({ on: z.literal(false), ent: z.string() }),
]);
export type AdminFee = z.infer<typeof adminFeeSchema>;

export const contractRateSchema = z.object({ code: z.string(), name: z.string(), rate: z.number(), ccy: z.string().length(3) });
export type ContractRate = z.infer<typeof contractRateSchema>;

export const contractVersionSchema = z.object({
  n: z.number().int().positive(),
  st: approvalStatusSchema,
  what: z.string(),
  by: z.string(),
  at: z.string(),
});
export type ContractVersion = z.infer<typeof contractVersionSchema>;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const contractSchema = z.object({
  id: z.string(),
  no: z.string(),
  /** Customer code. */
  cus: z.string(),
  cusName: z.string(),
  from: isoDate,
  to: isoDate,
  lane: z.string(),
  terms: z.string(),
  tax: z.enum(['Taxable', 'Zero-rated']),
  taxCode: z.string(),
  adm: adminFeeSchema,
  /** Current version number. */
  ver: z.number().int().positive(),
  st: approvalStatusSchema,
  rates: z.array(contractRateSchema),
  vers: z.array(contractVersionSchema),
});
export type Contract = z.infer<typeof contractSchema>;

export const contractDirectorySchema = z.object({
  contracts: z.array(contractSchema),
  /** Customer code -> name, in display order. */
  customers: z.record(z.string(), z.string()),
  taxDescriptions: z.record(z.string(), z.string()),
});
export type ContractDirectory = z.infer<typeof contractDirectorySchema>;

/** Contract dates are compared with this business date (sample data). */
export const CONTRACT_TODAY = '2026-11-11';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2026-01-01" -> "1 Jan 2026" */
export const formatContractDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return Number(d) + ' ' + (MONTHS[Number(m) - 1] ?? '') + ' ' + y;
};

export const validityText = (c: Contract): string => formatContractDate(c.from) + ' – ' + formatContractDate(c.to);

export type ValidityState = 'Expired' | 'Upcoming' | 'In force';
export const validityState = (c: Contract, today = CONTRACT_TODAY): ValidityState =>
  c.to < today ? 'Expired' : c.from > today ? 'Upcoming' : 'In force';

export const formatAmount = (v: number): string => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const adminFeeText = (c: Contract): string =>
  c.adm.on ? c.adm.ccy + ' ' + formatAmount(c.adm.amt) + ' per DD invoice' : 'Not applied';
