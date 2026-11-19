import { useScreen } from '../../../hooks/useScreen';
import { ContractMasterLayoutCModel } from './ContractMasterLayoutCModel';
import { ContractMasterLayoutCView } from './ContractMasterLayoutCView';
import './ContractMasterLayoutC.css';

/** System Master › Contract Master, layout C. */
export default function ContractMasterLayoutC() {
  const v = useScreen(() => new ContractMasterLayoutCModel({}));
  return <ContractMasterLayoutCView v={v} />;
}
