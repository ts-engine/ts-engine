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

## Options

`--minify`

Minify JavaScript output files using [terser](https://github.com/terser/terser).

`--skip-typecheck`

Opt out of typechecking, this will also stop type declarations being produced.

`--watch`

Watch for changes and rebuild.

## Output

Build output is written to `dist/`, the output directory structure matches the input structure. CommonJS and ES Module outputs are produced as well as type declarations and sourcemaps.

```
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

## Configuration

Babel configuration is supported, see [Configuration](/docs/configuration).
