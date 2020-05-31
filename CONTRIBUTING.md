# Contributing

## Getting started

### Install dependencies

This is a Yarn Workspace's powered mono repo and some packages depend on other packages in this repo. You can install all dependencies and wire up local packages by running Yarn.

```sh
yarn
```

### CLI

Note the cli package is built by a previous version of itself and so the devDependency to itself is always pinned to a previous version, never the version in the repo.

```sh
cd packages/cli
yarn build
yarn lint
yarn test
yarn typecheck
yarn start
```

### Run e2e tests

```sh
cd packages/private/e2e-tests
yarn test
```

### Bumping all package versions

There is a helper package that will bump all the `@ts-engine/*` package versions and dependencies in the whole repo. Note it will not update the @ts-engine/cli dev dependency version in @ts-engine/cli as it references a previous build to build itself.

```
cd packages/cli
yarn build
cd ../private/edit-version
yarn start --version M.m.p
```

### Publishing

Publishing to NPM is automated via GitHub Actions using the workflow at `.github.workflows/publish.yml. To trigger it create a release and tag in the format of`release-\*`on the`master` branch on GitHub.
