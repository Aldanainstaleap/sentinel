import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],

      exclude: [
        '**/routes/**',
        '**/interfaces/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/test/**',
        '**/*.d.ts',
        'src/app.ts',
        'eslint.config.mjs',
        'vitest.config.ts'
      ]
    }
  }
})
