# @ts-engine/cli

Command line tool to get TypeScript packages up and running faster. It removes a lot of the config overhead.

## Installation

```sh
yarn add --dev @ts-engine/cli
```

## Usage

```sh
# Display version
ts-engine --version

# Display help
ts-engine --help

# Run a command
ts-engine <command> <options>
```

## Commands

### Build

Code is built via [Babel](https://babeljs.io/) using [Rollup](https://rollupjs.org/).

The entry point of the package is always `src/main.ts`.

#### Building Node.js applications

When building a Node.js application all code and dependencies are built into a single file.

The output from this build is `dist/main.js`.

```sh
# Build
ts-engine build --node-app

# Build and watch
ts-engine build --node-app --watch
```

#### Building a library

When building a JavaScript library all code is built into a single file, however dependencies are not.

The outputs from this build are `dist/main.cjs.js` and `dist/main.esm.js`. This means the built library supports both Common JS and ES Modules when being consumed.

```sh
# Build
ts-engine build --library

# Build and watch
ts-engine build --library --watch
```

#### Build a standalone package

Sometimes a standalone package is useful as you can run the output file without requiring `node_modules` to provide any external dependencies. These are easier to use, share and deploy as there is just a single file. You can bundle dependencies into a Node.js application or a library with ts-engine.

```sh
# Node.js application
ts-engine build --node-app --bundle-dependencies

# Library
ts-engine build --library --bundle-dependencies
```

> **Note that not all npm packages will work, ts-engine uses Rollup internally and does not support dynamic calls to `require(...)` or circular dependencies.**

#### Extending Babel config

The default babel config can be extended by proving a `babel.config.js` file in the package folder.

To extend the default babel config see [ts-engines's babel preset](https://github.com/ts-engine/ts-engine/tree/master/packages/babel-preset).

To support React see [ts-engines's babel preset](https://github.com/ts-engine/ts-engine/tree/master/packages/babel-preset-react).

### Typecheck

Code is typechecked using [TypeScript](https://www.typescriptlang.org/).

```sh
# Check types only
ts-engine typecheck

# Check types and emit type declaration files
ts-engine typecheck --emit
```

### Lint

Code is linted using [ESLint](https://eslint.org/).

For IDE support and to see how to extend ESLint config see [ts-engines's lint config](https://github.com/ts-engine/ts-engine/tree/master/packages/eslint-config).

```sh
# Lint code
ts-engine lint

# Lint code and automatically fix fixable issues
ts-engine lint --fix
```

### Test

Unit tests are run using [Jest](https://jestjs.io/).

```sh
# Run tests once
ts-engine test

# All args EXCEPT for --config are forward onto jest
ts-engine test <jest_cli_args>
```

## Example package setup

### Minimal Node.js application package:

```ts
// package.json
{
  "name": "@examples/node-app",
  "version": "1.0.0",
  "license": "MIT",
  "private": true,
  "scripts": {
    "build": "ts-engine build --node-app",
    "build:watch": "ts-engine build --node-app --watch",
    "lint": "ts-engine lint",
    "test": "ts-engine test",
    "typecheck": "ts-engine typecheck"
  },
  "devDependencies": {
    "@ts-engine/cli": "latest"
  }
}

// src/main.ts
console.log("Hello world!");
```

### Minimal library package:

When building a library package ts-engine will check and enfore that `main`, `module` and `types` are set correctly in the package file, the build command will not complete a build until they are.

```ts
// package.json
{
  "name": "@examples/library",
  "version": "1.0.0",
  "license": "MIT",
  "main": "dist/main.cjs.js",
  "module": "dist/main.esm.js",
  "types": "dist/main.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "ts-engine build --library",
    "build:watch": "ts-engine build --library --watch",
    "lint": "ts-engine lint",
    "test": "ts-engine test",
    "typecheck": "ts-engine typecheck --emit"
  },
  "devDependencies": {
    "@ts-engine/cli": "latest"
  }
}

// src/main.ts
export const printHelloWorld = () => {
  console.log("Hello world!");
};
```
