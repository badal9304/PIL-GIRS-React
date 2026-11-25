/**
 * Phrase translator for text that screen logic builds at runtime ("Showing 1–25 of 243 voyages", "Generate 935").
 * Static UI text goes through typed i18next keys; this matcher translates composed phrases from the `phrases`
 * and `patterns` namespaces. English is the source language; data (codes, numbers, names, amounts) is kept.
 *
 * Matching rules:
 *  - exact phrase                          "Invoice List"
 *  - numbers replaced by #                 "12 of 23" -> "# of #"
 *  - templates with one data slot          "No results for “{x}”"
 *  - "A · B" and "Label: value" pairs when every part is translated or plain data
 */
export type LangCode = 'en' | 'zh' | 'ar' | 'es';

/** Phrase dictionary of one language: exact phrases and one-slot templates ("Select {x}" -> "选择 {x}"). */
export interface PhraseBook {
  dict: Readonly<Record<string, string>>;
  tpl: Readonly<Record<string, string>>;
}

export const LANGUAGES: ReadonlyArray<{ code: LangCode; label: string; english: string }> = [
  { code: 'en', label: 'English', english: 'English' },
  { code: 'zh', label: '中文（简体）', english: 'Chinese (Simplified)' },
  { code: 'ar', label: 'العربية', english: 'Arabic' },
  { code: 'es', label: 'Español', english: 'Spanish' },
];

export const isLangCode = (v: unknown): v is LangCode => v === 'en' || v === 'zh' || v === 'ar' || v === 'es';

const NUM = /\d+(?:[.,]\d+)*/g;
const LRI = '⁦';
const PDI = '⁩';

/** Codes, numbers, dates and Title Case names count as data; ordinary lowercase words do not. */
function dataLike(p: string): boolean {
  return !/(^|[\s(])[a-z]{3,}/.test(p.replace(/\[[^\]]*\]/g, ''));
}

const has = (d: Readonly<Record<string, string>>, k: string): boolean => Object.prototype.hasOwnProperty.call(d, k);

export class PhraseTranslator {
  readonly lang: LangCode;
  private readonly dict: Readonly<Record<string, string>>;
  private readonly tpl: ReadonlyArray<readonly [string, RegExp]>;
  private readonly memo = new Map<string, string>();

  constructor(lang: LangCode, book?: PhraseBook) {
    this.lang = lang;
    this.dict = book?.dict ?? {};
    this.tpl = Object.entries(book?.tpl ?? {}).map(
      ([src, dst]) => [dst, new RegExp('^' + src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\\{x\\}', '(.+)') + '$')] as const,
    );
  }

  private look(t: string): string | null {
    const D = this.dict;
    if (has(D, t)) return D[t];
    const nums = t.match(NUM);
    if (nums) {
      const k = t.replace(NUM, '#');
      if (has(D, k)) {
        let n = 0;
        return D[k].replace(/#/g, () => (nums[n] != null ? nums[n++] : '#'));
      }
    }
    for (const [dst, re] of this.tpl) {
      const m = re.exec(t);
      if (m && dataLike(m[1])) return dst.replace('{x}', m[1]);
    }
    if (t.indexOf(' · ') > 0) {
      let ok = true;
      let changed = false;
      const parts = t.split(' · ').map((p) => {
        const x = this.look(p);
        if (x != null) {
          changed = true;
          return x;
        }
        if (!dataLike(p)) ok = false;
        return p;
      });
      if (changed && ok) return parts.join(' · ');
    }
    const c = /^([^:]{2,40}):\s(.+)$/.exec(t);
    if (c) {
      const a = this.look(c[1]);
      if (a != null) {
        const b = this.look(c[2]);
        if (b != null || dataLike(c[2])) return a + (this.lang === 'zh' ? '：' : ': ') + (b ?? c[2]);
      }
    }
    return null;
  }

  /** Translates a phrase (attributes: titles, placeholders, labels); unchanged when there is no translation. */
  t = (raw: unknown): string => {
    const str = raw == null ? '' : String(raw);
    if (this.lang === 'en' || !str || !/[A-Za-z]/.test(str)) return str;
    const hit = this.memo.get(str);
    if (hit !== undefined) return hit;
    const r = this.look(str.replace(/\s+/g, ' ').trim());
    const out = r == null ? str : (str.match(/^\s*/)?.[0] ?? '') + r + (str.match(/\s*$/)?.[0] ?? '');
    if (this.memo.size > 5000) this.memo.clear();
    this.memo.set(str, out);
    return out;
  };

  /** Translates visible text. In Arabic, Latin data runs ("Vessel 01 / 073N", dates) keep left-to-right order. */
  tx = (raw: unknown): string => {
    const v = this.t(raw);
    if (this.lang !== 'ar') return v;
    return v.charAt(0) !== LRI && /[A-Za-z0-9]/.test(v) && !/[؀-ۿ]/.test(v) && /\S[\s\-/:.,]+\S/.test(v) ? LRI + v + PDI : v;
  };
}
