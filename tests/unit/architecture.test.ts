import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Feature-Sliced layer rules: app -> core -> views -> compositions -> features -> entities -> shared.
 * A layer imports only lower layers; slices of one layer never import each other; other slices are imported
 * through their index.ts. Also: no `any`, no type-check suppressions.
 */
const SRC = join(process.cwd(), 'src');
const LAYERS = ['app', 'core', 'views', 'compositions', 'features', 'entities', 'shared'];
const SLICED = ['views', 'compositions', 'features', 'entities'];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(n) ? [p] : [];
  });

const files = walk(SRC).map((f) => ({ path: relative(SRC, f).split('\\').join('/'), code: readFileSync(f, 'utf8') }));
const importsOf = (code: string) => [...code.matchAll(/from '(@\/[^']+)'/g)].map((m) => m[1] ?? '');

describe('architecture', () => {
  it('layers import only lower layers, and other slices only through their public API', () => {
    const problems: string[] = [];
    for (const f of files) {
      const [layer, slice] = f.path.split('/');
      const li = LAYERS.indexOf(layer ?? '');
      for (const imp of importsOf(f.code)) {
        const [, tLayer, tSlice, ...rest] = imp.split('/');
        const ti = LAYERS.indexOf(tLayer ?? '');
        if (ti < 0) continue;
        if (ti < li) problems.push(`${f.path}: imports higher layer ${imp}`);
        if (ti === li && SLICED.includes(layer ?? '') && tSlice !== slice) problems.push(`${f.path}: imports sibling slice ${imp}`);
        if (ti > li && SLICED.includes(tLayer ?? '') && rest.length > 0) problems.push(`${f.path}: deep import ${imp}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('every slice has a public API', () => {
    const missing = SLICED.flatMap((layer) =>
      readdirSync(join(SRC, layer))
        .filter((s) => statSync(join(SRC, layer, s)).isDirectory())
        .filter((s) => !existsSync(join(SRC, layer, s, 'index.ts')))
        .map((s) => `${layer}/${s}`),
    );
    expect(missing).toEqual([]);
  });

  it('has no any and no type-check suppressions', () => {
    const bad = files.filter((f) => /:\s*any\b|\bas any\b|<any>|@ts-(nocheck|ignore|expect-error)/.test(f.code)).map((f) => f.path);
    expect(bad).toEqual([]);
  });
});
