import { useScreen } from '../../../hooks/useScreen';
import { CustomerMasterLayoutDModel } from './CustomerMasterLayoutDModel';
import { CustomerMasterLayoutDView } from './CustomerMasterLayoutDView';
import './CustomerMasterLayoutD.css';

/** System Master › Customer Master, layout D. */
export default function CustomerMasterLayoutD() {
  const v = useScreen(() => new CustomerMasterLayoutDModel({}));
  return <CustomerMasterLayoutDView v={v} />;
}
