import { createSlice, type PayloadAction, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';

/** The app toast (bottom-right status message). One message at a time. */
export interface ToastState {
  message: string;
}

export const toastSlice = createSlice({
  name: 'toast',
  initialState: { message: '' } as ToastState,
  reducers: {
    toastShown(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
    toastClosed(state) {
      state.message = '';
    },
  },
});

export const { toastShown, toastClosed } = toastSlice.actions;

interface ToastRoot {
  toast: ToastState;
}

export const selectToastMessage = (s: ToastRoot): string => s.toast.message;

const FADE_MS = 5000;
let fadeTimer: ReturnType<typeof setTimeout> | undefined;

/** Hides `message` after 5 s if it is still the one on screen. */
export const fadeToast =
  (message: string): ThunkAction<void, ToastRoot, unknown, UnknownAction> =>
  (dispatch, getState) => {
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      if (selectToastMessage(getState()) === message) dispatch(toastClosed());
    }, FADE_MS);
  };
