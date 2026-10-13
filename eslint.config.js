// Lints the repository tooling: scripts/ (JavaScript modules). Template code, the template-delivered site-meta package among it, is linted by the site's own ESLint after `npm run site:assemble`.
import js from '@eslint/js';
import globals from 'globals';

const unusedVars = ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }];

export default [
  {
    ignores: ['site/**', 'template-*/**', '.cf-studio/**', '.frontx-inventory/**', '**/node_modules/**', '**/dist/**', '**/coverage/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': unusedVars,
    },
  },
];
