import { createContext, useContext } from 'react';

export interface ShellState {
  /** Element at the end of the app root where screens render dialogs and drawers. */
  overlayRoot: HTMLElement | null;
}

export const ShellContext = createContext<ShellState>({ overlayRoot: null });

export const useShell = () => useContext(ShellContext);
