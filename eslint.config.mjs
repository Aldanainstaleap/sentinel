import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import love from 'eslint-config-love'
import tseslint from 'typescript-eslint'
import typescriptParser from '@typescript-eslint/parser'

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.idea',
      '.lh',
      'test',
      'coverage',
      'vitest.config.ts'
    ]
  },
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    ...love,
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      '@typescript-eslint': eslintPluginTypeScript
    },
    rules: {
      quotes: ['error', 'single'],
      'no-void': 'off',
      eqeqeq: 'off',
      'one-var': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/ban-types': 'off',
      camelcase: 'off',
      'no-mixed-operators': 'off',
      'comma-dangle': 'off',
      indent: 'off',      
      'strict-boolean-expressions': 'off',
      'restrict-template-expressions': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['src/database/entities/*.ts']    
  }
)
