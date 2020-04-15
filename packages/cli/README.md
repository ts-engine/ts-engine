# TS Engine Cli

Provides the TS Engine CLI tool `ts-engine <command> <options>`.

## Getting Started

### Install the package

```sh
yarn add --dev @ts-engine/cli
```

### Create entry file

```ts
// src/main.ts

console.log("Hello world!");
```

### Run a build

```sh
yarn run ts-engine build
```

### Check output

A new build will be available in `dist/main.js`.

## Commands

### Build

Build your code using [Rollup](https://rollupjs.org/).

```sh
# Single build
ts-engine build

# Build and watch for changes
ts-engine build --watch
```

### Typecheck

Type check your code using [TypeScript](https://www.typescriptlang.org/).

```sh
# Check types only
ts-engine typecheck

# Check types and emit type declaration files
ts-engine typecheck --emit
```

### Lint

Lint your code using [ESLint](https://eslint.org/).

```sh
# Lint your code
ts-engine lint

# Lint your code and automatically fix fixable issues
ts-engine lint --fix
```

### Test

Run your unit tests using [Jest](https://jestjs.io/).

```sh
# Run tests once
ts-engine test

# All args EXCEPT for --config are forward onto jest
ts-engine test <jest_cli_args>
```
