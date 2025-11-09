import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  include: ['src/**/*.spec.ts', 'tests/measure/**/*.spec.ts'],
  exclude: ['node_modules', '**/node_modules/**', 'tests/e2e/**'],
  },
})