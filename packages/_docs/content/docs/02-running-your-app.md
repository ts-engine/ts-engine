---
title: Running your app
slug: running-your-app
---

# Running your app

ts-engine supports building and running your app, this is very useful during local development. For instance you don't need to manually stop your server, rebuild it and restart it.

```sh
tse run src/index.ts

# pass ts-engine options before the file you want to run
tse run --watch src/index.ts

# pass options your want forwarded to your app after the file you want to run
tse run src/index.ts --port 3000
```

## Options

`--minify`

Minify JavaScript output files using [terser](https://github.com/terser/terser).

`--skip-typecheck`

Opt out of typechecking, this will also stop type declarations being produced.

`--watch`

Watch for changes, rebuild and restart your app.

## Babel configuration

You can optionally provide a `.babelrc` or `babel.config.js`. It will be automatically picked up and applied. You can either provide your own config completely or extend ts-engine's default Babel configuration.

```js
module.exports = {
  presets: ["@ts-engine/babel-preset"],
  // your config goes here
};
```

## React support

[React](https://reactjs.org/) is supported out the box. If `react` is found in your `package.json` then React's [Babel](https://babeljs.io/) preset is applied automatically. This means your builds and tests will support JSX.
