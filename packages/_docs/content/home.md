# ts-engine

> Write TypeScript packages with optionally zero configuration.

Setting up new TypeScript packages is annoying. Installing the same packages over and over again, writing the same configuration files over and over again. Such duplication is pain and its easy for you tooling version to drift across mutliple packages if you maintain many.

ts-engine does away with installing all those packages and setting up all that configuration by providing all of it preconfigured via a single dependency.

```sh
yarn add --dev @ts-engine/cli

# for applications also install the runtime
yarn add @ts-engine/runtime
```

Build and typecheck your code using [Rollup](https://rollupjs.org/guide/en/), [TypeScript](https://www.typescriptlang.org/) and [Babel](https://babeljs.io/).

```sh
tse build src/index.ts
```

Run your app in watch mode.

```sh
tse run --watch src/index.ts
```

Execute tests using [Jest](https://jestjs.io/).

```sh
tse test
```

Lint your code using [ESLint](https://eslint.org/).

```sh
tse lint .
```
