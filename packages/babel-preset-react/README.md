# TS Engine Babel Preset React

Provides React support.

## Getting Started

### Install the package

```sh
yarn add --dev @ts-engine/babel-preset @ts-engine/babel-preset-react
```

### Create a babel config file

The ordering is important as Babel presets are run last first.

```js
// .babel.config.js
module.exports = {
  presets: ["@ts-engine/babel-preset-react", "@ts-engine/babel-preset"],
};
```
