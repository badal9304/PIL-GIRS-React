import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadLocale, Translator, type LangCode, type LocaleData } from './translator';
import { useSettings } from '../app/providers/contexts';
import { I18nContext } from './context';

declare global {
  interface Window {
    /** Read by the invoice/receipt document renderer so documents follow the app language. */
    GirsI18n?: { lang: LangCode; tr: (s: string) => string };
  }
}

/** Provides the translator for the language picked in the profile menu. Arabic switches the layout to right-to-left. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { lang } = useSettings();
  const [data, setData] = useState<{ lang: LangCode; data?: LocaleData }>({ lang: 'en' });

  useEffect(() => {
    let alive = true;
    loadLocale(lang).then((d) => alive && setData({ lang, data: d }));
    return () => {
      alive = false;
    };
  }, [lang]);

  const translator = useMemo(() => new Translator(data.lang, data.data), [data]);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = translator.lang;
    el.dir = translator.lang === 'ar' ? 'rtl' : 'ltr';
    window.GirsI18n = { lang: translator.lang, tr: translator.t };
  }, [translator]);

  return <I18nContext.Provider value={translator}>{children}</I18nContext.Provider>;
}
