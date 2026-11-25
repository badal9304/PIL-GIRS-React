'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';
import { QueryProvider } from './QueryProvider';
import { ReduxProvider } from './ReduxProvider';
import { SettingsSync } from './SettingsSync';

/** Client providers for the whole app: Redux (UI state), TanStack Query (server state), i18next. */
export function AppProviders({ children }: { children: ReactNode }): ReactNode {
  return (
    <ReduxProvider>
      <SettingsSync />
      <QueryProvider>
        <I18nProvider>{children}</I18nProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
