import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// BASE_PATH is set by the GitHub Pages workflow (e.g. /PIL-GIRS-React/); locally the app runs at /.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
  },
});
