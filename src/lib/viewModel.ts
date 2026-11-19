import { useEffect, useState, useSyncExternalStore } from 'react';

export type AnyState = Record<string, any>;

/** App services a screen's view-model can call (toasts, routing). Injected by the page component. */
export interface ViewModelServices {
  toast: (message: string) => void;
  fadeToast: (message: string) => void;
}

const noop: ViewModelServices = { toast: () => {}, fadeToast: () => {} };

/**
 * Screen view-model: holds the screen state and turns it into the values the view renders.
 * Screens with a lot of business logic (filters, validation, document actions) keep it here,
 * framework-free, and the React view stays a pure function of `renderVals()`.
 */
export class ViewModel<S extends AnyState = AnyState, P = AnyState> {
  props: P;
  state: S = {} as S;
  protected services: ViewModelServices = noop;
  private listeners = new Set<() => void>();
  private version = 0;

  constructor(props?: P) {
    this.props = (props || {}) as P;
  }

  attach(services: ViewModelServices) {
    this.services = services;
  }

  setState(update: Partial<S> | ((s: S, p: P) => Partial<S>)) {
    const next: AnyState = typeof update === 'function' ? update(this.state, this.props) : { ...update };
    if ('__toast' in next) {
      // toasts are shown by the app shell, not kept in screen state
      const msg = next.__toast;
      delete next.__toast;
      this.services.toast(msg ? String(msg) : '');
    }
    this.state = { ...this.state, ...next };
    this.emit();
  }

  forceUpdate() {
    this.emit();
  }

  /** Hides a toast after a few seconds if it is still the one on screen. */
  fade(message: string) {
    this.services.fadeToast(message);
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getSnapshot = () => this.version;

  private emit() {
    this.version++;
    this.listeners.forEach((fn) => fn());
  }

  componentDidMount?(): void;
  componentWillUnmount?(): void;
  renderVals(): AnyState {
    return {};
  }
}

/** Creates a view-model once per mounted screen and re-renders when its state changes. */
export function useViewModel<M extends ViewModel>(create: () => M, services: ViewModelServices): M {
  const [vm] = useState(() => {
    const m = create();
    m.attach(services);
    return m;
  });
  vm.attach(services);
  useSyncExternalStore(vm.subscribe, vm.getSnapshot);
  useEffect(() => {
    vm.componentDidMount?.();
    return () => vm.componentWillUnmount?.();
  }, [vm]);
  return vm;
}
