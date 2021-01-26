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

By default the output files are in CommonJS format, however ES Module format is also supported. You can configure this with the `--output` option.

## Options

`--minify`

Minify JavaScript output files using [terser](https://github.com/terser/terser).

`--skip-typecheck`

Opt out of typechecking, this will also stop type declarations being produced.

`--watch`

Watch for changes and rebuild.

`--bundle`

Bundle dependencies.

`--output`

Output module type, `cjs` or `esm`. Defaults to `cjs`.

`--ext`

Output file extension. Defaults to `.js`.

## Output

Build output is written to `dist/`, the output directory structure matches the input structure. Along with the cjs or esm output type declarations and sourcemaps are also produced for each input.

```
src/index.ts -> dist/index.js
             -> dist/index.js.map
             -> dist/index.d.ts

src/test-utils/test-harness.ts -> dist/test-utils/test-harness.js
                               -> dist/test-utils/test-harness.js.map
                               -> dist/test-utils/test-harness.d.ts
```

## Configuration

Babel configuration is supported, see [Configuration](/docs/configuration).
