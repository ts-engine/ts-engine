<p align="center">
  <img 
    src="https://raw.githubusercontent.com/ts-engine/assets/master/logo.png"
    alt="ts-engine logo" 
  />
</p>
<h1 align="center">@ts-engine/babel-preset-react</h1>
<p align="center">
  <img style="display: inline-block; margin-right: 5px;" src="https://github.com/ts-engine/ts-engine/workflows/Verify/badge.svg" />
  <img style="display: inline-block; margin-right: 5px;" src="https://github.com/ts-engine/ts-engine/workflows/Publish/badge.svg" />
  <img style="display: inline-block; margin-right: 5px;" src="https://badgen.net/github/release/ts-engine/ts-engine" />
</p>

A babel preset for ts-engine with React support.

## Documentation

Checkout the official docs over at https://ts-engine.dev.

## Getting Started

Install the package

```sh
yarn add --dev @ts-engine/babel-preset @ts-engine/babel-preset-react
```

Create a babel config file

```js
// .babel.config.js
module.exports = {
  presets: ["@ts-engine/babel-preset-react", "@ts-engine/babel-preset"],
};
```

This is applied automatically so you don't need to create this config file when you use the `--react` option.
