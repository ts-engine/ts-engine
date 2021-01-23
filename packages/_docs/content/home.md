# ts-engine

> Write TypeScript packages with optionally zero configuration.

Setting up new [TypeScript](https://typescriptlang.org) packages is annoying. Installing and configuring the same packages over and over again is tedious and it is easy for tool versions to drift across multiple packages.

ts-engine aims to reduce package setup effort drastically. With just one dependency and optionally no configuration you can build, test and lint your packages.

```sh
yarn add --dev @ts-engine/cli@next

# for applications also install the runtime
yarn add @ts-engine/runtime@next
```

Build and typecheck your code using [Rollup](https://rollupjs.org), TypeScript and [Babel](https://babeljs.io).

```sh
tse build src/index.ts
```

Run your app directly from its TypeScript entry file.

```sh
tse run src/index.ts
```

Execute tests using [Jest](https://jestjs.io).

```sh
tse test
```

Lint your code using [ESLint](https://eslint.org) and format it with [Prettier](https://prettier.io).

```sh
tse lint .
```
