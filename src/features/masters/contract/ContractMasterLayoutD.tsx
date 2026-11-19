import { useScreen } from '../../../hooks/useScreen';
import { ContractMasterLayoutDModel } from './ContractMasterLayoutDModel';
import { ContractMasterLayoutDView } from './ContractMasterLayoutDView';
import './ContractMasterLayoutD.css';

/** System Master › Contract Master, layout D. */
export default function ContractMasterLayoutD() {
  const v = useScreen(() => new ContractMasterLayoutDModel({}));
  return <ContractMasterLayoutDView v={v} />;
}
