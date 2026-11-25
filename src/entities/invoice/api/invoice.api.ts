import { serve } from '@/shared/api';
import { readJson, writeJson } from '@/shared/lib/storage';
import { z } from 'zod';
import {
  EMPTY_INVOICE_CHANGES,
  creditNoteSchema,
  invoiceChangesSchema,
  invoiceWorkspaceSchema,
  type CreditNote,
  type InvoiceChanges,
  type InvoiceWorkspace,
} from '../model/invoice';
import { INVOICE_SEED, READY_SEED } from './invoice.seed';

/**
 * Invoicing API. Invoices and ready B/Ls are sample data until the ERP / LMS APIs are connected; the changes made
 * in GIRS are kept in this browser (same key as the prototype).
 */
const CHANGES_KEY = 'girs.inv.v1';
const CREDIT_NOTES_KEY = 'girs.cn.v1';

export function fetchInvoiceWorkspace(): Promise<InvoiceWorkspace> {
  return serve('invoicing/workspace', invoiceWorkspaceSchema, () => ({
    invoices: INVOICE_SEED,
    ready: READY_SEED,
    changes: readJson(CHANGES_KEY, invoiceChangesSchema, EMPTY_INVOICE_CHANGES),
  }));
}

/** Saves the GIRS changes (generated invoices, status changes, events, review edits, credit notes). */
export async function saveInvoiceChanges(changes: InvoiceChanges): Promise<InvoiceChanges> {
  const valid = await serve('invoicing/changes:save', invoiceChangesSchema, () => changes);
  writeJson(CHANGES_KEY, valid);
  return valid;
}

/** Sends a credit note request to the Credit Note List. */
export async function submitCreditNote(cn: CreditNote): Promise<CreditNote> {
  const valid = creditNoteSchema.parse(cn);
  writeJson(CREDIT_NOTES_KEY, [valid, ...readJson(CREDIT_NOTES_KEY, z.array(creditNoteSchema), [])]);
  return valid;
}
