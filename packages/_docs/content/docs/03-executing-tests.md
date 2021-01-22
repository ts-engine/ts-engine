---
title: Executing tests
slug: executing-tests
---

# Executing tests

ts-engine runs test suites using [Jest](https://jestjs.io/). All options are automatically forwarded onto Jest.

```sh
tse test

# options are forwarded onto Jest as if you were using it directly
tse test --coverage
tse test --watch
```

The default test regex is:

```
(/__tests__/.*|(.|/)(test|spec)).(js|ts|jsx|tsx|mjs|cjs|es)?$
```

## Jest configuration

You can optionally provide a `jest.config.js` file. It will be automatically picked up and applied.

`jest.setup.ts` or `jest.setup.js` can optionally be provided. It will be automatically applied to `setupFilesAfterEnv` in Jest config. If both `jest.setup.ts` and `jest.setup.js` are found then only `jest.setup.ts` is applied.

## Babel

[Babel](https://babeljs.io/) configuration files like `.babelrc` and `babel.config.js` are also automatically picked up.
