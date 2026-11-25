import i18next, { type BackendModule, type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { publicUrl } from '@/shared/lib/basePath';
import common from '../../../public/locales/en/common.json';
import home from '../../../public/locales/en/home.json';
import invoices from '../../../public/locales/en/invoices.json';
import masters from '../../../public/locales/en/masters.json';
import search from '../../../public/locales/en/search.json';
import uikit from '../../../public/locales/en/uikit.json';

/**
 * i18next set-up. Keys are the English UI text (natural keys), so English is bundled and complete; the other
 * languages load on demand from public/locales/{lng}/{ns}.json. `phrases` and `patterns` hold the dictionary used
 * to translate text composed at runtime by screen logic (see shared/hooks/usePhrase).
 */
export const NAMESPACES = ['common', 'home', 'invoices', 'masters', 'search', 'uikit', 'phrases', 'patterns'] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const EN_RESOURCES = { common, home, invoices, masters, search, uikit, phrases: {}, patterns: {} } as const;

const localeBackend: BackendModule = {
  type: 'backend',
  init: () => undefined,
  read(language, namespace, callback) {
    fetch(publicUrl(`/locales/${language}/${namespace}.json`))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${language}/${namespace}`);
        return res.json() as Promise<Record<string, string>>;
      })
      .then((data) => callback(null, data))
      .catch((err: unknown) => callback(err instanceof Error ? err : new Error(String(err)), false));
  },
};

/** Creates and initialises an i18next instance (one per app; tests create their own). */
export function createI18n(): I18n {
  const instance = i18next.createInstance();
  void instance
    .use(localeBackend)
    .use(initReactI18next)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh', 'ar', 'es'],
      ns: [...NAMESPACES],
      defaultNS: 'common',
      resources: { en: EN_RESOURCES },
      partialBundledLanguages: true,
      keySeparator: false,
      nsSeparator: false,
      returnNull: false,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      initAsync: false,
    });
  return instance;
}
