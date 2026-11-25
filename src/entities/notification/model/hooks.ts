'use client';

import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fadeToast, selectToastMessage, toastClosed, toastShown, type ToastState } from './toastSlice';

export interface ToastActions {
  show: (message: string) => void;
  /** Hides `message` after 5 s if it is still showing. */
  fade: (message: string) => void;
  close: () => void;
}

/** Toast actions. Stable, so screens that only show toasts don't re-render when one appears. */
export function useToast(): ToastActions {
  const dispatch = useDispatch<ThunkDispatch<{ toast: ToastState }, unknown, UnknownAction>>();
  return useMemo(
    () => ({
      show: (m: string) => dispatch(toastShown(m)),
      fade: (m: string) => dispatch(fadeToast(m)),
      close: () => dispatch(toastClosed()),
    }),
    [dispatch],
  );
}

/** Toast actions in the shape screen models take (ScreenServices). */
export function useToastServices(): { toast: (m: string) => void; fadeToast: (m: string) => void } {
  const { show, fade } = useToast();
  return useMemo(() => ({ toast: show, fadeToast: fade }), [show, fade]);
}

export function useToastMessage(): string {
  return useSelector(selectToastMessage);
}
