import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Next.js rules plus the Feature-Sliced layer rules of this project:
 *   app -> core -> views -> compositions -> features -> entities -> shared
 * - a layer imports only from layers below it;
 * - slices of one layer do not import each other (compose them one layer up; inside a slice use relative imports);
 * - other slices are imported through their public API (index.ts), never a deep path.
 */
const LAYERS = ['app', 'core', 'views', 'compositions', 'features', 'entities', 'shared'];
const SLICED = ['views', 'compositions', 'features', 'entities'];

function layerRule(layer) {
  const i = LAYERS.indexOf(layer);
  const higher = LAYERS.slice(0, i);
  const sameLayerSlices = SLICED.includes(layer) ? [layer] : [];
  const lowerSliced = SLICED.filter((l) => LAYERS.indexOf(l) > i);
  const patterns = [];
  const forbidden = [...higher, ...sameLayerSlices];
  if (forbidden.length)
    patterns.push({
      group: forbidden.flatMap((l) => [`@/${l}`, `@/${l}/*`]),
      message: `"${layer}" may only import from lower layers (${LAYERS.slice(i + 1).join(', ') || 'none'}); slices of one layer are composed one layer up.`,
    });
  if (lowerSliced.length)
    patterns.push({
      group: lowerSliced.map((l) => `@/${l}/*/*`),
      message: 'Import another slice through its public API (index.ts), not a deep path.',
    });
  return { files: [`src/${layer}/**/*.{ts,tsx}`], rules: { 'no-restricted-imports': ['error', { patterns }] } };
}

export default [
  ...nextVitals,
  ...nextTs,
  { ignores: ['dist/**', '.next/**', 'next-env.d.ts', 'tools/**'] },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
  ...LAYERS.map(layerRule),
];
