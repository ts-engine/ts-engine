---
title: Configuration
slug: configuration
---

# Configuration

> Write TypeScript packages with optionally zero configuration.

ts-engine does not require any configuration by default. However you can optionally customise some configuration.

## Babel

You can optionally provide a `.babelrc` or `babel.config.js` file. It will be automatically picked up and applied. You can either provide your own config completely or extend ts-engine's default Babel preset.

```js
module.exports = {
  presets: ["@ts-engine/babel-preset"],
  // your config goes here
};
```

## Jest

You can optionally provide a `jest.config.js` file. It will be automatically picked up and applied.

`jest.setup.ts` or `jest.setup.js` can optionally be provided. It will be automatically applied to `setupFilesAfterEnv` in Jest config. If both `jest.setup.ts` and `jest.setup.js` are found then only `jest.setup.ts` is applied.

## ESLint

You can optionally provide a `.eslintrc` or `.eslintrc.js`. It will be automatically picked up and applied. You can either provide your own config completely or extend ts-engine's default ESLint configuration.

```json
{
  "extends": "@ts-engine/eslint-config",
  "rules": {
    // your rules go here
  }
}
```

ts-engine does not require an ESLint config file to be present in order to lint your code, however to get IDE hints you may want to add the above `.eslintrc` file to the root of your repository.

## Prettier

Prettier is supported out the box. No need to install it or even add a config file if you are happy with the default configuration. If you provide `.prettierrc` then it will automatically be applied.
