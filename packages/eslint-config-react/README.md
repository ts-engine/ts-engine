<p align="center">
  <img 
    src="https://raw.githubusercontent.com/ts-engine/assets/master/logo.png"
    alt="ts-engine logo" 
  />
</p>
<h1 align="center">@ts-engine/eslint-config-react</h1>
<p align="center">
  <img style="display: inline-block; margin-right: 5px;" src="https://github.com/ts-engine/ts-engine/workflows/Verify/badge.svg" />
  <img style="display: inline-block; margin-right: 5px;" src="https://github.com/ts-engine/ts-engine/workflows/Publish/badge.svg" />
  <img style="display: inline-block; margin-right: 5px;" src="https://badgen.net/github/release/ts-engine/ts-engine" />
</p>

Provides the ts-engine React ESLint config if you want to extend it or allow your IDE to find it.

## Documentation

Checkout the official docs over at https://ts-engine.dev.

## Getting Started

Install the package

```sh
yarn add --dev @ts-engine/eslint-config @ts-engine/eslint-config-react
```

Create an ESLint config file

```json
// .eslintrc
{
  "extends": ["@ts-engine/eslint-config", "@ts-engine/eslint-config-react"]
}
```
