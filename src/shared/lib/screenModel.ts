/** App services a screen model can call. Injected by the screen's hook (toasts come from the notifications feature). */
export interface ScreenServices {
  toast: (message: string) => void;
  /** Hides `message` after a few seconds if it is still the one on screen. */
  fadeToast: (message: string) => void;
}

/** A state update; `__toast` shows a message in the app toast instead of being stored. */
export type StateUpdate<S> = Partial<S> & { __toast?: string };

/** What a screen's value builder may do: update state, show toasts, call actions. */
export interface ScreenContext<S, A = undefined> {
  set: (update: StateUpdate<S>) => void;
  toast: (message: string) => void;
  fade: (message: string) => void;
  actions: A;
}

const noServices: ScreenServices = { toast: () => undefined, fadeToast: () => undefined };

/**
 * Screen model: holds one screen's interaction state and turns it, plus the server data it was given (`D`, from
 * TanStack Query) and the actions it may call (`A`, mutations), into the values its view renders. Business rules
 * live here, framework-free and unit-testable; the React view stays a pure function of `vals()`.
 * Subscribed to with `useScreenModel` (useSyncExternalStore).
 */
export abstract class ScreenModel<S extends object, V, D = undefined, A = undefined> {
  state: S;
  protected services: ScreenServices = noServices;
  private readonly listeners = new Set<() => void>();
  private version = 0;
  private dataVersion = 0;
  private memo: { version: number; key: string; vals: V } | null = null;
  private dataRef: D | undefined;
  private actionsRef: A | undefined;
  private actionsSet = false;

  protected constructor(initial: S) {
    this.state = initial;
  }

  /** Server data the model renders. Set by useScreenModel on every render; a new object invalidates the values. */
  setData(data: D): void {
    if (data !== this.dataRef) {
      this.dataRef = data;
      this.dataVersion++;
    }
  }

  protected get data(): D {
    if (this.dataRef === undefined) throw new Error(`${this.constructor.name}: data read before it loaded`);
    return this.dataRef;
  }

  /** Mutations and other async actions the model may call (injected by the screen hook). */
  setActions(actions: A): void {
    this.actionsRef = actions;
    this.actionsSet = true;
  }

  protected get actions(): A {
    if (!this.actionsSet) throw new Error(`${this.constructor.name}: actions not attached`);
    return this.actionsRef as A;
  }

  attach(services: ScreenServices): void {
    this.services = services;
  }

  setState(update: StateUpdate<S> | ((s: S) => StateUpdate<S>)): void {
    const { __toast, ...patch } = typeof update === 'function' ? update(this.state) : update;
    if (__toast !== undefined) this.services.toast(__toast);
    this.state = { ...this.state, ...(patch as Partial<S>) };
    this.emit();
  }

  /** Re-renders after data the model reads (outside `state`) changed in place. */
  forceUpdate(): void {
    this.emit();
  }

  toast(message: string): void {
    this.services.toast(message);
  }

  fade(message: string): void {
    this.services.fadeToast(message);
  }

  readonly subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  readonly getSnapshot = (): number => this.version;

  /** Context handed to the screen's value builder. */
  protected context(): ScreenContext<S, A> {
    return {
      set: (u) => this.setState(u),
      toast: (m) => this.toast(m),
      fade: (m) => this.fade(m),
      actions: this.actions,
    };
  }

  /** Runs an async action and reports a failure in the toast instead of leaving the screen in a broken state. */
  protected run(task: () => Promise<void>, failure: string): void {
    task().catch((e: unknown) => this.toast(failure + (e instanceof Error && e.message ? ' ' + e.message : '')));
  }

  private emit(): void {
    this.version++;
    this.listeners.forEach((fn) => fn());
  }

  mount?(): void;
  unmount?(): void;

  protected abstract renderVals(): V;

  /**
   * renderVals(), cached until the state changes (or `key` does, for inputs kept outside the state such as
   * query data or the top-bar location). Renders caused by the shell then reuse the values.
   */
  vals(extraKey = ''): V {
    const key = this.dataVersion + '|' + extraKey;
    const m = this.memo;
    if (m && m.version === this.version && m.key === key) return m.vals;
    const vals = this.renderVals();
    this.memo = { version: this.version, key, vals };
    return vals;
  }
}

/** Load state of a screen's data, for its loading / error states. */
export interface ScreenStatus {
  isError: boolean;
  error: Error | null;
  retry: () => void;
}
