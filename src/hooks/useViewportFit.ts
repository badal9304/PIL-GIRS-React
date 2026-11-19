import { useEffect, useState } from 'react';
import { setZoom } from '../lib/appBridge';

/** Design canvas width. The app is laid out at 1920px and scaled to the window, like the prototype. */
export const DESIGN_WIDTH = 1920;

function fit() {
  const z = Math.max(0.1, window.innerWidth / DESIGN_WIDTH);
  return { zoom: z, height: window.innerHeight / z };
}

export function useViewportFit() {
  const [state, setState] = useState(fit);
  useEffect(() => {
    const onResize = () => setState(fit());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  setZoom(state.zoom);
  return state;
}
