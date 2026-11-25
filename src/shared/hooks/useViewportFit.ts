'use client';

import { useEffect, useState } from 'react';
import { setZoom } from '../lib/navigationBridge';

/** Design canvas width. The app is laid out at 1920px and scaled to the window, like the prototype. */
export const DESIGN_WIDTH = 1920;

export interface ViewportFit {
  zoom: number;
  height: number;
}

function fit(): ViewportFit {
  if (typeof window === 'undefined') return { zoom: 1, height: 1080 };
  const z = Math.max(0.1, window.innerWidth / DESIGN_WIDTH);
  return { zoom: z, height: window.innerHeight / z };
}

/** Zoom and height that fit the 1920px canvas to the window. Starts unscaled so server HTML and hydration match. */
export function useViewportFit(): ViewportFit {
  const [state, setState] = useState<ViewportFit>({ zoom: 1, height: 1080 });
  useEffect(() => {
    const onResize = () => setState(fit());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => setZoom(state.zoom), [state.zoom]);
  return state;
}
