'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useSettings } from '@/features/settings';
import { setDocumentTranslator } from '@/shared/lib/documentI18n';
import { PhraseTranslator, isLangCode, type PhraseBook } from '@/shared/lib/phraseTranslator';
import { createI18n } from '../config/i18n';

/**
 * Provides i18next and follows the language picked in the profile menu. Arabic switches the page to
 * right-to-left. The phrase dictionary of the language is loaded with it, for runtime text and documents.
 */
export function I18nProvider({ children }: { children: ReactNode }): ReactNode {
  const [i18n] = useState(createI18n);
  const { lang } = useSettings();

  useEffect(() => {
    let alive = true;
    void i18n
      .changeLanguage(lang)
      .then(() => i18n.loadNamespaces(['phrases', 'patterns']))
      .then(() => {
        if (!alive) return;
        const code = isLangCode(i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'en';
        const el = document.documentElement;
        el.lang = code;
        el.dir = code === 'ar' ? 'rtl' : 'ltr';
        const dict = i18n.getResourceBundle(code, 'phrases') as Record<string, string> | undefined;
        const tpl = i18n.getResourceBundle(code, 'patterns') as Record<string, string> | undefined;
        const book: PhraseBook | undefined = dict ? { dict, tpl: tpl ?? {} } : undefined;
        setDocumentTranslator(new PhraseTranslator(code, book));
      });
    return () => {
      alive = false;
    };
  }, [i18n, lang]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
