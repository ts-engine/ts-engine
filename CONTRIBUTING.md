# Contributing to TS Engine

## Getting started

### Install dependencies

This is a Yarn Workspace's powered mono repo and some packages depend on other packages in this repo. You can install all dependencies and wire up local packages by running Yarn.

```sh
yarn
```

### Build

In order to run the e2e tests you need to build the cli and the test utils.

```sh
cd packages/@e2e-tests/test-utils
yarn build

cd ../../cli
yarn build
```

### Run e2e tests

Under `packages/@e2e-tests/` there are many test packages of varying states. They each have the local built version of `@ts-engine/cli` installed and symlinked locally.

You can run them all in one go from the root of the repo:

```sh
yarn run:e2e
```

Or you can go into them and run them by themselves:

```sh
cd packages/@e2e-tests/node-app
yarn test:e2e
```

### Publishing

There is a helper package just for publishing. It takes care of:

- Updating public package versions
- Publishing public packages
- Creating, committing to and pushing a `publish-<version>` branch

Publish process should be:

1. Build @ts-engine/cli

```
cd packages/cli
yarn build
```

2. Build @helpers/publish

```
cd packages/@helpers/publish
yarn build
```

3. Run the publish tool

```
cd packages/@helpers/publish
yarn start
```

4. Go to GitHub, raise a PR and merge it to the `master` branch ASAP
