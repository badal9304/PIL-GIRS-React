#!/usr/bin/env python3
"""Port of the prototype Home screen (index.html: Voyage Invoicing + D&D Billing) into React.
Writes features/home/{homeData.ts, HomeModel.ts, HomeView.tsx, Home.css}. Run from the repo root:
    python3 tools/porting/port_home.py /path/to/PIL---GIRS
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
import port_pages as P  # noqa: E402
from scope_css import rules, scope  # noqa: E402

SRC = (sys.argv[1] if len(sys.argv) > 1 else '../PIL---GIRS').rstrip('/') + '/'
P.SRC = SRC


def port_logic():
    tpl, lg = P.read('index')
    parts = P.decls(lg)
    names = [n for n, c in parts if n not in P.SHELL_DECLS and n != 'GirsPage']
    data = [c for n, c in parts if n in names]
    model = [c for n, c in parts if n == 'GirsPage'][0]
    P.write('features/home/homeData.ts', P.HEAD + '''/* Home: sample voyages, B/Ls and D&D containers (generated per location and date), formatting,
   and the .xlsx writer used for follow-up attachments. Plain TypeScript, no React dependency. */
import { USER } from '../../app/session/user';
import '../../lib/legacy/girsDocs.js';

export const USER_NAME = USER.name;

''' + '\n'.join(P.fix_logic(P.export_decl(c)) for c in data))
    P.write('features/home/HomeModel.ts', P.HEAD + '''/* Home view-model: Voyage Invoicing (date navigation, workload ribbon, voyages table, voyage panel,
   Ready-to-invoice popup, follow-up mail with Excel attachment) and D&D Billing.
   The working location and entity come from the top bar (state.__hub, state.__ent). */
import { ViewModel } from '../../lib/viewModel';
import {
  USER_NAME,
  %s
} from './homeData';

''' % ',\n  '.join(names) + P.fix_logic(model) + '\nexport { GirsPage as HomeModel };\n')
    return tpl


def port_view(tpl):
    ghead, main, extras = P.split_template(tpl)
    view = P.finish(P.view_file('HomeView', ghead, main, extras, 'Home: the landing workspace of a port / office user.'), 2)
    # tabs sit flush under the header (prototype main: padding 0 20px 24px)
    view = view.replace('    <Page\n', '    <Page\n      mainClassName="pt-0 px-5 pb-6"\n', 1)
    P.write('features/home/HomeView.tsx', view)


def port_css():
    page = open(SRC + 'index.html').read()
    own = rules(page[page.find('<style>') + 7:page.find('</style>')])
    base = open(os.path.join(P.ROOT, 'styles', 'base.css')).read()
    base_rules = set(rules(base))
    inv = open(SRC + 'invoice-list-v2.html').read()
    shared = set(rules(inv[inv.find('<style>') + 7:inv.find('</style>')])) & set(own)
    # shared rules already live in base.css (or are identical across screens); keep the Home-only ones
    # rules already in base.css are shared by every screen; everything else is scoped to Home
    rest = [r for r in own if r not in base_rules]
    P.write('features/home/Home.css', '/* Ported from the GIRS prototype. Screen styles, scoped to .pg-home. */\n@layer components {\n' + scope('\n'.join(rest), '.pg-home') + '\n}\n')
    print('home css rules', len(rest))


if __name__ == '__main__':
    t = port_logic()
    port_view(t)
    port_css()
    print('ported home')
