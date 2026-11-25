'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isLangCode, PhraseTranslator, type PhraseBook } from '../lib/phraseTranslator';

/** i18next namespaces holding the phrase dictionary and the one-slot templates of each language. */
export const PHRASE_NS = 'phrases';
export const PATTERN_NS = 'patterns';

/**
 * Translator for text composed at runtime by screen logic (counts, statuses, data-driven labels).
 * `tx` for visible text, `tp` for attributes. Re-renders when the language or its phrase files load.
 */
export function usePhrase(): { tx: (raw: unknown) => string; tp: (raw: unknown) => string; lang: string } {
  const { i18n } = useTranslation([PHRASE_NS, PATTERN_NS]);
  const lang = isLangCode(i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'en';
  const dict = i18n.getResourceBundle(lang, PHRASE_NS) as Record<string, string> | undefined;
  const tpl = i18n.getResourceBundle(lang, PATTERN_NS) as Record<string, string> | undefined;
  return useMemo(() => {
    const book: PhraseBook | undefined = dict ? { dict, tpl: tpl ?? {} } : undefined;
    const tr = new PhraseTranslator(lang, book);
    return { tx: tr.tx, tp: tr.t, lang };
  }, [lang, dict, tpl]);
}
