import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './styles/base.css';
/* Screen styles load before the shared components so that, as in the prototype, the approved
   components win a tie and a more specific screen rule still wins. */
import './features/home/Home.css';
import './features/invoices/InvoiceList.css';
import './features/masters/charge/ChargeMasterLayoutC.css';
import './features/masters/charge/ChargeMasterLayoutD.css';
import './features/masters/contract/ContractMasterLayoutC.css';
import './features/masters/contract/ContractMasterLayoutD.css';
import './features/masters/customer/CustomerMasterLayoutC.css';
import './features/masters/customer/CustomerMasterLayoutD.css';
import './styles/ui.css';
import './styles/app.css';
import { App } from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
