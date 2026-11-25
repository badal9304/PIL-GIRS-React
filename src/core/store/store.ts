import { configureStore } from '@reduxjs/toolkit';
import { rootReducer, type RootState } from './rootReducer';

export function makeStore(preloaded?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState: preloaded });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
