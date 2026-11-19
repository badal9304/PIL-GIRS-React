import { useLocation } from 'react-router-dom';
import { useScreen } from '../../hooks/useScreen';
import { InvoiceListModel } from './InvoiceListModel';
import { InvoiceListView } from './InvoiceListView';
import './InvoiceList.css';

function InvoiceListScreen() {
  const v = useScreen(() => new InvoiceListModel({}));
  return <InvoiceListView v={v} />;
}

/**
 * Invoicing › Invoice List: Ready to invoice (B/Ls from LMS) and Invoices.
 * Deep links (?q=, ?open=<invoice no>, ?rv=<B/L>, ?tab=ready) start the screen in that state.
 */
export default function InvoiceListPage() {
  const { search } = useLocation();
  return <InvoiceListScreen key={search} />;
}
