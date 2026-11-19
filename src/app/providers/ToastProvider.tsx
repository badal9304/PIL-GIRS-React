import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './contexts';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const current = useRef('');
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((m: string) => {
    current.current = m;
    setMessage(m);
  }, []);
  const close = useCallback(() => show(''), [show]);
  const fade = useCallback(
    (m: string) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        if (current.current === m) show('');
      }, 5000);
    },
    [show],
  );

  const api = useMemo(() => ({ message, show, fade, close }), [message, show, fade, close]);
  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}
