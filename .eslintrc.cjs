module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ["cypress/**/*.js", "cypress.config.js"],
      plugins: ["cypress"],
    },
  ],
  globals: {
    cy: "readonly",
    Cypress: "readonly",
    expect: "readonly",
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'jsx-a11y',
    'import',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    'import/prefer-default-export': 'off',
    'jsx-a11y/label-has-associated-control': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',

    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.jsx',
          '**/*.spec.jsx',
          'cypress.config.js',
          'vite.config.js',
          'cypress/**/*.js',
          'src/setupTests.js',
        ],
      },
    ],
    'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'no-plusplus': 'off',
    'no-nested-ternary': 'warn',
    'import/extensions': 'off',
  },
};