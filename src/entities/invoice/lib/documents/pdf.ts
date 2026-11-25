import { LOGO_H, LOGO_JPEG_BASE64, LOGO_W } from './logo';
import { CHIP, STAMP_COLOR, qrCells } from './html';
import { T, docLang, type DocModel, type InvoiceDocModel, type ReceiptDocModel } from './model';

/**
 * PDF writer. Latin documents are written as real PDF text with the built-in Helvetica fonts; Chinese and Arabic
 * need glyphs those fonts do not have, so their pages are drawn on a canvas at print resolution and embedded as
 * page images.
 */

/** Helvetica / Helvetica-Bold advance widths (1/1000 em) for ASCII 32–126. */
const HW = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278,
  278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722,
  667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556,
  556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const HB = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333,
  333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722,
  667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611,
  611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];
/** WinAnsi code and width for common non-ASCII characters; null = written as a replacement. */
const WIN: Readonly<Record<string, readonly [number, number] | null>> = {
  '—': [151, 1000],
  '–': [150, 556],
  '·': [183, 278],
  '×': [215, 584],
  '’': [146, 222],
  '‘': [145, 222],
  '•': [149, 350],
  '→': null,
  '−': null,
};

/** [WinAnsi code | null, width | replacement text] */
function winChar(ch: string): [number | null, number | string | null] {
  const c = ch.charCodeAt(0);
  if (c >= 32 && c < 127) return [c, null];
  if (c >= 160 && c <= 255) return [c, null];
  if (ch === '→') return [null, '->'];
  if (ch === '−') return [45, null];
  const w = WIN[ch];
  return w ? [w[0], w[1]] : [63, null];
}

/** Canvas used for Chinese / Arabic documents while a PDF is being built. */
let RASTER: CanvasRenderingContext2D | null = null;
const RS = 3;
const FONT = '"IBM Plex Sans","Noto Sans SC","PingFang SC","Microsoft YaHei","Noto Naskh Arabic","Geeza Pro","Segoe UI",Arial,sans-serif';
let logoImg: HTMLImageElement | null = null;
const logoImage = (): HTMLImageElement => {
  if (!logoImg) {
    logoImg = new Image();
    logoImg.src = 'data:image/jpeg;base64,' + LOGO_JPEG_BASE64;
  }
  return logoImg;
};

const cfont = (bold: boolean, size: number): string => (bold ? '700 ' : '400 ') + (size * RS).toFixed(2) + 'px ' + FONT;

export function width(raw: string, bold: boolean, size: number): number {
  const str = T(raw);
  if (RASTER) {
    RASTER.font = cfont(bold, size);
    return RASTER.measureText(str).width / RS;
  }
  const t = bold ? HB : HW;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c >= 32 && c < 127) w += t[c - 32] ?? 556;
    else {
      const x = winChar(str[i] ?? '');
      w += typeof x[1] === 'number' ? x[1] : x[1] === '->' ? 833 : 556;
    }
  }
  return (w * size) / 1000;
}

function pdfStr(raw: string): string {
  let out = '';
  const str = String(raw);
  for (let i = 0; i < str.length; i++) {
    const x = winChar(str[i] ?? '');
    if (x[1] === '->') {
      out += '->';
      continue;
    }
    const c = x[0] ?? 63;
    if (c === 40 || c === 41 || c === 92) out += '\\' + String.fromCharCode(c);
    else if (c >= 32 && c < 127) out += String.fromCharCode(c);
    else out += '\\' + ('00' + c.toString(8)).slice(-3);
  }
  return '(' + out + ')';
}

const rgb = (hex: string): string => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((v) => v.toFixed(3)).join(' ');
};

export function wrap(raw: string, bold: boolean, size: number, maxW: number): string[] {
  const text = T(raw);
  if (RASTER && !/ /.test(text.trim())) {
    // CJK: no spaces, break by character
    const out: string[] = [];
    let c = '';
    Array.from(text).forEach((ch) => {
      if (width(c + ch, bold, size) > maxW && c) {
        out.push(c);
        c = ch;
      } else c += ch;
    });
    if (c) out.push(c);
    return out;
  }
  const lines: string[] = [];
  let cur = '';
  text.split(' ').forEach((w) => {
    const t = cur ? cur + ' ' + w : w;
    if (width(t, bold, size) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  });
  if (cur) lines.push(cur);
  return lines;
}

const PH = 842;
const PW = 595;

interface TextOptions {
  size?: number;
  bold?: boolean;
  color?: string;
  align?: 'l' | 'r' | 'c';
}

/** One PDF page: PDF drawing operators, or a canvas when rastering. */
class Page {
  ops: string[] = [];
  readonly w: number;
  readonly h: number;
  readonly cv: HTMLCanvasElement | null = null;
  readonly cx: CanvasRenderingContext2D | null = null;
  img: Uint8Array | null = null;
  iw = 0;
  ih = 0;

  constructor(w = PW, h = PH) {
    this.w = w;
    this.h = h;
    if (RASTER) {
      this.cv = document.createElement('canvas');
      this.cv.width = Math.round(this.w * RS);
      this.cv.height = Math.round(this.h * RS);
      this.cx = this.cv.getContext('2d');
      if (this.cx) {
        this.cx.fillStyle = '#fff';
        this.cx.fillRect(0, 0, this.cv.width, this.cv.height);
        this.cx.textBaseline = 'alphabetic';
      }
    }
  }

  text(x0: number, y: number, raw: string, o: TextOptions = {}): number {
    const size = o.size ?? 9;
    const bold = !!o.bold;
    const s = T(raw);
    const w = width(s, bold, size);
    let x = x0;
    if (o.align === 'r') x -= w;
    else if (o.align === 'c') x -= w / 2;
    if (this.cx) {
      const c = this.cx;
      c.font = cfont(bold, size);
      c.fillStyle = o.color ?? '#161A21';
      c.direction = 'ltr';
      c.textAlign = 'left';
      c.fillText(s, x * RS, y * RS);
      return w;
    }
    this.ops.push(
      'BT ' +
        rgb(o.color ?? '#161A21') +
        ' rg /' +
        (bold ? 'F2' : 'F1') +
        ' ' +
        size +
        ' Tf ' +
        x.toFixed(2) +
        ' ' +
        (this.h - y).toFixed(2) +
        ' Td ' +
        pdfStr(s) +
        ' Tj ET',
    );
    return w;
  }

  rect(x: number, y: number, w: number, h: number, fill: string | null, stroke?: string, lw?: number): void {
    if (this.cx) {
      const c = this.cx;
      if (fill) {
        c.fillStyle = fill;
        c.fillRect(x * RS, y * RS, w * RS, h * RS);
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = (lw ?? 0.75) * RS;
        c.strokeRect(x * RS, y * RS, w * RS, h * RS);
      }
      return;
    }
    let s = 'q ';
    if (fill) s += rgb(fill) + ' rg ';
    if (stroke) s += rgb(stroke) + ' RG ' + (lw ?? 0.75) + ' w ';
    s +=
      x.toFixed(2) +
      ' ' +
      (this.h - y - h).toFixed(2) +
      ' ' +
      w.toFixed(2) +
      ' ' +
      h.toFixed(2) +
      ' re ' +
      (fill && stroke ? 'B' : fill ? 'f' : 'S') +
      ' Q';
    this.ops.push(s);
  }

  pill(x: number, y: number, w: number, h: number, fill: string): void {
    if (this.cx) {
      const c = this.cx;
      c.fillStyle = fill;
      c.beginPath();
      c.roundRect(x * RS, y * RS, w * RS, h * RS, (h * RS) / 2);
      c.fill();
      return;
    }
    const r = h / 2;
    const k = r * 0.5523;
    const Y = this.h - y - h;
    const f = (n: number) => n.toFixed(2);
    this.ops.push(
      'q ' +
        rgb(fill) +
        ' rg ' +
        f(x + r) +
        ' ' +
        f(Y) +
        ' m ' +
        f(x + w - r) +
        ' ' +
        f(Y) +
        ' l ' +
        f(x + w - r + k) +
        ' ' +
        f(Y) +
        ' ' +
        f(x + w) +
        ' ' +
        f(Y + r - k) +
        ' ' +
        f(x + w) +
        ' ' +
        f(Y + r) +
        ' c ' +
        f(x + w) +
        ' ' +
        f(Y + r + k) +
        ' ' +
        f(x + w - r + k) +
        ' ' +
        f(Y + h) +
        ' ' +
        f(x + w - r) +
        ' ' +
        f(Y + h) +
        ' c ' +
        f(x + r) +
        ' ' +
        f(Y + h) +
        ' l ' +
        f(x + r - k) +
        ' ' +
        f(Y + h) +
        ' ' +
        f(x) +
        ' ' +
        f(Y + r + k) +
        ' ' +
        f(x) +
        ' ' +
        f(Y + r) +
        ' c ' +
        f(x) +
        ' ' +
        f(Y + r - k) +
        ' ' +
        f(x + r - k) +
        ' ' +
        f(Y) +
        ' ' +
        f(x + r) +
        ' ' +
        f(Y) +
        ' c f Q',
    );
  }

  line(x1: number, y1: number, x2: number, y2: number, color = '#DADDE3', lw = 0.75): void {
    if (this.cx) {
      const c = this.cx;
      c.strokeStyle = color;
      c.lineWidth = lw * RS;
      c.beginPath();
      c.moveTo(x1 * RS, y1 * RS);
      c.lineTo(x2 * RS, y2 * RS);
      c.stroke();
      return;
    }
    this.ops.push(
      'q ' +
        rgb(color) +
        ' RG ' +
        lw +
        ' w ' +
        x1.toFixed(2) +
        ' ' +
        (this.h - y1).toFixed(2) +
        ' m ' +
        x2.toFixed(2) +
        ' ' +
        (this.h - y2).toFixed(2) +
        ' l S Q',
    );
  }

  logo(x: number, y: number, h: number): void {
    const w = (h * LOGO_W) / LOGO_H;
    if (this.cx) {
      this.cx.drawImage(logoImage(), x * RS, y * RS, w * RS, h * RS);
      return;
    }
    this.ops.push('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + (this.h - y - h).toFixed(2) + ' cm /Im1 Do Q');
  }

  stamp(raw: string, color: string): void {
    const label = T(raw);
    if (this.cx) {
      const c = this.cx;
      const sz = 18;
      const ww = width(label, true, sz) + 20;
      c.save();
      c.globalAlpha = 0.25;
      c.translate(335 * RS, 50 * RS);
      c.rotate((-14 * Math.PI) / 180);
      c.strokeStyle = color;
      c.lineWidth = 2.5 * RS;
      c.strokeRect((-ww / 2) * RS, -15 * RS, ww * RS, 30 * RS);
      c.fillStyle = color;
      c.font = cfont(true, sz);
      c.fillText(label, (-ww / 2 + 10) * RS, 6.3 * RS);
      c.restore();
      return;
    }
    const size = 18;
    const w = width(label, true, size) + 20;
    const h = 30;
    const a = (-14 * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    this.ops.push(
      'q /GS1 gs ' +
        c.toFixed(4) +
        ' ' +
        (-s).toFixed(4) +
        ' ' +
        s.toFixed(4) +
        ' ' +
        c.toFixed(4) +
        ' 335 ' +
        (this.h - 50) +
        ' cm ' +
        rgb(color) +
        ' RG 2.5 w ' +
        (-w / 2).toFixed(2) +
        ' ' +
        -h / 2 +
        ' ' +
        w.toFixed(2) +
        ' ' +
        h +
        ' re S ' +
        'BT ' +
        rgb(color) +
        ' rg /F2 ' +
        size +
        ' Tf ' +
        (-w / 2 + 10).toFixed(2) +
        ' -6.3 Td ' +
        pdfStr(label) +
        ' Tj ET Q',
    );
  }
}

function qrPdf(p: Page, text: string, x: number, y: number, size: number): void {
  const q = qrCells(text);
  const u = size / q.n;
  q.c.forEach((c) => p.rect(x + c[0] * u, y + c[1] * u, u + 0.02, u + 0.02, '#161A21'));
}

/** Layout constants of the two invoice orientations. */
interface InvoiceLayout {
  W: number;
  H: number;
  L: number;
  logoH: number;
  titleSize: number;
  titleY: number;
  txnSize: number;
  txnY: number;
  qrSize: number;
  ruleY: number;
  stripY: number;
  stripH: number;
  stripPad: number;
  stripSize: number;
  partiesY: number;
  fr: number[];
  headH: number;
  headSize: number;
  headLine: number;
  rowSize: number;
  rowMin: number;
  rowLine: number;
  totW: number;
  totSize: number;
  totGap: number;
  bankX: number;
  bankGap: number;
  footY: number;
}

const PORTRAIT: InvoiceLayout = {
  W: 595,
  H: 842,
  L: 30,
  logoH: 27,
  titleSize: 15,
  titleY: 36,
  txnSize: 8,
  txnY: 53,
  qrSize: 50,
  ruleY: 66,
  stripY: 78,
  stripH: 34,
  stripPad: 9,
  stripSize: 9.5,
  partiesY: 130,
  fr: [2.0, 0.62, 0.55, 0.85, 0.7, 1.0, 0.95, 0.85, 1.0],
  headH: 24,
  headSize: 6.5,
  headLine: 8,
  rowSize: 8,
  rowMin: 19,
  rowLine: 10,
  totW: 210,
  totSize: 8,
  totGap: 12,
  bankX: 108,
  bankGap: 11,
  footY: 30,
};
const LANDSCAPE: InvoiceLayout = {
  W: 842,
  H: 595,
  L: 36,
  logoH: 30,
  titleSize: 17,
  titleY: 38,
  txnSize: 8.5,
  txnY: 56,
  qrSize: 54,
  ruleY: 70,
  stripY: 84,
  stripH: 36,
  stripPad: 10,
  stripSize: 10,
  partiesY: 140,
  fr: [2.2, 0.62, 0.55, 0.8, 0.66, 0.95, 0.9, 0.8, 0.95],
  headH: 26,
  headSize: 7,
  headLine: 8.5,
  rowSize: 8.5,
  rowMin: 20,
  rowLine: 11,
  totW: 250,
  totSize: 8.5,
  totGap: 13,
  bankX: 130,
  bankGap: 12,
  footY: 20,
};

/** Invoice page (portrait or landscape), same layout as the screen paper. */
function drawInvoice(m: InvoiceDocModel): Page[] {
  const land = m.orient === 'l';
  const Z = land ? LANDSCAPE : PORTRAIT;
  const p = new Page(Z.W, Z.H);
  const L = Z.L;
  const R = Z.W - Z.L;
  const MU = '#5A6170';
  const K = (x: number, yy: number, t: string) => p.text(x, yy, T(t).toUpperCase(), { size: 6.5, bold: true, color: MU });
  p.rect(0, 0, Z.W, 3, '#E31D1A');
  p.logo(L, 22, Z.logoH);
  p.text(Z.W / 2, Z.titleY, m.title.toUpperCase(), { size: Z.titleSize, bold: true, align: 'c' });
  const lw = width('Transaction Name:', false, Z.txnSize);
  const vw = width(m.txn, true, Z.txnSize);
  const bw = m.badge ? width(m.badge, false, 7) + 14 : 0;
  const sx = Z.W / 2 - (lw + 4 + vw + (bw ? 8 + bw : 0)) / 2;
  p.text(sx, Z.txnY, 'Transaction Name:', { size: Z.txnSize, color: MU });
  p.text(sx + lw + 4, Z.txnY, m.txn, { size: Z.txnSize, bold: true });
  if (m.badge) {
    const bx = sx + lw + 4 + vw + 8;
    const bc = CHIP[m.badge];
    p.pill(bx, Z.txnY - 9.6, bw, 14, bc[0]);
    p.text(bx + 7, Z.txnY - 0.4, m.badge, { size: 7, color: bc[1] });
  }
  if (m.qr) qrPdf(p, m.qr, R - Z.qrSize, 10, Z.qrSize);
  p.line(L, Z.ruleY, R, Z.ruleY, '#ECEEF2');
  // strip
  let y = Z.stripY;
  const sw = (R - L) / 4;
  p.rect(L, y, R - L, Z.stripH, null, '#DADDE3');
  m.strip.forEach((r, i) => {
    const x = L + i * sw;
    if (i) p.line(x, y, x, y + Z.stripH);
    K(x + Z.stripPad, y + (land ? 13 : 12), r[0]);
    p.text(x + Z.stripPad, y + (land ? 28 : 26), r[1], { size: Z.stripSize, bold: true });
  });
  // parties
  y = Z.partiesY;
  const nCols = land ? 3 : 2;
  const cw = land ? (R - L - 48) / 3 : (R - L - 24) / 2;
  const cx = [L, L + cw + 24, L + 2 * (cw + 24)];
  K(cx[0] ?? L, y, 'From');
  K(cx[1] ?? L, y, 'To');
  if (land) K(cx[2] ?? L, y, 'Customer & payment');
  const big = land ? 9.5 : 9;
  const small = land ? 8.5 : 8;
  const step = land ? 12 : 11;
  const col = (x: number, lines: readonly string[]) => {
    let yy = y + (land ? 14 : 13);
    lines.forEach((l, i) =>
      wrap(l, i === 0, i === 0 ? big : small, cw - 6).forEach((t) => {
        p.text(x, yy, t, { size: i === 0 ? big : small, bold: i === 0, color: i === 0 ? '#161A21' : '#3A4556' });
        yy += step;
      }),
    );
    return yy;
  };
  const y1 = col(cx[0] ?? L, m.from);
  const y2 = col(cx[1] ?? L, m.to);
  if (land) {
    let y3 = y + 14;
    const dx = Math.max(...m.details.map((r) => width(r[0], false, 8.5))) + 10;
    m.details.forEach((r) => {
      p.text(cx[2] ?? L, y3, r[0], { size: 8.5, color: MU });
      p.text((cx[2] ?? L) + dx, y3, r[1], { size: 8.5 });
      y3 += 12;
    });
    y = Math.max(y1, y2, y3) + 8;
  } else {
    y = Math.max(y1, y2) + 6;
    // customer & payment grid
    p.line(L, y, R, y, '#ECEEF2');
    y += 14;
    y = grid(p, K, m.details, L, (R - L) / 3, y, 24, 11, 8) + 2;
  }
  void nCols;
  // shipment panel
  const rows = Math.ceil(m.ship.length / 3);
  const panelH = (land ? 16 : 12) + rows * (land ? 26 : 24);
  p.rect(L, y, R - L, panelH, '#F7F8FA');
  grid(
    p,
    K,
    m.ship,
    L + (land ? 14 : 12),
    (R - L - (land ? 28 : 24)) / 3,
    y + (land ? 16 : 14),
    land ? 26 : 24,
    land ? 12 : 11,
    land ? 8.5 : 8,
  );
  y += panelH + 14;
  // table
  const tot = Z.fr.reduce((a, b) => a + b, 0);
  const xs = [L];
  Z.fr.forEach((f) => xs.push((xs[xs.length - 1] ?? L) + (f * (R - L)) / tot));
  const pad = land ? 4 : 3;
  const at = (i: number) => (m.right_[i] ? (xs[i + 1] ?? R) - pad : (xs[i] ?? L) + pad);
  p.rect(L, y, R - L, Z.headH, '#F4F5F7');
  p.line(L, y + Z.headH, R, y + Z.headH, '#DADDE3');
  m.cols.forEach((c, i) => {
    const ln = wrap(c, true, Z.headSize, (xs[i + 1] ?? R) - (xs[i] ?? L) - pad * 2);
    const yy = y + Z.headH - (land ? 7 : 6) - (ln.length - 1) * Z.headLine;
    ln.forEach((t, k) =>
      p.text(at(i), yy + k * Z.headLine, t, { size: Z.headSize, bold: true, color: '#3A4556', align: m.right_[i] ? 'r' : 'l' }),
    );
  });
  y += Z.headH;
  m.rows.forEach((r) => {
    const hl = wrap(r.head, true, Z.rowSize, (xs[1] ?? R) - L - pad * 2);
    const rh = Math.max(Z.rowMin, (land ? 9 : 8) + hl.length * Z.rowLine);
    hl.forEach((t, k) => p.text(L + pad, y + (land ? 13 : 12) + k * Z.rowLine, t, { size: Z.rowSize }));
    m.keys.forEach((k, i) => {
      if (k === 'head') return;
      let s = String(r[k]);
      while (width(s, false, Z.rowSize) > (xs[i + 1] ?? R) - (xs[i] ?? L) - pad * 2 && s.length > 3) s = s.slice(0, -1);
      p.text(at(i), y + (land ? 13 : 12), s, { size: Z.rowSize, align: m.right_[i] ? 'r' : 'l' });
    });
    y += rh;
    p.line(L, y, R, y, '#ECEEF2');
  });
  // bank + totals
  y += 16;
  const tx = R - Z.totW;
  let ty = y;
  m.totals.forEach((t, i) => {
    const last = i === m.totals.length - 1;
    if (last) {
      p.line(tx, ty - 7, R, ty - 7, '#161A21', 0.9);
      ty += 5;
    }
    const size = last ? Z.totSize + 2 : Z.totSize;
    p.text(tx, ty, t[0], { size, bold: last });
    p.text(R, ty, t[1], { size, bold: last, align: 'r' });
    ty += last ? 14 : Z.totGap;
  });
  K(L, y, 'Bank details');
  let by = y + (land ? 14 : 13);
  m.bank.forEach((b) => {
    p.text(L, by, b[0], { size: Z.totSize, color: MU });
    p.text(L + Z.bankX, by, b[1], { size: Z.totSize });
    by += Z.bankGap;
  });
  y = Math.max(ty, by) + 6;
  if (land) {
    p.rect(L, y, R - L, 20, '#F7F8FA');
    p.text(L + 10, y + 13, m.words, { size: 8.5, color: '#3A4556' });
  } else {
    const wl = wrap(m.words, false, 8, R - L - 18);
    p.rect(L, y, R - L, 8 + wl.length * 10, '#F7F8FA');
    wl.forEach((t, k) => p.text(L + 9, y + 12 + k * 10, t, { size: 8, color: '#3A4556' }));
  }
  const fy = Z.H - Z.footY;
  p.line(L, fy - 11, R, fy - 11, '#DADDE3');
  p.text(L, fy, 'Issued By: ' + m.issued, { size: 7, color: MU });
  if (land) {
    p.text(Z.W / 2, fy, m.disclaimer, { size: 7, color: MU, align: 'c' });
    p.text(R, fy, m.stamp2, { size: 7, color: MU, align: 'r' });
  } else {
    p.text(R, fy, m.stamp2, { size: 7, color: MU, align: 'r' });
    p.text(L, fy + 11, m.disclaimer, { size: 7, color: MU });
  }
  return [p];
}

/** Label / value cells in rows of three; returns the y under the grid. */
function grid(
  p: Page,
  K: (x: number, y: number, t: string) => void,
  items: ReadonlyArray<readonly [string, string]>,
  x0: number,
  w: number,
  top: number,
  rowH: number,
  valueOffset: number,
  size: number,
): number {
  items.forEach((r, i) => {
    const x = x0 + (i % 3) * w;
    const yy = top + Math.floor(i / 3) * rowH;
    K(x, yy, r[0]);
    p.text(x, yy + valueOffset, r[1], { size });
  });
  return top + Math.ceil(items.length / 3) * rowH;
}

/** Receipt (and other list documents): one or more A4 portrait pages. */
function drawReceipt(m: ReceiptDocModel): Page[] {
  const pages: Page[] = [];
  let p = new Page();
  const L = 40;
  const R = PW - 40;
  const W = R - L;
  pages.push(p);
  p.rect(0, 0, PW, 3, '#E31D1A');
  if (m.stamp) p.stamp(m.stamp, STAMP_COLOR[m.stamp]);
  p.logo(L, 28, 30);
  p.text(L, 72, m.from, { size: 8, color: '#5A6170' });
  p.text(R, 44, m.title, { size: 16, bold: true, align: 'r' });
  p.text(R, 60, m.no, { size: 9.5, color: '#3A4556', align: 'r' });
  // meta strip
  let y = 88;
  const mh = 36;
  const cw = W / 4;
  p.rect(L, y, W, mh, null, '#DADDE3');
  m.meta.slice(0, 4).forEach((r, i) => {
    const x = L + i * cw;
    if (i) p.line(x, y, x, y + mh);
    p.text(x + 8, y + 13, r[0].toUpperCase(), { size: 6.5, bold: true, color: '#5A6170' });
    p.text(x + 8, y + 27, r[1], { size: 9, bold: true });
  });
  // bill to + shipment
  y = 146;
  p.text(L, y, m.billTo.title.toUpperCase(), { size: 6.5, bold: true, color: '#5A6170' });
  let by = y + 14;
  p.text(L, by, m.billTo.name, { size: 10, bold: true });
  by += 13;
  m.billTo.lines.forEach((l) =>
    wrap(l, false, 8.5, W / 2 - 20).forEach((t) => {
      p.text(L, by, t, { size: 8.5, color: '#3A4556' });
      by += 11;
    }),
  );
  const sx = L + W / 2 + 10;
  let sy = y;
  const kv = [...(m.ship ? m.ship.rows : []), ...m.meta.slice(4)];
  if (m.ship) p.text(sx, sy, m.ship.title.toUpperCase(), { size: 6.5, bold: true, color: '#5A6170' });
  sy += 14;
  kv.forEach((r) => {
    p.text(sx, sy, r[0], { size: 8.5, color: '#5A6170' });
    p.text(sx + 78, sy, r[1], { size: 8.5 });
    sy += 12;
  });
  y = Math.max(by, sy) + 18;
  // table
  const scale = W / m.widths.reduce((a, b) => a + b, 0);
  const xs: number[] = [];
  let acc = L;
  m.widths.forEach((w) => {
    xs.push(acc);
    acc += w * scale;
  });
  xs.push(R);
  const header = () => {
    p.rect(L, y, W, 18, '#F4F5F7');
    p.line(L, y, R, y);
    p.line(L, y + 18, R, y + 18);
    m.cols.forEach((c, i) => {
      const r = m.align[i] === 'r';
      p.text(r ? (xs[i + 1] ?? R) - 4 : (xs[i] ?? L) + 4, y + 12, c.toUpperCase(), {
        size: 6.5,
        bold: true,
        color: '#3A4556',
        align: r ? 'r' : 'l',
      });
    });
    y += 18;
  };
  header();
  m.rows.forEach((r) => {
    if (y > PH - 140) {
      p = new Page();
      pages.push(p);
      y = 48;
      header();
    }
    r.forEach((v, i) => {
      const right = m.align[i] === 'r';
      const maxW = (xs[i + 1] ?? R) - (xs[i] ?? L) - 8;
      let s = String(v);
      while (width(s, false, 8.5) > maxW && s.length > 3) s = s.slice(0, -1);
      p.text(right ? (xs[i + 1] ?? R) - 4 : (xs[i] ?? L) + 4, y + 13, s, { size: 8.5, align: right ? 'r' : 'l' });
    });
    y += 19;
    p.line(L, y, R, y, '#ECEEF2');
  });
  // totals
  y += 14;
  const tw = 190;
  m.totals.forEach((t, k) => {
    const col = R - (m.totals.length - 1 - k) * (tw + 16);
    const x0 = col - tw;
    let yy = y;
    t.rows.forEach((r) => {
      p.text(x0, yy + 9, r[0], { size: 8.5, color: '#3A4556' });
      p.text(col, yy + 9, r[1] + ' ' + t.cur, { size: 8.5, align: 'r' });
      yy += 14;
    });
    p.line(x0, yy + 2, col, yy + 2, '#161A21', 0.9);
    p.text(x0, yy + 16, t.label || 'Total', { size: 10, bold: true });
    p.text(col, yy + 16, t.total + ' ' + t.cur, { size: 10, bold: true, align: 'r' });
  });
  y += (m.totals[0] ? m.totals[0].rows.length * 14 : 0) + 40;
  m.notes.forEach((n) => {
    p.text(L, y, n, { size: 8, color: '#5A6170' });
    y += 11;
  });
  pages.forEach((pg, n) => {
    pg.line(L, PH - 40, R, PH - 40);
    pg.text(L, PH - 28, m.footer, { size: 7.5, color: '#6B7280' });
    pg.text(R, PH - 28, 'Page ' + (n + 1) + ' of ' + pages.length, { size: 7.5, color: '#6B7280', align: 'r' });
  });
  return pages;
}

const drawDoc = (m: DocModel): Page[] => (m.kind === 'receipt' ? drawReceipt(m) : drawInvoice(m));

function b64bytes(b64: string): Uint8Array {
  const s = atob(b64);
  const a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
}

let logoBytes: Uint8Array | null = null;

/** Builds one PDF from the documents (one or more pages each). */
export function buildPdf(models: readonly DocModel[], title: string): Blob {
  const lg = docLang();
  RASTER = lg === 'zh' || lg === 'ar' ? document.createElement('canvas').getContext('2d') : null;
  const raster = !!RASTER;
  let pages: Page[] = [];
  try {
    models.forEach((m) => (pages = pages.concat(drawDoc(m))));
  } finally {
    RASTER = null;
  }
  if (raster)
    pages.forEach((pg) => {
      if (!pg.cv) return;
      pg.img = b64bytes(pg.cv.toDataURL('image/jpeg', 0.92).split(',')[1] ?? '');
      pg.iw = pg.cv.width;
      pg.ih = pg.cv.height;
      pg.ops = ['q ' + pg.w + ' 0 0 ' + pg.h + ' 0 0 cm /Pg Do Q'];
    });
  logoBytes ??= b64bytes(LOGO_JPEG_BASE64);
  const enc = (s: string): Uint8Array => {
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 255;
    return a;
  };
  const objs: Uint8Array[][] = [];
  const add = (parts: Uint8Array[]) => objs.push(parts);
  // 1 catalog, 2 pages, 3 F1, 4 F2, 5 logo image, 6 graphics state, 7 info, then page / content pairs
  const nPages = pages.length;
  const firstPage = 8;
  const kids = pages.map((_, i) => firstPage + i * 2 + ' 0 R');
  add([enc('<< /Type /Catalog /Pages 2 0 R >>')]);
  add([enc('<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + nPages + ' >>')]);
  add([enc('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')]);
  add([enc('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')]);
  add([
    enc(
      '<< /Type /XObject /Subtype /Image /Width ' +
        LOGO_W +
        ' /Height ' +
        LOGO_H +
        ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' +
        logoBytes.length +
        ' >>\nstream\n',
    ),
    logoBytes,
    enc('\nendstream'),
  ]);
  add([enc('<< /Type /ExtGState /CA 0.25 /ca 0.25 >>')]);
  const d = new Date();
  const pad = (n: number) => ('0' + n).slice(-2);
  add([
    enc(
      '<< /Title ' +
        pdfStr(title) +
        ' /Producer (GIRS) /CreationDate (D:' +
        d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        '00) >>',
    ),
  ]);
  pages.forEach((pg, n) => {
    const content = pg.ops.join('\n');
    const img = pg.img ? ' /Pg ' + (firstPage + nPages * 2 + n) + ' 0 R' : '';
    add([
      enc(
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
          pg.w +
          ' ' +
          pg.h +
          '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 5 0 R' +
          img +
          ' >> /ExtGState << /GS1 6 0 R >> >> /Contents ' +
          (firstPage + n * 2 + 1) +
          ' 0 R >>',
      ),
    ]);
    add([enc('<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream')]);
  });
  pages.forEach((pg) => {
    if (pg.img)
      add([
        enc(
          '<< /Type /XObject /Subtype /Image /Width ' +
            pg.iw +
            ' /Height ' +
            pg.ih +
            ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' +
            pg.img.length +
            ' >>\nstream\n',
        ),
        pg.img,
        enc('\nendstream'),
      ]);
  });
  const chunks: Uint8Array[] = [enc('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')];
  let off = chunks[0]?.length ?? 0;
  const xref: number[] = [];
  objs.forEach((parts, n) => {
    xref.push(off);
    const head = enc(n + 1 + ' 0 obj\n');
    const tail = enc('\nendobj\n');
    chunks.push(head);
    off += head.length;
    parts.forEach((part) => {
      chunks.push(part);
      off += part.length;
    });
    chunks.push(tail);
    off += tail.length;
  });
  const x =
    'xref\n0 ' +
    (objs.length + 1) +
    '\n0000000000 65535 f \n' +
    xref.map((o) => ('000000000' + o).slice(-10) + ' 00000 n \n').join('') +
    'trailer\n<< /Size ' +
    (objs.length + 1) +
    ' /Root 1 0 R /Info 7 0 R >>\nstartxref\n' +
    off +
    '\n%%EOF\n';
  chunks.push(enc(x));
  return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
}
