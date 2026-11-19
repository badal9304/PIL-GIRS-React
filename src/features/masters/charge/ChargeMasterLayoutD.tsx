import { useScreen } from '../../../hooks/useScreen';
import { ChargeMasterLayoutDModel } from './ChargeMasterLayoutDModel';
import { ChargeMasterLayoutDView } from './ChargeMasterLayoutDView';
import './ChargeMasterLayoutD.css';

/** System Master › Charge Master, layout D. */
export default function ChargeMasterLayoutD() {
  const v = useScreen(() => new ChargeMasterLayoutDModel({}));
  return <ChargeMasterLayoutDView v={v} />;
}
