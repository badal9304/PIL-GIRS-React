import type { NextConfig } from 'next';

/**
 * Static export for GitHub Pages. BASE_PATH is set by the deploy workflow
 * ("/PIL-GIRS-React/" for main, "/PIL-GIRS-React/preview/" for the preview branch); locally the app runs at "/".
 * The export is written to dist/, which the shared deploy workflow publishes.
 */
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
};

export default nextConfig;
