import { describe, expect, it } from 'vitest';
import { legacyOf, routeOf } from '@/shared/lib/routing';

describe('routeOf', () => {
  it('maps prototype file names to routes and keeps the query', () => {
    expect(routeOf('invoice-list-v2.html?q=SIN')).toBe('/invoicing/invoice-list?q=SIN');
    expect(routeOf('receipting.html')).toBe('/receivables/receipting');
  });
  it('maps master layouts C and D', () => {
    expect(routeOf('customer-master-d.html')).toBe('/system-master/customer-master/layout-d');
    expect(routeOf('charge-master.html?q=OFT')).toBe('/system-master/charge-master/layout-c?q=OFT');
  });
  it('leaves app routes and external links alone', () => {
    expect(routeOf('/control/reports')).toBe('/control/reports');
    expect(routeOf('https://example.com')).toBe('https://example.com');
  });
  it('resolves the prototype page of a route', () => {
    expect(legacyOf('/invoicing/invoice-list')).toBe('invoice-list-v2.html');
    expect(legacyOf('/system-master/contract-master/layout-d/')).toBe('contract-master-d.html');
  });
});
