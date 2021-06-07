---
title: CLI reference
slug: cli-reference
---

# CLI reference

## Building code

```sh
tse build src/index.ts

# build multiple files
tse build src/index.ts src/test-utils/test-harness.ts

# minify output
tse build --minify src/index.ts

# emit type declaration files
tse build --emit-types src/index.ts

# skip typechecking
tse build --skip-typecheck src/index.ts

# watch for changes
tse build --watch src/index.ts

# bundle external dependencies
tse build --bundle src/index.ts

# define output type, cjs or esm
tse build --output cjs src/index.ts
tse build --output esm src/index.ts

# define output file extension
tse build --ext .cjs.js src/index.ts
```

## Running tests

```sh
tse test

# options are forwarded onto Jest as if you were using it directly
tse test --coverage
tse test --watch
```

## Linting project

```sh
# lint all files using a glob
tse lint .

# lint a directory
tse lint src

# fix fixable lint issues
tse lint --fix src
```

## Running a file

```sh
tse run src/index.ts

# pass ts-engine options before the file you want to run
tse run --watch src/index.ts

# pass your app options after the file you want to run
tse run src/index.ts --port 3000

# watch for changes
tse run --watch src/index.ts

# minify output
tse run --minify src/index.ts

# skip typecheck
tse run --skip-typecheck src/index.ts

# bundle external dependencies
tse run --bundle src/index.ts
```
