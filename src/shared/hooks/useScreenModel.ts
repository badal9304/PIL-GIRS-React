'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { ScreenModel, ScreenServices } from '../lib/screenModel';

const noSubscribe = (): (() => void) => () => undefined;
const noSnapshot = (): number => -1;

/**
 * Creates a screen model once its data has loaded (so its initial state can depend on the data, e.g. deep links),
 * keeps its data and actions current, and re-renders when its state changes. Returns null until then.
 */
export function useScreenModel<D, A, M extends ScreenModel<object, unknown, D, A>>(
  create: () => M,
  services: ScreenServices,
  data: D | undefined,
  actions: A,
): M | null {
  const [model, setModel] = useState<M | null>(null);
  if (model === null && data !== undefined) setModel(create());
  if (model) {
    model.attach(services);
    model.setActions(actions);
    if (data !== undefined) model.setData(data);
  }
  const subscribe = useCallback((fn: () => void) => (model ? model.subscribe(fn) : noSubscribe()), [model]);
  const snapshot = useCallback(() => (model ? model.getSnapshot() : noSnapshot()), [model]);
  useSyncExternalStore(subscribe, snapshot, snapshot);
  useEffect(() => {
    if (!model) return;
    model.mount?.();
    return () => model.unmount?.();
  }, [model]);
  return data === undefined ? null : model;
}
