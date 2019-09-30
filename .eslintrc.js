module.exports = {
  env: {
    browser: true,
    es6: true,
    'jest/globals': true
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "max-len": 0,
    "object-curly-newline": [
      "error",
      {
        consistent: true,
      },
    ],
  },
  plugins: [
    "jest"
  ],
};
