/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  overrides: [
    {
      files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'],
      extends: ['plugin:cypress/recommended']
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-escape': 'off',
    'no-irregular-whitespace': 'off',
    'no-empty': 'off',
    'no-constant-condition': 'off',
    'no-async-promise-executor': 'off',
    'no-unsafe-finally': 'off',
    'no-unsafe-negation': 'off',
    'no-unsafe-optional-chaining': 'off',
    'no-unsafe-return': 'off',
    'no-var': 'warn',
    'vue/multi-word-component-names': 'off'
  }
}
