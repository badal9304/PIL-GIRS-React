import { hasJson, invoiceDocData, invoiceDocuments, mainAmount, receiptDocData, toUsd, type Invoice } from '@/entities/invoice';
import { currentLegacyPage, navigateTo } from '@/shared/lib/navigationBridge';
import { readJson, writeJson } from '@/shared/lib/storage';
import { putScreenContext } from '@/shared/lib/screenContext';
import { z } from 'zod';
import { DEFAULT_COLUMNS, isInvoiceColumn, type InvoiceColumn } from '@/entities/invoice';

/** Side effects of Invoice List actions: documents, downloads, opening other screens, column choice. */

type Toast = (message: string) => void;
type DocInvoice = Invoice & { st2?: string; pay?: string };

/** Prototype names of linked screens -> app screens. */
const LINK: Readonly<Record<string, string>> = {
  'CreditNoteList.dc.html': 'credit-note-list.html',
  'SOADashboard.dc.html': 'soa-aging.html',
  'Receipting.dc.html': 'receipting.html',
  'CashAppWorkbench.dc.html': 'cashapp-workbench.html',
  'ManualInvoice.dc.html': 'manual-invoice.html',
  'InvoiceGenerate.dc.html': 'invoice-generate.html',
  'InvoiceListB.dc.html': 'invoice-list-b.html',
  'InvoiceListC.dc.html': 'invoice-list-c.html',
  'InvoiceListD.dc.html': 'invoice-list-d.html',
  'InvoiceList.dc.html': 'invoice-list-v2.html',
};

/** Opens another screen, optionally with a search. */
export function goTo(page: string, q?: string): void {
  navigateTo((LINK[page] ?? page) + (q ? '?q=' + encodeURIComponent(q) : ''));
}

/** Opens another screen with this invoice pre-selected (see shared/lib/screenContext). */
export function handOff(i: Invoice, page: string, act: string, label: string): void {
  const target = LINK[page] ?? page;
  const usd = i.lines.reduce((a, l) => a + toUsd(l[1], l[2]), 0);
  putScreenContext({
    page: target,
    action: act,
    label,
    inv: i.no,
    fromName: 'Invoice List',
    back: currentLegacyPage(),
    data: {
      bl: i.bl,
      bkg: i.bkg,
      cust: i.cust,
      party: i.party,
      cur: i.lines[0][2],
      amt: mainAmount(i),
      usd: Math.round(usd * 100) / 100,
      date: i.date,
      due: i.due,
      status: i.status,
      type: i.type,
      port: i.port,
    },
  });
  navigateTo(target + '?q=' + encodeURIComponent(act === 'soa' ? i.cust : act === 'manual' ? i.bl : i.no));
}

/** Saves text as a file. */
export function saveTextFile(name: string, text: string, type: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export const viewInvoice = (i: DocInvoice, toast?: Toast): void =>
  invoiceDocuments.invoice(invoiceDocData(i), { json: hasJson(i) ? invoiceDocData(i) : null, onDone: toast });

export function downloadPdf(i: DocInvoice, toast: Toast): void {
  invoiceDocuments.invoicePdf(invoiceDocData(i));
  toast(i.no + '.pdf downloaded');
}

export function downloadJson(i: DocInvoice, toast: Toast): void {
  invoiceDocuments.json('Invoice-' + i.no, invoiceDocData(i));
  toast(i.no + '.json downloaded');
}

/** PDF, plus JSON when the invoice has an e-invoice payload. */
export function downloadInvoice(i: DocInvoice, toast: Toast): void {
  downloadPdf(i, toast);
  if (hasJson(i))
    window.setTimeout(() => {
      invoiceDocuments.json('Invoice-' + i.no, invoiceDocData(i));
      toast(i.no + ' downloaded as PDF and JSON');
    }, 500);
}

export const viewReceipt = (i: Invoice, toast: Toast): void => invoiceDocuments.receipt(receiptDocData(i), { onDone: toast });

const COLUMNS_KEY = 'girs.inv.cols';

/** Columns the user chose (kept in this browser). */
export function loadColumns(): InvoiceColumn[] {
  const v = readJson(COLUMNS_KEY, z.array(z.string()).nullable(), null);
  return v ? v.filter(isInvoiceColumn) : [...DEFAULT_COLUMNS];
}

export function saveColumns(cols: readonly string[]): void {
  writeJson(COLUMNS_KEY, cols);
}
