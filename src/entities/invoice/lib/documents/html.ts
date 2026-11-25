import qrcode from 'qrcode-generator';
import { LOGO_JPEG_BASE64 } from './logo';
import { esc, type DocModel, type InvoiceDocModel, type Pair, type Stamp } from './model';

/** Screen renderer: the document as HTML "paper" (invoice portrait / landscape, receipt). */

/** Badge colours, same as the Invoice Status chip on the list screens. */
export const CHIP: Readonly<Record<'PAID' | 'UN-PAID' | 'CANCELLED', readonly [string, string]>> = {
  PAID: ['#E6F3EC', '#1F6B45'],
  'UN-PAID': ['#FDF0E3', '#8A4200'],
  CANCELLED: ['#FBEAEA', '#A3262A'],
};
const badgeStyle = (b: keyof typeof CHIP): string => 'background:' + CHIP[b][0] + ';color:' + CHIP[b][1];

export const STAMP_COLOR: Readonly<Record<Stamp, string>> = {
  DRAFT: '#5A6170',
  CANCELLED: '#A3262A',
  CREDITED: '#5B3BA8',
  PAID: '#1F6B45',
};

/** QR code modules: size n and the dark cells [x, y]. */
export function qrCells(text: string): { n: number; c: [number, number][] } {
  const q = qrcode(0, 'M');
  q.addData(text);
  q.make();
  const n = q.getModuleCount();
  const c: [number, number][] = [];
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) c.push([k, r]);
  return { n, c };
}

function qrSvg(text: string, px: number): string {
  const q = qrCells(text);
  const d = q.c.map((p) => 'M' + p[0] + ' ' + p[1] + 'h1v1h-1z').join('');
  return (
    '<svg width="' +
    px +
    '" height="' +
    px +
    '" viewBox="-1 -1 ' +
    (q.n + 2) +
    ' ' +
    (q.n + 2) +
    '" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect x="-1" y="-1" width="' +
    (q.n + 2) +
    '" height="' +
    (q.n + 2) +
    '" fill="#fff"/><path d="' +
    d +
    '" fill="#161A21"/></svg>'
  );
}

const kvHtml = (rows: readonly Pair[], cls: string): string =>
  '<div class="' + cls + '">' + rows.map((r) => '<span>' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span>').join('') + '</div>';
const cellsHtml = (rows: readonly Pair[]): string =>
  rows.map((r) => '<div><div class="k">' + esc(r[0]) + '</div><div class="v">' + esc(r[1]) + '</div></div>').join('');
const linesHtml = (lines: readonly string[]): string => lines.map((l) => '<div class="l">' + esc(l) + '</div>').join('');

function tableHtml(m: InvoiceDocModel): string {
  const head = '<tr>' + m.cols.map((c, i) => '<th class="' + (m.right_[i] ? 'r' : '') + '">' + esc(c) + '</th>').join('') + '</tr>';
  const body = m.rows
    .map(
      (r) =>
        '<tr>' +
        m.keys.map((k, i) => '<td class="' + (m.right_[i] ? 'r' : '') + (k === 'head' ? ' w' : '') + '">' + esc(r[k]) + '</td>').join('') +
        '</tr>',
    )
    .join('');
  return '<table><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
}

function totalsHtml(m: InvoiceDocModel, cls: string): string {
  return (
    '<div class="' +
    cls +
    '">' +
    m.totals
      .map(
        (t, i) =>
          '<div' + (i === m.totals.length - 1 ? ' class="g"' : '') + '><span>' + esc(t[0]) + '</span><span>' + esc(t[1]) + '</span></div>',
      )
      .join('') +
    '</div>'
  );
}

function titleHtml(m: InvoiceDocModel, p: 'gi' | 'gl'): string {
  return (
    '<div class="' +
    p +
    '-tt"><h1>' +
    esc(m.title.toUpperCase()) +
    '</h1><div class="sub"><span class="mu">Transaction Name:</span><b>' +
    esc(m.txn) +
    '</b>' +
    (m.badge ? '<span class="' + p + '-badge" style="' + badgeStyle(m.badge) + '">' + esc(m.badge) + '</span>' : '') +
    '</div></div>'
  );
}

/** Invoice · A4 portrait. */
function invoiceHtml(m: InvoiceDocModel): string {
  return (
    '<div class="gi" role="document">' +
    '<div class="gi-hd"><img src="data:image/jpeg;base64,' +
    LOGO_JPEG_BASE64 +
    '" alt="PIL">' +
    titleHtml(m, 'gi') +
    (m.qr ? '<div class="gi-qr">' + qrSvg(m.qr, 72) + '</div>' : '<div></div>') +
    '</div>' +
    '<div class="gi-strip">' +
    cellsHtml(m.strip) +
    '</div>' +
    '<div class="gi-parties">' +
    '<div><div class="k">From</div><div class="n">' +
    esc(m.from[0]) +
    '</div>' +
    linesHtml(m.from.slice(1)) +
    '</div>' +
    '<div><div class="k">To</div><div class="n">' +
    esc(m.to[0]) +
    '</div>' +
    linesHtml(m.to.slice(1)) +
    '</div>' +
    '</div><div class="gi-cust">' +
    cellsHtml(m.details) +
    '</div>' +
    '<div class="gi-ship">' +
    cellsHtml(m.ship) +
    '</div>' +
    tableHtml(m) +
    '<div class="gi-bt"><div><div class="k">Bank details</div>' +
    kvHtml(m.bank, 'gi-bank') +
    '</div>' +
    totalsHtml(m, 'gi-tot') +
    '</div>' +
    '<div class="gi-words">' +
    esc(m.words) +
    '</div>' +
    '<div class="gi-ft"><span>Issued By: ' +
    esc(m.issued) +
    '</span><span>' +
    esc(m.stamp2) +
    '</span><span class="d">' +
    esc(m.disclaimer) +
    '</span></div></div>'
  );
}

/** Invoice · A4 landscape (charge columns stay readable). */
function invoiceHtmlL(m: InvoiceDocModel): string {
  return (
    '<div class="gl" role="document">' +
    '<div class="gl-hd"><img src="data:image/jpeg;base64,' +
    LOGO_JPEG_BASE64 +
    '" alt="PIL">' +
    titleHtml(m, 'gl') +
    (m.qr ? '<div class="gl-qr">' + qrSvg(m.qr, 84) + '</div>' : '<div></div>') +
    '</div>' +
    '<div class="gl-strip">' +
    cellsHtml(m.strip) +
    '</div>' +
    '<div class="gl-parties">' +
    '<div><div class="k">From</div><div class="n">' +
    esc(m.from[0]) +
    '</div>' +
    linesHtml(m.from.slice(1)) +
    '</div>' +
    '<div><div class="k">To</div><div class="n">' +
    esc(m.to[0]) +
    '</div>' +
    linesHtml(m.to.slice(1)) +
    '</div>' +
    '<div><div class="k">Customer &amp; payment</div>' +
    kvHtml(m.details, 'gl-kv') +
    '</div></div>' +
    '<div class="gl-ship">' +
    cellsHtml(m.ship) +
    '</div>' +
    tableHtml(m) +
    '<div class="gl-bt"><div><div class="k">Bank details</div>' +
    kvHtml(m.bank, 'gl-bank') +
    '</div>' +
    totalsHtml(m, 'gl-tot') +
    '</div>' +
    '<div class="gl-words">' +
    esc(m.words) +
    '</div>' +
    '<div class="gl-ft"><span>Issued By: ' +
    esc(m.issued) +
    '</span><span>' +
    esc(m.disclaimer) +
    '</span><span>' +
    esc(m.stamp2) +
    '</span></div></div>'
  );
}

/** The document as HTML paper. */
export function paperHtml(m: DocModel): string {
  if (m.kind !== 'receipt') return m.orient === 'l' ? invoiceHtmlL(m) : invoiceHtml(m);
  const meta = m.meta
    .slice(0, 4)
    .map(
      (r) =>
        '<div><div class="gd-k">' +
        esc(r[0]) +
        '</div><div class="gd-v' +
        (/No\.$/.test(r[0]) ? ' gd-mono' : '') +
        '">' +
        esc(r[1]) +
        '</div></div>',
    )
    .join('');
  const extraMeta = m.meta
    .slice(4)
    .map((r) => '<span>' + esc(r[0]) + '</span><span class="gd-mono">' + esc(r[1]) + '</span>')
    .join('');
  const bill =
    '<div><div class="gd-k">' +
    esc(m.billTo.title) +
    '</div><div class="n">' +
    esc(m.billTo.name) +
    '</div>' +
    linesHtml(m.billTo.lines) +
    '</div>';
  const ship = m.ship
    ? '<div><div class="gd-k">' +
      esc(m.ship.title) +
      '</div><div class="gd-kv">' +
      m.ship.rows.map((r) => '<span>' + esc(r[0]) + '</span><span class="gd-mono">' + esc(r[1]) + '</span>').join('') +
      extraMeta +
      '</div></div>'
    : extraMeta
      ? '<div><div class="gd-kv">' + extraMeta + '</div></div>'
      : '<div></div>';
  const head = '<tr>' + m.cols.map((c, i) => '<th class="' + (m.align[i] === 'r' ? 'r' : '') + '">' + esc(c) + '</th>').join('') + '</tr>';
  const body = m.rows
    .map(
      (r) =>
        '<tr>' +
        r
          .map((v, i) => {
            const mono = i > 0 && (m.align[i] === 'r' || /Charge|Invoice|B\/L|Tax code/.test(m.cols[i] ?? ''));
            return '<td class="' + (m.align[i] === 'r' ? 'r ' : '') + (mono ? 'm' : '') + '">' + esc(v) + '</td>';
          })
          .join('') +
        '</tr>',
    )
    .join('');
  const tot = m.totals
    .map(
      (t) =>
        '<table>' +
        t.rows.map((r) => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + ' ' + esc(t.cur) + '</td></tr>').join('') +
        '<tr class="g"><td>' +
        esc(t.label || 'Total') +
        '</td><td>' +
        esc(t.total) +
        ' ' +
        esc(t.cur) +
        '</td></tr></table>',
    )
    .join('');
  return (
    '<div class="gd-paper" role="document">' +
    (m.stamp ? '<div class="gd-stamp" style="color:' + STAMP_COLOR[m.stamp] + '">' + m.stamp + '</div>' : '') +
    '<div class="gd-head"><div><img src="data:image/jpeg;base64,' +
    LOGO_JPEG_BASE64 +
    '" alt="PIL"><div class="gd-from">' +
    esc(m.from) +
    '</div></div>' +
    '<div class="gd-title"><h1>' +
    esc(m.title) +
    '</h1><div class="no">' +
    esc(m.no) +
    '</div></div></div>' +
    '<div class="gd-meta">' +
    meta +
    '</div><div class="gd-two">' +
    bill +
    ship +
    '</div>' +
    '<table class="gd-tbl"><thead>' +
    head +
    '</thead><tbody>' +
    body +
    '</tbody></table>' +
    '<div class="gd-tot">' +
    tot +
    '</div>' +
    (m.notes.length ? '<div class="gd-notes">' + m.notes.map((n) => '<span>' + esc(n) + '</span>').join('') + '</div>' : '') +
    '<div class="gd-foot"><span>' +
    esc(m.footer) +
    '</span><span>Page 1 of 1</span></div></div>'
  );
}
