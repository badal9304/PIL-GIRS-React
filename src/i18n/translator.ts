/**
 * Phrase-based translator. English is the source language: UI text is written in English and
 * looked up in the locale dictionary. Data (codes, numbers, names, amounts) is left as it is.
 *
 * Matching rules (same as the prototype):
 *  - exact phrase                          "Invoice List"
 *  - numbers replaced by #                 "12 of 23" -> "# of #"
 *  - templates with one data slot          "No results for “{x}”"
 *  - "A · B" and "Label: value" pairs when every part is translated or plain data
 */
export type LangCode = 'en' | 'zh' | 'ar' | 'es';

export interface LocaleData {
  lang: string;
  dict: Record<string, string>;
  tpl: [string, string][];
}

export const LANGUAGES: { code: LangCode; label: string; english: string }[] = [
  { code: 'en', label: 'English', english: 'English' },
  { code: 'zh', label: '中文（简体）', english: 'Chinese (Simplified)' },
  { code: 'ar', label: 'العربية', english: 'Arabic' },
  { code: 'es', label: 'Español', english: 'Spanish' },
];

const NUM = /\d+(?:[.,]\d+)*/g;
const LRI = '⁦';
const PDI = '⁩';

/** Codes, numbers, dates and Title Case names count as data; ordinary lowercase words do not. */
function dataLike(p: string) {
  return !/(^|[\s(])[a-z]{3,}/.test(p.replace(/\[[^\]]*\]/g, ''));
}

export class Translator {
  private dict: Record<string, string>;
  private tpl: [string, string, RegExp][];
  private memo = new Map<string, string>();

  readonly lang: LangCode;

  constructor(lang: LangCode, data?: LocaleData) {
    this.lang = lang;
    this.dict = data?.dict || {};
    this.tpl = (data?.tpl || []).map(([src, dst]) => [
      src,
      dst,
      new RegExp('^' + src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\\{x\\}', '(.+)') + '$'),
    ]);
  }

  private look(t: string): string | null {
    const D = this.dict;
    if (Object.prototype.hasOwnProperty.call(D, t)) return D[t];
    const nums = t.match(NUM);
    if (nums) {
      const k = t.replace(NUM, '#');
      if (Object.prototype.hasOwnProperty.call(D, k)) {
        let n = 0;
        return D[k].replace(/#/g, () => (nums[n] != null ? nums[n++] : '#'));
      }
    }
    for (const [, dst, re] of this.tpl) {
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
        if (b != null || dataLike(c[2])) return a + (this.lang === 'zh' ? '：' : ': ') + (b != null ? b : c[2]);
      }
    }
    return null;
  }

  /** Translates a phrase; returns it unchanged when there is no translation. */
  t = (raw: unknown): string => {
    const str = raw == null ? '' : String(raw);
    if (this.lang === 'en' || !str || !/[A-Za-z]/.test(str)) return str;
    const hit = this.memo.get(str);
    if (hit !== undefined) return hit;
    const norm = str.replace(/\s+/g, ' ').trim();
    const r = this.look(norm);
    const out = r == null ? str : (str.match(/^\s*/)?.[0] || '') + r + (str.match(/\s*$/)?.[0] || '');
    if (this.memo.size > 5000) this.memo.clear();
    this.memo.set(str, out);
    return out;
  };

  /** Translates text content. In Arabic, Latin data runs ("Vessel 01 / 073N", dates) keep left-to-right order. */
  tx = (raw: unknown): string => {
    const v = this.t(raw);
    if (this.lang !== 'ar') return v;
    return v.charAt(0) !== LRI && /[A-Za-z0-9]/.test(v) && !/[؀-ۿ]/.test(v) && /\S[\s\-/:.,]+\S/.test(v) ? LRI + v + PDI : v;
  };
}

export async function loadLocale(lang: LangCode): Promise<LocaleData | undefined> {
  switch (lang) {
    case 'zh':
      return (await import('./locales/zh.json')).default as unknown as LocaleData;
    case 'es':
      return (await import('./locales/es.json')).default as unknown as LocaleData;
    case 'ar':
      return (await import('./locales/ar.json')).default as unknown as LocaleData;
    default:
      return undefined;
  }
}
