import { combineReducers } from '@reduxjs/toolkit';
import { toastSlice } from '@/entities/notification';
import { settingsSlice } from '@/features/settings';

/** Global client state only (UI preferences, the toast). Server data lives in the TanStack Query cache. */
export const rootReducer = combineReducers({
  settings: settingsSlice.reducer,
  toast: toastSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
