import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { LangCode } from '../../i18n/translator';
import { readStore, writeStore } from '../../lib/storage';
import { SettingsContext, type Theme } from './contexts';

/** User preferences, kept in the browser (same keys as the prototype so choices carry over). */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeS] = useState<Theme>(() => (readStore('girs.th') === 'dark' ? 'dark' : 'light'));
  const [sidebarCollapsed, setSb] = useState(() => readStore('girs.sb') === '1');
  const [lang, setLangS] = useState<LangCode>(() => (readStore('girs.lang') as LangCode) || 'en');
  const [hub, setHubS] = useState(() => readStore('girs.hub') || 'SIN');
  const [entity, setEntS] = useState(() => readStore('girs.ent') || 'PIL');
  const [loginIndex, setLg] = useState(() => +(readStore('girs.lg') || 0) || 0);

  const setTheme = useCallback((t: Theme) => (writeStore('girs.th', t), setThemeS(t)), []);
  const setSidebarCollapsed = useCallback((c: boolean) => (writeStore('girs.sb', c ? '1' : '0'), setSb(c)), []);
  const setLang = useCallback((l: LangCode) => (writeStore('girs.lang', l), setLangS(l)), []);
  const setHub = useCallback((h: string) => (writeStore('girs.hub', h), setHubS(h)), []);
  const setEntity = useCallback((e: string) => (writeStore('girs.ent', e), setEntS(e)), []);
  const setLoginIndex = useCallback((i: number) => (writeStore('girs.lg', String(i)), setLg(i)), []);

  const value = useMemo(
    () => ({
      theme,
      sidebarCollapsed,
      lang,
      hub,
      entity,
      loginIndex,
      setTheme,
      setSidebarCollapsed,
      setLang,
      setHub,
      setEntity,
      setLoginIndex,
    }),
    [theme, sidebarCollapsed, lang, hub, entity, loginIndex, setTheme, setSidebarCollapsed, setLang, setHub, setEntity, setLoginIndex],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
