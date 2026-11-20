import { useMemo } from 'react';
import { useSettings, useToast } from '../../app/providers/contexts';
import { useViewModel } from '../../lib/viewModel';
import { HomeModel } from './HomeModel';
import { HomeView } from './HomeView';
import './Home.css';

/** Feeds the top-bar location and entity into the screen state before each render. */
class HomeScreenModel extends HomeModel {
  valsFor(hub: string, entity: string) {
    if (this.state.__hub !== hub || this.state.__ent !== entity) this.state = { ...this.state, __hub: hub, __ent: entity };
    return this.vals(hub + '|' + entity);
  }
}

/**
 * Home: landing workspace after login. Voyage Invoicing for the working location (exports loading and
 * imports discharging there) and D&D Billing. Location and entity come from the top bar.
 */
export default function HomePage() {
  const toast = useToast();
  const { hub, entity } = useSettings();
  const services = useMemo(() => ({ toast: toast.show, fadeToast: toast.fade }), [toast.show, toast.fade]);
  const vm = useViewModel(() => new HomeScreenModel({}), services);
  return <HomeView v={vm.valsFor(hub, entity)} />;
}
