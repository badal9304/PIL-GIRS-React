'use client';

import { bindActionCreators } from '@reduxjs/toolkit';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadStoredSettings, saveSettings } from './persistence';
import { settingsSlice, type SettingsState } from './settingsSlice';

interface SettingsRoot {
  settings: SettingsState;
}

export const selectSettings = (s: SettingsRoot): SettingsState => s.settings;

/** Current preferences (theme, side panel, language, hub, entity, login). */
export function useSettings(): SettingsState {
  return useSelector(selectSettings);
}

/** Bound settings actions: themeChanged, sidebarToggled, languageChanged, hubChanged, entityChanged, loginSwitched. */
export function useSettingsActions(): typeof settingsSlice.actions {
  const dispatch = useDispatch();
  return useMemo(() => bindActionCreators(settingsSlice.actions, dispatch), [dispatch]);
}

/** Reads stored preferences once on the client, then writes every change back. Mounted once by the app providers. */
export function useSettingsPersistence(): void {
  const settings = useSettings();
  const { settingsHydrated } = useSettingsActions();
  useEffect(() => {
    settingsHydrated(loadStoredSettings());
  }, [settingsHydrated]);
  useEffect(() => {
    if (settings.hydrated) saveSettings(settings);
  }, [settings]);
}
