import { z } from 'zod';

/** Charge Master: charge codes with category, applicability, tax / currency set-up and LMS mapping. */
export const CHARGE_CATEGORIES = [
  'Freight',
  'Surcharge',
  'Origin local charges',
  'Destination local charges',
  'Demurrage & Detention',
  'Ancillary (MISC)',
] as const;
export const chargeCategorySchema = z.enum(CHARGE_CATEGORIES);
export type ChargeCategory = z.infer<typeof chargeCategorySchema>;

export const applicabilitySchema = z.enum(['Both', 'Origin', 'Destination']);
export type Applicability = z.infer<typeof applicabilitySchema>;

/** change, by, date & time */
export const auditEntrySchema = z.object({ a: z.string(), b: z.string(), c: z.string() });
export type AuditEntry = z.infer<typeof auditEntrySchema>;

const isoDateOrOpen = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal('')]);

export const chargeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  cat: chargeCategorySchema,
  app: applicabilitySchema,
  /** Country code or "ALL". */
  ctry: z.string(),
  /** UN/LOCODE or "ALL". */
  port: z.string(),
  tax: z.string(),
  ccy: z.string().length(3),
  from: isoDateOrOpen,
  /** "" = open-ended. */
  to: isoDateOrOpen,
  /** LMS charge code ("" = maintained in GIRS only). */
  lms: z.string(),
  active: z.boolean(),
  /** Oldest first. */
  audit: z.array(auditEntrySchema),
});
export type Charge = z.infer<typeof chargeSchema>;

export const chargeDirectorySchema = z.object({
  charges: z.array(chargeSchema),
  countries: z.record(z.string(), z.string()),
  /** UN/LOCODE -> [country code, port name]. */
  ports: z.record(z.string(), z.tuple([z.string(), z.string()])),
  taxDescriptions: z.record(z.string(), z.string()),
});
export type ChargeDirectory = z.infer<typeof chargeDirectorySchema>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2026-01-01" -> "1 Jan 2026"; "" -> "Open-ended". */
export const formatChargeDate = (iso: string): string => {
  if (!iso) return 'Open-ended';
  const [y, m, d] = iso.split('-');
  return Number(d) + ' ' + (MONTHS[Number(m) - 1] ?? '') + ' ' + y;
};

export const effectiveText = (h: Charge): string => formatChargeDate(h.from) + ' – ' + (h.to ? formatChargeDate(h.to) : 'open');

export const portText = (dir: ChargeDirectory, h: Charge): string =>
  h.port === 'ALL' ? 'All ports' : h.port + ' · ' + (dir.ports[h.port]?.[1] ?? h.port);

/** Where the charge applies: port, plus the country when it adds information. */
export const whereText = (dir: ChargeDirectory, h: Charge): string =>
  portText(dir, h) +
  (h.ctry === 'ALL'
    ? ''
    : h.port !== 'ALL' && dir.ports[h.port]?.[1] === dir.countries[h.ctry]
      ? ''
      : ', ' + (dir.countries[h.ctry] ?? h.ctry));
