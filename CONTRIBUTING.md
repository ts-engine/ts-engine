# Contributing

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
yarn run:e2e:all
```

Or you can go into them and run them by themselves:

```sh
cd packages/@e2e-tests/node-app
yarn test:e2e
```

### Publishing

1. Build @ts-engine/cli

```sh
cd packages/cli
yarn build
```

2. Edit the versions

```sh
cd packages/@helpers/edit-version
yarn build
yarn start --version 1.1.0
```

3. Push branch and raise pull request and merge

4. Create release and tag in the format of `release-*` on the `master` branch on GitHub, this will trigger a release to NPM
