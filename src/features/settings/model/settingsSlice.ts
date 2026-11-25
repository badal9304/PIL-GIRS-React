import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { isLangCode, type LangCode } from '@/shared/lib/phraseTranslator';

export type Theme = 'light' | 'dark';

/** User preferences. Kept in the browser under the prototype's keys so choices carry over. */
export interface SettingsState {
  theme: Theme;
  sidebarCollapsed: boolean;
  lang: LangCode;
  /** Working location (hub code, e.g. "SIN"). */
  hub: string;
  /** Legal entity (e.g. "PIL"). */
  entity: string;
  loginIndex: number;
  /** True once the stored preferences were read on the client. */
  hydrated: boolean;
}

export const initialSettings: SettingsState = {
  theme: 'light',
  sidebarCollapsed: false,
  lang: 'en',
  hub: 'SIN',
  entity: 'PIL',
  loginIndex: 0,
  hydrated: false,
};

export type StoredSettings = Partial<Omit<SettingsState, 'hydrated'>>;

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettings,
  reducers: {
    settingsHydrated(state, action: PayloadAction<StoredSettings>) {
      return { ...state, ...action.payload, hydrated: true };
    },
    themeChanged(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    sidebarToggled(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    languageChanged(state, action: PayloadAction<LangCode>) {
      if (isLangCode(action.payload)) state.lang = action.payload;
    },
    hubChanged(state, action: PayloadAction<string>) {
      state.hub = action.payload;
    },
    entityChanged(state, action: PayloadAction<string>) {
      state.entity = action.payload;
    },
    loginSwitched(state, action: PayloadAction<number>) {
      state.loginIndex = action.payload;
    },
  },
});

export const { settingsHydrated, themeChanged, sidebarToggled, languageChanged, hubChanged, entityChanged, loginSwitched } =
  settingsSlice.actions;
