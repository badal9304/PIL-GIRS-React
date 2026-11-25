import { readStore, writeStore } from '@/shared/lib/storage';
import { paperHtml } from './html';
import { buildPdf } from './pdf';
import { DOCUMENT_CSS } from './styles';
import { esc, invoiceModel, receiptModel, type DocModel, type InvoiceDocInput, type ReceiptDocInput } from './model';

/** Document viewer (full-screen preview with print, PDF and JSON download) and file downloads. */

export interface ShowOptions {
  /** Data offered as "Download JSON" (e-invoice payload), or null. */
  json?: unknown;
  /** Called with a status message after a download. */
  onDone?: (message: string) => void;
}

const ORIENT_KEY = 'girs.inv.orient';
let openEl: HTMLElement | null = null;
let lastFocus: Element | null = null;

function saveFile(name: string, data: Blob | string, type: string): void {
  const b = data instanceof Blob ? data : new Blob([data], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function downloadPdf(models: readonly DocModel[], name?: string): void {
  const file = name || models[0]?.file || 'document';
  saveFile(file + '.pdf', buildPdf(models, file), 'application/pdf');
}

function close(): void {
  if (!openEl) return;
  openEl.remove();
  openEl = null;
  document.removeEventListener('keydown', onKey, true);
  if (lastFocus instanceof HTMLElement) lastFocus.focus();
}

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    close();
    return;
  }
  if (e.key === 'Tab' && openEl) {
    const f = openEl.querySelectorAll<HTMLButtonElement>('button');
    const first = f[0];
    const last = f[f.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function ensureCss(): void {
  if (document.getElementById('gd-css')) return;
  const s = document.createElement('style');
  s.id = 'gd-css';
  s.textContent = DOCUMENT_CSS;
  document.head.appendChild(s);
}

function printDoc(m: DocModel): void {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(
    '<!doctype html><title>' +
      esc(m.file) +
      '</title><style>' +
      DOCUMENT_CSS +
      'body{margin:0}.gd-paper,.gi,.gl{box-shadow:none;margin:0}@page{size:A4' +
      (m.kind !== 'receipt' && m.orient === 'l' ? ' landscape' : '') +
      ';margin:0}</style>' +
      paperHtml(m),
  );
  w.document.close();
  window.setTimeout(() => {
    w.focus();
    w.print();
  }, 400);
}

function show(m: DocModel, opts: ShowOptions = {}): void {
  ensureCss();
  close();
  lastFocus = document.activeElement;
  const label = m.kind === 'receipt' ? 'Receipt' : m.kind === 'credit' ? 'Credit note' : 'Invoice';
  const isInv = m.kind !== 'receipt';
  if (isInv) m.orient = readStore(ORIENT_KEY) === 'l' ? 'l' : 'p';
  const ori = (v: 'p' | 'l', t: string, icon: string) =>
    '<button class="gd-seg-b" data-a="ori" data-v="' +
    v +
    '" aria-pressed="' +
    (isInv && m.orient === v) +
    '" title="' +
    t +
    '">' +
    icon +
    t +
    '</button>';
  const el = document.createElement('div');
  el.className = 'gd-scrim';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', label + ' ' + m.no);
  el.innerHTML =
    '<div class="gd-bar"><div class="t">' +
    label +
    '<span>' +
    esc(m.no) +
    '</span></div>' +
    (isInv
      ? '<div class="gd-seg" role="group" aria-label="Page orientation">' +
        ori(
          'p',
          'Portrait',
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="1.5"/></svg>',
        ) +
        ori(
          'l',
          'Landscape',
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="1.5"/></svg>',
        ) +
        '</div>'
      : '') +
    (opts.json ? '<button class="gd-btn" data-a="json">Download JSON</button>' : '') +
    '<button class="gd-btn" data-a="print">Print</button>' +
    '<button class="gd-btn p" data-a="pdf"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>Download PDF</button>' +
    '<button class="gd-x" data-a="close" aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
    '<div class="gd-scroll">' +
    paperHtml(m) +
    '</div>';
  el.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const b = target?.closest('[data-a]') ?? null;
    if (!b) {
      if (target === el || target?.classList.contains('gd-scroll')) close();
      return;
    }
    const a = b.getAttribute('data-a');
    if (a === 'close') close();
    else if (a === 'ori' && isInv) {
      m.orient = b.getAttribute('data-v') === 'l' ? 'l' : 'p';
      writeStore(ORIENT_KEY, m.orient);
      const scroll = el.querySelector('.gd-scroll');
      if (scroll) scroll.innerHTML = paperHtml(m);
      el.querySelectorAll('[data-a="ori"]').forEach((x) => x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === m.orient)));
    } else if (a === 'pdf') {
      downloadPdf([m]);
      opts.onDone?.(m.file + '.pdf downloaded');
    } else if (a === 'json') {
      saveFile(m.file + '.json', JSON.stringify(opts.json, null, 2), 'application/json');
      opts.onDone?.(m.file + '.json downloaded');
    } else if (a === 'print') printDoc(m);
  });
  document.body.appendChild(el);
  openEl = el;
  document.addEventListener('keydown', onKey, true);
  el.querySelector<HTMLButtonElement>('[data-a="pdf"]')?.focus();
}

/** Invoice, credit note and receipt documents: preview, PDF and JSON download. */
export const invoiceDocuments = {
  /** Opens the invoice / credit note preview. */
  invoice: (inv: InvoiceDocInput, opts?: ShowOptions): void => show(invoiceModel(inv), opts),
  receipt: (rc: ReceiptDocInput, opts?: ShowOptions): void => show(receiptModel(rc), opts),
  /** Downloads one PDF with every invoice in the list. */
  invoicePdf: (list: InvoiceDocInput | readonly InvoiceDocInput[], name?: string): void =>
    downloadPdf((Array.isArray(list) ? list : [list]).map(invoiceModel), name),
  receiptPdf: (rc: ReceiptDocInput): void => downloadPdf([receiptModel(rc)]),
  json: (name: string, obj: unknown): void => saveFile(name + '.json', JSON.stringify(obj, null, 2), 'application/json'),
  /** The document fields (used by Ready to invoice to preview totals). */
  model: invoiceModel,
  close,
};
