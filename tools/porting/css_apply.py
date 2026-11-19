#!/usr/bin/env python3
"""Rewrites stylesheet rules as Tailwind `@apply` rules where every declaration maps exactly to utilities.

    .chip { display: inline-flex; gap: 6px; height: 24px }   ->   .chip { @apply inline-flex gap-1.5 h-6; }

Rules that cannot be expressed exactly (custom properties, !important, vendor prefixes, `all`, `font`
shorthands, quoted values, conflicting shorthands) are left as plain CSS. Usage:
    python3 tools/porting/css_apply.py src/styles/base.css src/features/**/*.css
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from scope_css import tokens, split_top  # noqa: E402
import css2tw  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
css2tw.load_tokens(re.findall(r'--color-([a-z0-9]+):', open(os.path.join(ROOT, 'src', 'styles', 'tailwind.css')).read()))


def decls(body):
    out = []
    for d in split_top(body, ';'):
        if ':' not in d:
            return None
        k, v = d.split(':', 1)
        out.append((k.strip(), ' '.join(v.split())))
    return out


def convert(css, stats, ind='  '):
    out = []
    for kind, pre, body in tokens(css):
        if kind == 'at':
            if pre.startswith(('@media', '@supports', '@layer', '@container')):
                out.append('%s%s {\n%s\n%s}' % (ind, pre, convert(body, stats, ind + '  '), ind))
            else:
                out.append('%s%s {%s}' % (ind, pre, body))
            continue
        d = decls(body)
        cls = css2tw.to_classes(d) if d else None
        sel = ',\n'.join(ind + x for x in split_top(pre)).lstrip()
        if cls:
            stats[0] += 1
            out.append('%s%s {\n%s  @apply %s;\n%s}' % (ind, sel, ind, ' '.join(cls), ind))
        else:
            stats[1] += 1
            # kept as written (whitespace inside values such as content strings matters)
            lines = [x.strip() for x in split_top(body, ';')]
            out.append('%s%s {\n%s\n%s}' % (ind, sel, '\n'.join('%s  %s;' % (ind, x) for x in lines if x), ind))
    return '\n'.join(out)


def run(path):
    s = open(path).read()
    head = s[:s.find('@layer components')]
    if '@reference' not in head:
        ref = os.path.relpath(os.path.join(ROOT, 'src', 'styles', 'tailwind.css'), os.path.dirname(path))
        head = head.rstrip('\n') + ('\n' if head.strip() else '') + "@reference '%s';\n\n" % (ref if ref.startswith('.') else './' + ref)
    body = s[s.find('@layer components'):]
    inner = body[body.find('{') + 1:body.rfind('}')]
    stats = [0, 0]
    out = head + '@layer components {\n' + convert(inner, stats) + '\n}\n'
    open(path, 'w').write(out)
    print('%s: %d @apply, %d plain' % (os.path.relpath(path, ROOT), stats[0], stats[1]))


if __name__ == '__main__':
    for p in sys.argv[1:]:
        run(p)
