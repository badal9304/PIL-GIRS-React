#!/usr/bin/env python3
"""One-off: splits the prototype CSS into base (shared), master-kit and per-page scoped files."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from scope_css import rules, scope

SRC = (sys.argv[1] if len(sys.argv) > 1 else '../PIL---GIRS').rstrip('/') + '/'
DST = os.path.join(os.path.dirname(__file__), '..', '..', 'src')
PAGES = {
    'invoice-list-v2': ('features/invoices/InvoiceList.css', '.pg-invoices'),
    'customer-master-c': ('features/masters/customer/CustomerMasterLayoutC.css', '.pg-customer-c'),
    'customer-master-d': ('features/masters/customer/CustomerMasterLayoutD.css', '.pg-customer-d'),
    'contract-master-c': ('features/masters/contract/ContractMasterLayoutC.css', '.pg-contract-c'),
    'contract-master-d': ('features/masters/contract/ContractMasterLayoutD.css', '.pg-contract-d'),
    'charge-master-c': ('features/masters/charge/ChargeMasterLayoutC.css', '.pg-charge-c'),
    'charge-master-d': ('features/masters/charge/ChargeMasterLayoutD.css', '.pg-charge-d'),
}
R = {}
for f in PAGES:
    s = open(SRC + f + '.html').read()
    R[f] = rules(s[s.find('<style>') + 7:s.find('</style>')])
common = set(R['invoice-list-v2'])
for f in PAGES:
    common &= set(R[f])
HDR = '/* Ported from the GIRS prototype. %s */\n'
def w(path, txt):
    p = os.path.join(DST, path); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w').write(txt + '\n')
# the dark logo is swapped in SideNav (src depends on the theme), so the CSS swap is dropped
LOGO = '.theme[data-theme=dark] img[src="pil-logo.png"]{content:url(pil-logo-dark.png)}'
w('styles/base.css', HDR % 'Shared tokens, base elements and app shell (light + dark).' + '\n'.join(r for r in R['invoice-list-v2'] if r in common).replace(LOGO, ''))
# each screen keeps its own rules in their original order (order decides which rule wins), scoped to the screen
for f, (path, P) in PAGES.items():
    rest = [r for r in R[f] if r not in common]
    w(path, HDR % ('Screen styles, scoped to %s.' % P) + scope('\n'.join(rest), P))
    print(f, len(R[f]), 'own', len(rest))
