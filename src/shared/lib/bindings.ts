import type { CSSProperties, SyntheticEvent } from 'react';

/** Small helpers the screen views use to bind screen-model values. */

/** Value as display text (null/undefined render as nothing). */
export const s = (v: unknown): string => (v == null ? '' : String(v));

/** Boolean props such as checked/disabled accept true or 'true'. */
export const b = (v: unknown): boolean => v === true || v === 'true';

/** Optional attribute: false/null/undefined leave the attribute out. Values are screen-model strings such as 'true' / 'false'. */
export const a = (v: unknown): string | undefined => (v === false || v == null ? undefined : String(v));

/** Boolean ARIA state from a screen-model value ('true' / true). */
export const aria = (v: unknown): boolean | undefined => (v == null || v === '' ? undefined : v === true || v === 'true');

/** Click handler that does not bubble to parent handlers (rows, backdrops). */
export const clk = <E extends SyntheticEvent>(h?: ((e: E) => unknown) | null) =>
  typeof h === 'function'
    ? (e: E) => {
        e.stopPropagation();
        h(e);
      }
    : undefined;

const cache = new Map<string, CSSProperties>();

function camel(name: string) {
  if (name.startsWith('--')) return name;
  let n = name;
  if (n.startsWith('-ms-')) n = 'ms-' + n.slice(4);
  else if (n.startsWith('-')) n = n.charAt(1).toUpperCase() + n.slice(2);
  return n.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Inline style string (computed by a view-model) to a React style object. */
export function sx(css: string): CSSProperties {
  const hit = cache.get(css);
  if (hit) return hit;
  const out: Record<string, string> = {};
  let buf = '';
  let depth = 0;
  let q = '';
  const decls: string[] = [];
  for (const ch of css) {
    if (q) {
      buf += ch;
      if (ch === q) q = '';
      continue;
    }
    if (ch === '"' || ch === "'") q = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ';' && depth === 0) {
      decls.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  decls.push(buf);
  for (const d of decls) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    const k = d.slice(0, i).trim();
    const val = d.slice(i + 1).trim();
    if (k && val) out[camel(k)] = val;
  }
  if (cache.size > 2000) cache.clear();
  cache.set(css, out as CSSProperties);
  return out as CSSProperties;
}
