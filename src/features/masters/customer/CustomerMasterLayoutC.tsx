import { useScreen } from '../../../hooks/useScreen';
import { CustomerMasterLayoutCModel } from './CustomerMasterLayoutCModel';
import { CustomerMasterLayoutCView } from './CustomerMasterLayoutCView';
import './CustomerMasterLayoutC.css';

/** System Master › Customer Master, layout C. */
export default function CustomerMasterLayoutC() {
  const v = useScreen(() => new CustomerMasterLayoutCModel({}));
  return <CustomerMasterLayoutCView v={v} />;
}
