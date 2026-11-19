import { useScreen } from '../../../hooks/useScreen';
import { ChargeMasterLayoutCModel } from './ChargeMasterLayoutCModel';
import { ChargeMasterLayoutCView } from './ChargeMasterLayoutCView';
import './ChargeMasterLayoutC.css';

/** System Master › Charge Master, layout C. */
export default function ChargeMasterLayoutC() {
  const v = useScreen(() => new ChargeMasterLayoutCModel({}));
  return <ChargeMasterLayoutCView v={v} />;
}
