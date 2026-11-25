import { describe, expect, it } from 'vitest';
import { ScreenModel, type ScreenContext } from '@/shared/lib/screenModel';

interface CounterState {
  n: number;
}

class Counter extends ScreenModel<CounterState, { n: number; total: number }, { base: number }, undefined> {
  runs = 0;
  constructor() {
    super({ n: 0 });
  }
  protected renderVals() {
    this.runs++;
    return { n: this.state.n, total: this.state.n + this.data.base };
  }
  ctx(): ScreenContext<CounterState, undefined> {
    return this.context();
  }
}

describe('ScreenModel', () => {
  it('reuses the values until the state changes', () => {
    const m = new Counter();
    m.setData({ base: 10 });
    const first = m.vals();
    expect(m.vals()).toBe(first);
    expect(m.runs).toBe(1);
    m.setState({ n: 1 });
    expect(m.vals()).toEqual({ n: 1, total: 11 });
    expect(m.runs).toBe(2);
  });

  it('recomputes when new data arrives, or the outside key changes', () => {
    const m = new Counter();
    m.setData({ base: 1 });
    m.vals('SIN');
    m.setData({ base: 2 });
    expect(m.vals('SIN').total).toBe(2);
    m.vals('HKG');
    expect(m.runs).toBe(3);
  });

  it('sends __toast to the toast service instead of storing it', () => {
    const m = new Counter();
    m.setActions(undefined);
    const shown: string[] = [];
    m.attach({ toast: (x) => shown.push(x), fadeToast: () => undefined });
    m.ctx().set({ n: 2, __toast: 'Saved' });
    expect(shown).toEqual(['Saved']);
    expect(m.state).toEqual({ n: 2 });
  });

  it('notifies subscribers on every change', () => {
    const m = new Counter();
    let calls = 0;
    const off = m.subscribe(() => calls++);
    m.setState({ n: 1 });
    m.forceUpdate();
    off();
    m.setState({ n: 2 });
    expect(calls).toBe(2);
  });
});
