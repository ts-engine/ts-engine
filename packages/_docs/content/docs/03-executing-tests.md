---
title: Executing tests
slug: executing-tests
---

# Executing tests

ts-engine runs test suites using Jest.

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

## Options

All options are automatically forwarded onto Jest, see [Jest CLI Options](https://jestjs.io/docs/en/cli).

## Configuration

Jest and Babel configuration is supported, see [Configuration](/docs/configuration).
