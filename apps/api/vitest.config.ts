import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    alias: {
      '@swades/db': '../../packages/db/src/index.ts',
    },
  },
});
