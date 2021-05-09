---
title: Packages
slug: packages
---

# Packages

[`@ts-engine/cli`](https://www.npmjs.com/package/@ts-engine/cli)

Write TypeScript packages with optionally zero configuration.

[`@ts-engine/eslint-config`](https://www.npmjs.com/package/@ts-engine/eslint-config)

The default ESLint config for ts-engine.

[`@ts-engine/babel-preset`](https://www.npmjs.com/package/@ts-engine/babel-preset)

The default Babel preset for ts-engine.

## Deprecated packages

[`@ts-engine/eslint-config-react`](https://www.npmjs.com/package/@ts-engine/eslint-config-react)

The React ESLint config for ts-engine. React config is now applied automatically if React is detected.

[`@ts-engine/babel-preset-react`](https://www.npmjs.com/package/@ts-engine/babel-preset-react)

A Babel preset for ts-engine with React support. React config is now applied automatically if React is detected.

[`@ts-engine/runtime`](https://www.npmjs.com/package/@ts-engine/runtime)

Runtime dependencies for apps built with ts-engine. Relying on `@babel/preset-env` bundling babel helpers into builds. Promises are also no longer transpiled to use regenerator runtime because Promises are now very widely supported in Node and browsers.
