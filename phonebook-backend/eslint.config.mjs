import globals from 'globals';
import js from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
  // 1. Apply ESLint's recommended rules
  js.configs.recommended,

  // 2. Custom configuration
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs', // For Node.js backend
      globals: { ...globals.node }, // Node.js global variable
      ecmaVersion: 'latest', // Support latest JavaScript features
    },
    plugins: {
      '@stylistic/js': stylisticJs, // Stylistic rules plugin
    },
    rules: {
      // Stylistic rules
      '@stylistic/js/indent': ['error', 2], // 2-space indentation
      '@stylistic/js/linebreak-style': ['error', 'unix'], // LF/Unix line endings
      '@stylistic/js/quotes': ['error', 'single'], // Single quotes
      '@stylistic/js/semi': ['error', 'never'], // No semicolons

      // Best practices
      eqeqeq: 'error', // Require strict equality (===)
      'no-trailing-spaces': 'error', // No trailing whitespace
      'object-curly-spacing': ['error', 'always'], // { space inside curly braces }
      'arrow-spacing': ['error', { before: true, after: true }], // Arrow function spacing

      // Overrides
      'no-console': 'off', // Allow console.log (for development)
    },
  },
  // 3. Ignore specific files/directories
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
];
