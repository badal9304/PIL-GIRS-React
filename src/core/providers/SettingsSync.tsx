'use client';

import type { ReactNode } from 'react';
import { useSettingsPersistence } from '@/features/settings';

/** Loads stored preferences on the client and keeps them saved. */
export function SettingsSync(): ReactNode {
  useSettingsPersistence();
  return null;
}
