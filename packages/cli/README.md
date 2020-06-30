<p align="center">
  <img 
    src="https://raw.githubusercontent.com/ts-engine/assets/master/logo.png"
    alt="ts-engine logo" 
  />
</p>
<h1 align="center">@ts-engine/cli</h1>
<p align="center">
  <img style="display: inline-block; margin-right: 5px;" src="https://github.com/ts-engine/ts-engine/workflows/Verify/badge.svg" />
  <img style="display: inline-block; margin-right: 5px;" src="https://github.com/ts-engine/ts-engine/workflows/Publish/badge.svg" />
  <img style="display: inline-block; margin-right: 5px;" src="https://badgen.net/github/release/ts-engine/ts-engine" />
</p>

Write TypeScript packages with optionally zero configuration. Build, lint, start, test and typecheck without any configuration. Whilst ts-engine works out the box without any configuration it is open to extension. You can provide custom Babel, ESLint and Jest configuration.

## Documentation

Checkout the official docs over at https://ts-engine.dev.

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

#### Building libraries

When building a JavaScript library all code is built into a single file, however dependencies are not.

The outputs from this build are `dist/main.cjs.js` and `dist/main.esm.js`. This means the built library supports both Common JS and ES Modules when being consumed.

```sh
# Build
ts-engine build --library

# Build and watch
ts-engine build --library --watch
```

#### Bundling dependencies

Sometimes it is useful to bundle dependencies into the output file so you can run the file without `node_modules`. This makes it easier to use, share and deploy as it is a single file. You can bundle dependencies into a Node.js application or a library with ts-engine.

```sh
# Node.js application
ts-engine build --node-app --bundle-dependencies

# Library
ts-engine build --library --bundle-dependencies
```

> **Not all packages can be bundled, ts-engine uses Rollup internally and does not support dynamic calls to `require(...)` or circular dependencies, as well as other things.**

#### Extending Babel config

The default babel config can be extended by proving a `babel.config.js` file in the package folder.

To extend the default babel config see [ts-engines's babel preset](https://github.com/ts-engine/ts-engine/tree/master/packages/babel-preset).

To support React see [ts-engines's babel preset](https://github.com/ts-engine/ts-engine/tree/master/packages/babel-preset-react).

### Typecheck

Code is typechecked using [TypeScript](https://www.typescriptlang.org/).

```sh
# Check types only
ts-engine typecheck

# Check types and emit type declaration files
ts-engine typecheck --emit

# Watch for changes
ts-engine typecheck --watch
ts-engine typecheck --emit --watch
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

### Start

Build and immediately run Node.js applications. This speeds up developer workflow as you don't need to manually stop and rerun your application after builds.

```sh
# Build and run Node.js application
ts-engine start

# Build and run Node.js application on changes
ts-engine start --watch
```

Bundling dependencies is supported just like in the `build` command.

```sh
# Build and run Node.js application
ts-engine start --bundle-dependencies

# Build and run Node.js application on changes
ts-engine start --watch --bundle-dependencies
```

Forward arguments onto the application using the `--args` options.

```sh
# The options "--one --two three" will be forward onto the Node.js application
ts-engine start --watch --args --one --two three
```

### Test

Unit tests are run using [Jest](https://jestjs.io/). The default jest config can be extended by using a standard `jest.config.js` file. **Updating the `transform` option may lead to compilation issues when running tests.**

```sh
# Run tests once
ts-engine test

# All args EXCEPT for --config are forward onto jest
ts-engine test <jest_cli_args>
```

### New package

Create new Node.js application and library packages using the following command.

```sh
# Create Node.js application package
ts-engine new-package --node-app --name my-app

# Create a library package
ts-engine new-package --library --name my-library
```

## First class React support

React is supported as a first class citizen with zero configuration required via the `--react` option.

```sh
# Compile React code
ts-engine build --library --react
ts-engine build --node-app --react
ts-engine start --react

# Lint React code, applies best practice React linting
# as well as adding a11y linting
ts-engine lint --react

# Test react code
ts-engine test --react

# Create new React packages
ts-engine new-package --library --react --name my-react-lib
ts-engine new-package --node-app --react --name my-react-app
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
    "start": "ts-engine start",
    "start:watch": "ts-engine start --watch",
    "test": "ts-engine test",
    "typecheck": "ts-engine typecheck"
  },
  "dependencies": {
    "@ts-engine/runtime": "latest"
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
