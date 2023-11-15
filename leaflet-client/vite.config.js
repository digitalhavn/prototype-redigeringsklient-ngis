import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  server: {
    port: 8000,
  },
  publicDir: 'public/eriksalv/TDT4290-leaflet-client',
  base: '/eriksalv/TDT4290-leaflet-client/',
  test: {
    coverage: {
      provider: 'v8',
      all: 'true',
      exclude: [...configDefaults.exclude, '**/models/**', '**/*.d.ts'],
    },
    environment: 'jsdom',
  },
  esbuild: {
    supported: {
      'top-level-await': true, //browsers can handle top-level-await features
    },
  },
});
