---
title: Linting project
slug: linting-project
---

# Linting project

ts-engine provides linting via [ESLint](https://eslint.org/).

```sh
# lint all files
tse lint .

# lint and automatically fix what ESLint can fix
tse lint --fix .
```

## ESLint configuration

You can optionally provide a `.eslintrc` or `.eslintrc.js`. It will be automatically picked up and applied. You can either provide your own config completely or extend ts-engine's default ESLint configuration.

```json
{
  "extends": "@ts-engine/eslint-config",
  "rules" {
    // your rules go here
  }
}
```

## Options

`--fix`

Automatically fix linting errors that are fixable by ESLint.

## React support

[React](https://reactjs.org/) is supported out the box. If `react` is found in your `package.json` then React and a11y [ESLint](https://eslint.org/) configuration is automatically applied. This means your linting will catch issues related to web accessibility and React code.
