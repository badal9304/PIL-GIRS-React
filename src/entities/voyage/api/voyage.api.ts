import { serve } from '@/shared/api';
import { readJson, writeJson } from '@/shared/lib/storage';
import { z } from 'zod';
import {
  EMPTY_VOYAGE_CHANGES,
  ddContainerSchema,
  voyageChangesSchema,
  voyageMonthSchema,
  type DdContainer,
  type VoyageChanges,
  type VoyageMonth,
} from '../model/voyage';
import { generateDdContainers, generateMonth } from './voyage.seed';

/**
 * Voyage invoicing API. Voyages and containers are sample data until the LMS feed is connected; actions taken in
 * GIRS are kept in this browser (same key as the prototype).
 */
const CHANGES_KEY = 'girs.home';

/** Voyages at `port` for each day of `month` ("2026-11"). */
export function fetchVoyageMonth(port: string, month: string): Promise<VoyageMonth> {
  return serve(`voyages/${port}/${month}`, voyageMonthSchema, () => generateMonth(port, month));
}

export function fetchDdContainers(cc: string): Promise<DdContainer[]> {
  return serve(`dd/${cc}/containers`, z.array(ddContainerSchema), () => generateDdContainers(cc));
}

export function fetchVoyageChanges(): Promise<VoyageChanges> {
  return serve('voyages/changes', voyageChangesSchema, () => readJson(CHANGES_KEY, voyageChangesSchema, EMPTY_VOYAGE_CHANGES));
}

export async function saveVoyageChanges(changes: VoyageChanges): Promise<VoyageChanges> {
  const valid = await serve('voyages/changes:save', voyageChangesSchema, () => changes);
  writeJson(CHANGES_KEY, valid);
  return valid;
}
