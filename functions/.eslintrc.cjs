module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'import/no-internal-modules': 'off',
    'no-unused-vars': 'off',
    'import/no-unresolved': 'off', // Temporarily disable this rule
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
      },
    },
  },
  overrides: [
    {
      files: ['**/*.mjs'],
      rules: {
        'max-len': ['error', { 'code': 280 }],
      },
    },
  ],
};
