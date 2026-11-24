import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/',
      'coverage/',
      'demo/.next/',
      'demo/src/payload-types.ts',
      'demo/src/app/(payload)/',
      'demo/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['packages/*/src/**/*.tsx', 'demo/src/**/*.tsx'],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
);
