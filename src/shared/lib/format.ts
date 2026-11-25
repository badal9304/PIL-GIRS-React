/** Number formatting used across screens. */
export const formatInt = (n: number): string => Math.round(n).toLocaleString('en-US');

export const formatUsdShort = (v: number): string =>
  'USD ' + (v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e4 ? (v / 1e3).toFixed(1) + 'K' : formatInt(v));

export const formatFileSize = (bytes: number): string =>
  bytes > 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';

export const escapeHtml = (v: unknown): string =>
  String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
