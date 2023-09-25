import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  server: {
    port: 8000,
  },
  test: {
    coverage: {
      provider: 'v8',
      all: 'true',
      exclude: [...configDefaults.exclude, '**/models/**', "**/*.d.ts"]
    },
  },
});
