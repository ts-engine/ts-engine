---
title: Building your code
slug: building-your-code
---

# Building your code

ts-engine can build one or more files at once. As part of the build all TypeScript files within the package are typechecked. All files must be within the `src/` directory.

```sh
tse build src/index.ts

# build multiple files
tse build src/index.ts src/test-utils/test-harness.ts
```

## Output

Build output is written to `dist/`, the output directory structure matches the input structure. CommonJS and ES Module outputs are produced as well as type declarations and sourcemaps.

```sh
src/index.ts -> dist/index.js
             -> dist/index.js.map
             -> dist/index.d.ts
             -> dist/index.cjs
             -> dist/index.cjs.map
             -> dist/index.cjs.d.ts

src/test-utils/test-harness.ts -> dist/test-utils/test-harness.js
                               -> dist/test-utils/test-harness.js.map
                               -> dist/test-utils/test-harness.d.ts
                               -> dist/test-utils/test-harness.cjs
                               -> dist/test-utils/test-harness.cjs.map
                               -> dist/test-utils/test-harness.cjs.d.ts
```

## Options

`--minify`

Minify JavaScript output files using [terser](https://github.com/terser/terser).

`--skip-typecheck`

Opt out of typechecking, this will also stop type declarations being produced.

`--watch`

Watch for changes and rebuild.

## Babel configuration

You can supply your own Babel configuration the usual way via `.babelrc` or `babel.config.js`. This will be picked up and used. You can either provide your own config completely or extend ts-engine's default Babel configuration.

```js
module.exports = {
  presets: ["@ts-engine/babel-preset"],
  // your config goes here
};
```
