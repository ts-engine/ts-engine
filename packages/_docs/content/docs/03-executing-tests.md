---
title: Executing tests
slug: executing-tests
---

# Executing tests

ts-engine runs test suites using Jest. All options are automatically forwarded onto Jest.

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

## Configuration

Jest and Babel configuration is supported, see [Configuration](/docs/configuration).
