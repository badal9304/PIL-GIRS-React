import { createContext, useContext } from 'react';
import type { LangCode } from '../../i18n/translator';

export type Theme = 'light' | 'dark';

export interface Settings {
  theme: Theme;
  sidebarCollapsed: boolean;
  lang: LangCode;
  hub: string;
  entity: string;
  loginIndex: number;
  setTheme: (t: Theme) => void;
  setSidebarCollapsed: (c: boolean) => void;
  setLang: (l: LangCode) => void;
  setHub: (h: string) => void;
  setEntity: (e: string) => void;
  setLoginIndex: (i: number) => void;
}

export interface ToastApi {
  message: string;
  show: (message: string) => void;
  /** Hides the message after 5 s if it is still showing. */
  fade: (message: string) => void;
  close: () => void;
}

export const SettingsContext = createContext<Settings | null>(null);
export const ToastContext = createContext<ToastApi | null>(null);

/** User preferences (theme, side panel, language, hub, entity, login). */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}

/** App toast (bottom-right status message). */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
