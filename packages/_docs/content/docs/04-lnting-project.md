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

ts-engine does not require an ESLint config file to be present in order to lint your code, however to get IDE hints you may want to add the above `.eslintrc` file to the root of your repository.

## Prettier configuration

[Prettier](https://prettier.io/) is supported out the box. No need to install it or even add a config file if you are happy with the default configuration. If you provide `.prettierrc` then it will automatically be applied.

## Options

`--fix`

Automatically fix linting errors that are fixable by ESLint.

## React support

[React](https://reactjs.org/) is supported out the box. If `react` is found in your `package.json` then React and a11y [ESLint](https://eslint.org/) configuration is automatically applied. This means your linting will catch issues related to web accessibility and React code.
