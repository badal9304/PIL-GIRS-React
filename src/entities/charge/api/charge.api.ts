import { serve } from '@/shared/api';
import { chargeDirectorySchema, type ChargeDirectory } from '../model/charge';
import { CHARGE_SEED } from './charge.seed';

/** Charge codes with reference data (sample data until the LMS charge-code sync is connected). */
export function fetchChargeDirectory(): Promise<ChargeDirectory> {
  return serve('charges', chargeDirectorySchema, () => CHARGE_SEED);
}
