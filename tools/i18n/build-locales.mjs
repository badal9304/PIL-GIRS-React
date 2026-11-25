#!/usr/bin/env node
/**
 * Builds public/locales/{lng}/{ns}.json.
 *
 *  - Typed namespaces (common, home, invoices, masters, search, uikit): every literal key passed to t('…') in the
 *    slices that own the namespace, plus menu labels for `common`. English files map each key to itself (natural
 *    keys); other languages take the translation from the phrase dictionary, either exactly or through the same
 *    matching rules the app uses at runtime (numbers, one-slot templates, "A · B", "Label: value").
 *  - phrases / patterns: the full phrase dictionary and one-slot templates per language, used to translate text
 *    composed at runtime (shared/hooks/usePhrase).
 *
 * Sources: tools/i18n/legacy-{lng}.json (the prototype dictionary) and tools/i18n/extra-{lng}.json (keys added in
 * the React app, e.g. interpolated pager text). Run with `npm run i18n:build` after adding or changing UI text.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
// the app's own phrase matcher (Node strips the TypeScript types on import)
import { PhraseTranslator } from '../../src/shared/lib/phraseTranslator.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'public', 'locales');
const LANGS = ['zh', 'ar', 'es'];

/** Which namespace a source file's t('…') keys belong to. First match wins. */
const OWNERS = [
  ['search', /^features\/global-search\//],
  ['home', /^(views\/home|features\/voyage-invoicing|entities\/voyage)\//],
  ['invoices', /^(views\/invoice-list|features\/invoice-management|entities\/invoice)\//],
  ['masters', /^(views\/(customer|contract|charge)-master|compositions\/master-record|features\/(customer|contract|charge)-master|entities\/(customer|contract|charge|approval))\//],
  ['uikit', /^views\/ui-kit\//],
  ['common', /.*/],
];

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(n) ? [p] : [];
  });

/** t('…'), t("…") and t(`…`) without ${} — the first argument only. */
const T_CALL = /(?<![\w.$])t\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\$]|\\.)*)`)\s*[,)]/g;
const unescape = (s) =>
  s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\(['"`\\])/g, '$1')
    .replace(/\\n/g, '\n');

const keys = Object.fromEntries(OWNERS.map(([ns]) => [ns, new Set()]));
for (const file of walk(SRC)) {
  const rel = relative(SRC, file).split('\\').join('/');
  const ns = OWNERS.find(([, re]) => re.test(rel))[0];
  const code = readFileSync(file, 'utf8');
  for (const m of code.matchAll(T_CALL)) keys[ns].add(unescape(m[1] ?? m[2] ?? m[3]));
}
// menu labels and screen names are rendered by the shell (common)
const screens = readFileSync(join(SRC, 'shared/constants/screens.ts'), 'utf8');
for (const m of screens.matchAll(/label: '((?:[^'\\]|\\.)*)'/g)) keys.common.add(unescape(m[1]));

const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
const write = (lng, ns, data) => {
  mkdirSync(join(OUT, lng), { recursive: true });
  writeFileSync(join(OUT, lng, ns + '.json'), JSON.stringify(sortObj(data), null, 2) + '\n');
};
const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback);

const report = [];
for (const [ns, set] of Object.entries(keys)) write('en', ns, Object.fromEntries([...set].map((k) => [k, k])));
write('en', 'phrases', {});
write('en', 'patterns', {});

for (const lng of LANGS) {
  const legacy = readJson(join(ROOT, 'tools/i18n', `legacy-${lng}.json`), { dict: {}, tpl: [] });
  const extra = readJson(join(ROOT, 'tools/i18n', `extra-${lng}.json`), {});
  const dict = { ...legacy.dict, ...extra };
  const matcher = new PhraseTranslator(lng, { dict, tpl: Object.fromEntries(legacy.tpl) });
  for (const [ns, set] of Object.entries(keys)) {
    const out = {};
    let missing = 0;
    for (const k of set) {
      if (Object.prototype.hasOwnProperty.call(dict, k)) out[k] = dict[k];
      else if (!k.includes('{{') && matcher.t(k) !== k) out[k] = matcher.t(k);
      else missing++;
    }
    write(lng, ns, out);
    report.push(`${lng}/${ns}: ${Object.keys(out).length}/${set.size} translated${missing ? ` (${missing} fall back to English)` : ''}`);
  }
  write(lng, 'phrases', dict);
  write(lng, 'patterns', Object.fromEntries(legacy.tpl));
}
console.log(report.join('\n'));
