import { describe, expect, it } from 'vitest';
import { ViewModel } from '../lib/viewModel';

class Counter extends ViewModel<{ n: number }> {
  runs = 0;
  state = { n: 0 };
  renderVals() {
    this.runs++;
    return { n: this.state.n };
  }
}

describe('ViewModel.vals', () => {
  it('reuses the values until the state changes', () => {
    const vm = new Counter();
    const first = vm.vals();
    expect(vm.vals()).toBe(first);
    expect(vm.runs).toBe(1);
    vm.setState({ n: 1 });
    expect(vm.vals()).toEqual({ n: 1 });
    expect(vm.runs).toBe(2);
  });

  it('recomputes after forceUpdate (in-place data edits)', () => {
    const vm = new Counter();
    vm.vals();
    vm.forceUpdate();
    vm.vals();
    expect(vm.runs).toBe(2);
  });

  it('recomputes when the key for outside inputs changes', () => {
    const vm = new Counter();
    vm.vals('SIN|PIL');
    vm.vals('SIN|PIL');
    vm.vals('HKG|PIL');
    expect(vm.runs).toBe(2);
  });
});
