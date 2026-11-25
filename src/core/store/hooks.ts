import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState } from './rootReducer';
import type { AppDispatch, AppStore } from './store';

/** Typed Redux hooks for the app (core). Feature slices expose their own typed selectors and hooks. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
