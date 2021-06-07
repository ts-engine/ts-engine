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

# pass your app options after the file you want to run
tse run src/index.ts --port 3000
```

## Options

`--minify`

Minify JavaScript output files using [terser](https://github.com/terser/terser).

`--skip-typecheck`

Opt out of typechecking, this will also stop type declarations being produced.

`--watch`

Watch for changes, rebuild and restart your app.

`--bundle`

Bundle dependencies.

## Configuration

Babel configuration is supported, see [Configuration](/docs/configuration).
