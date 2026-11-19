#!/usr/bin/env python3
"""Small CSS scoper used when porting the prototype styles.

scope(css, '.pg-x') prefixes every selector so page styles only apply under the page root:
  .foo .bar                   -> .pg-x .foo .bar
  .theme[data-theme=dark] .a  -> .theme[data-theme=dark].pg-x .a   (the page class sits on the theme root)
@media blocks are scoped recursively; @keyframes / @font-face are left as they are.
"""
import re


def tokens(css):
    """Yields ('rule', selector, body) / ('at', prelude, inner) / ('raw', text)."""
    i, n = 0, len(css)
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    n = len(css)
    while i < n:
        while i < n and css[i].isspace():
            i += 1
        if i >= n:
            break
        j = css.find('{', i)
        if j < 0:
            break
        prelude = css[i:j].strip()
        # find matching brace
        depth, k, q = 0, j, None
        while k < n:
            ch = css[k]
            if q:
                if ch == q:
                    q = None
            elif ch in '"\'':
                q = ch
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    break
            k += 1
        body = css[j + 1:k]
        if prelude.startswith('@'):
            yield ('at', prelude, body)
        else:
            yield ('rule', prelude, body)
        i = k + 1


def split_top(s, sep=','):
    out, buf, depth, q = [], '', 0, None
    for ch in s:
        if q:
            buf += ch
            if ch == q:
                q = None
            continue
        if ch in '"\'':
            q = ch
        elif ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        elif ch == sep and depth == 0:
            out.append(buf)
            buf = ''
            continue
        buf += ch
    out.append(buf)
    return [x.strip() for x in out if x.strip()]


def first_compound(sel):
    depth, q = 0, None
    for i, ch in enumerate(sel):
        if q:
            if ch == q:
                q = None
            continue
        if ch in '"\'':
            q = ch
        elif ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        elif depth == 0 and ch in ' >+~':
            return sel[:i], sel[i:]
    return sel, ''


def scope_sel(sel, P):
    if re.match(r'^(:root|html|body)\b', sel):
        return sel
    first, rest = first_compound(sel)
    if '.theme' in first or '.groot' in first:
        # insert before pseudo-elements/classes at the end of the compound
        m = re.match(r'^(.*?)((::?[a-z-]+(\([^)]*\))?)*)$', first)
        return m.group(1) + P + m.group(2) + rest
    return P + ' ' + sel


def scope(css, P):
    out = []
    for kind, pre, body in tokens(css):
        if kind == 'rule':
            out.append(','.join(scope_sel(s, P) for s in split_top(pre)) + '{' + body.strip() + '}')
        elif pre.startswith(('@media', '@supports', '@container')):
            out.append(pre + '{' + scope(body, P) + '}')
        else:
            out.append(pre + '{' + body + '}')
    return '\n'.join(out)


def rules(css):
    """Flattens css to a list of canonical rule strings (for diffing pages)."""
    out = []
    for kind, pre, body in tokens(css):
        if kind == 'rule':
            out.append(pre + '{' + body.strip() + '}')
        else:
            out.append(pre + '{' + body + '}')
    return out
