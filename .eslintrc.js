module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  extends: 'eslint:recommended',
  env: {
    node: true
  },
  rules: {
  },
  globals: {
    test: true,
    describe: true,
    beforeEach: true,
    expect: true,
    jest: true,
    Promise: true,
    it: true
  }
};
