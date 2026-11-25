import { isLangCode } from '@/shared/lib/phraseTranslator';
import { readStore, writeStore } from '@/shared/lib/storage';
import type { SettingsState, StoredSettings } from './settingsSlice';

/** Storage keys of the HTML prototype, so preferences carry over. */
const KEYS = { theme: 'girs.th', sidebar: 'girs.sb', lang: 'girs.lang', hub: 'girs.hub', entity: 'girs.ent', login: 'girs.lg' } as const;

/** Reads stored preferences; anything missing or invalid keeps its default. */
export function loadStoredSettings(): StoredSettings {
  const out: StoredSettings = {};
  const theme = readStore(KEYS.theme);
  if (theme === 'dark' || theme === 'light') out.theme = theme;
  const sb = readStore(KEYS.sidebar);
  if (sb === '1' || sb === '0') out.sidebarCollapsed = sb === '1';
  const lang = readStore(KEYS.lang);
  if (isLangCode(lang)) out.lang = lang;
  const hub = readStore(KEYS.hub);
  if (hub) out.hub = hub;
  const ent = readStore(KEYS.entity);
  if (ent) out.entity = ent;
  const lg = Number(readStore(KEYS.login));
  if (Number.isInteger(lg) && lg >= 0) out.loginIndex = lg;
  return out;
}

export function saveSettings(s: SettingsState): void {
  writeStore(KEYS.theme, s.theme);
  writeStore(KEYS.sidebar, s.sidebarCollapsed ? '1' : '0');
  writeStore(KEYS.lang, s.lang);
  writeStore(KEYS.hub, s.hub);
  writeStore(KEYS.entity, s.entity);
  writeStore(KEYS.login, String(s.loginIndex));
}
