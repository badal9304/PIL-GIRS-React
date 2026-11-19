import { createContext, useContext } from 'react';

export interface ShellState {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  /** Element at the end of the app root where screens render dialogs and drawers. */
  overlayRoot: HTMLElement | null;
}

export const ShellContext = createContext<ShellState>({ drawerOpen: false, setDrawerOpen: () => {}, overlayRoot: null });

export const useShell = () => useContext(ShellContext);
