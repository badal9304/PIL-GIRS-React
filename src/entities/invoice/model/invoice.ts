import { z } from 'zod';

/**
 * Invoicing: invoices (with their charge lines), B/Ls ready to invoice, and the changes made in GIRS
 * (generated invoices, status changes, proforma settlement, events, review edits, credit notes).
 */

export const INVOICE_STATUSES = [
  'Draft',
  'Pending validation',
  'Generated',
  'Sent',
  'Accepted',
  'Paid',
  'Rejected',
  'Credited',
  'Cancelled',
] as const;
export const invoiceStatusSchema = z.enum(INVOICE_STATUSES);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const invoiceTypeSchema = z.enum(['Freight', 'DET / DEM', 'MISC', 'Proforma']);
export type InvoiceType = z.infer<typeof invoiceTypeSchema>;

/** charge code, amount, currency, ROE ("1.3412" or "—"), tax code, audit id */
export const invoiceLineSchema = z.tuple([z.string(), z.number(), z.string(), z.string(), z.string(), z.string()]);
export type InvoiceLine = z.infer<typeof invoiceLineSchema>;

export const invoiceSchema = z.object({
  no: z.string(),
  type: invoiceTypeSchema,
  bkg: z.string(),
  bl: z.string(),
  cntr: z.string(),
  vvd: z.string(),
  party: z.string(),
  cust: z.string(),
  status: invoiceStatusSchema,
  due: z.string(),
  /** Government e-invoice reference ("IRN …", "MyInvois …", "—"). */
  gov: z.string(),
  files: z.string(),
  date: z.string(),
  port: z.string(),
  lines: z.array(invoiceLineSchema).min(1),
});
export type Invoice = z.infer<typeof invoiceSchema>;

export const readyStatusSchema = z.enum(['Ready', 'Warning', 'Blocked']);
export type ReadyStatus = z.infer<typeof readyStatusSchema>;

export const checkKindSchema = z.enum(['ok', 'warn', 'block']);
/** [result, text] per check (Customer, Billing Party, Charges, Currency/ROE, Tax Configuration, B/L Data) */
export const readyCheckSchema = z.tuple([checkKindSchema, z.string()]);
export type ReadyCheck = z.infer<typeof readyCheckSchema>;

/** code, quantity, UOM, unit price, tax code, tax rate %, currency (optional, default USD) */
export const readyChargeSchema = z.union([
  z.tuple([z.string(), z.number(), z.string(), z.number(), z.string(), z.number()]),
  z.tuple([z.string(), z.number(), z.string(), z.number(), z.string(), z.number(), z.string()]),
]);
export type ReadyCharge = z.infer<typeof readyChargeSchema>;

/** A B/L from LMS that can be invoiced. */
export const readyItemSchema = z.object({
  id: z.string(),
  bl: z.string(),
  bkg: z.string(),
  cust: z.string(),
  port: z.string(),
  type: invoiceTypeSchema,
  cntr: z.string(),
  vvd: z.string(),
  status: readyStatusSchema,
  msg: z.string(),
  checks: z.array(readyCheckSchema),
  charges: z.array(readyChargeSchema),
});
export type ReadyItem = z.infer<typeof readyItemSchema>;

/** A charge added while reviewing a B/L (values as typed). */
export const addedChargeSchema = z.object({
  code: z.string().default(''),
  qty: z.union([z.string(), z.number()]).default(''),
  uom: z.string().default(''),
  unit: z.union([z.string(), z.number()]).default(''),
  cur: z.string().default(''),
  /** Text in the charge-head box. */
  q: z.string().optional(),
  /** Fields the user has touched (errors show only for those). */
  t: z.record(z.string(), z.number()).optional(),
});
export type AddedCharge = z.infer<typeof addedChargeSchema>;

/** Edits made while reviewing a B/L: billing customer, added charges, tax fixed. */
export const readyEditSchema = z.object({
  id: z.string().optional(),
  cust: z.string().default(''),
  add: z.array(addedChargeSchema).default([]),
  fixed: z.boolean().default(false),
});
export type ReadyEdit = z.infer<typeof readyEditSchema>;

export const creditNoteSchema = z.object({
  no: z.string(),
  orig: z.string(),
  ctype: z.enum(['Full', 'Partial']),
  ref: z.string(),
  reason: z.string(),
  amount: z.number(),
  cur: z.string(),
  taxrev: z.string(),
  appr: z.string(),
  repl: z.string(),
  gov: z.string(),
  audit: z.string(),
});
export type CreditNote = z.infer<typeof creditNoteSchema>;

/** stamp, what happened, by */
export const invoiceEventSchema = z.tuple([z.string(), z.string(), z.string()]);
export type InvoiceEvent = z.infer<typeof invoiceEventSchema>;

export const proformaSettlementSchema = z.enum(['converted', 'transferred']);

/** Changes made in GIRS on top of the LMS / ERP data. */
export const invoiceChangesSchema = z.object({
  /** Invoices generated in GIRS (newest first). */
  gen: z.array(invoiceSchema).default([]),
  /** Status overrides by invoice no. */
  st: z.record(z.string(), invoiceStatusSchema).default({}),
  /** Proforma settlement by invoice no. */
  prf: z.record(z.string(), proformaSettlementSchema).default({}),
  /** Activity by invoice no. */
  ev: z.record(z.string(), z.array(invoiceEventSchema)).default({}),
  /** Review edits by ready-item id. */
  rdy: z.record(z.string(), readyEditSchema).default({}),
  /** Ready items already invoiced. */
  done: z.array(z.string()).default([]),
  cn: z.array(creditNoteSchema).default([]),
});
export type InvoiceChanges = z.infer<typeof invoiceChangesSchema>;

export const EMPTY_INVOICE_CHANGES: InvoiceChanges = { gen: [], st: {}, prf: {}, ev: {}, rdy: {}, done: [], cn: [] };

/** Everything the Invoice List works on. */
export const invoiceWorkspaceSchema = z.object({
  invoices: z.array(invoiceSchema),
  ready: z.array(readyItemSchema),
  changes: invoiceChangesSchema,
});
export type InvoiceWorkspace = z.infer<typeof invoiceWorkspaceSchema>;
