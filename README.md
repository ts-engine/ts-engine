<style>
  .c-header {
    text-align: center;
  }
</style>

<header class="c-header">
  <img 
    src="https://raw.githubusercontent.com/ts-engine/assets/master/logo.png"
    alt="ts-engine logo" 
  />
  <h1>ts-engine</h1>
</header>

![Verify](https://img.shields.io/github/workflow/status/ts-engine/ts-engine/Verify?label=Verify&style=flat-square)
![Publish](https://img.shields.io/github/workflow/status/ts-engine/ts-engine/Publish?label=Publish&style=flat-square)

ts-engine is a tool that provides build, lint, test and typechecking functionality for TypeScript packages via an easy to use command line interface. It supports building Node.js applications and JavaScript libraries. This tool is not currently suitable for building websites.

## Public packages

|                                 |                                                  |                                                                                                                                                                                                              |                                                   |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `@ts-engine/babel-preset`       | The default Babel preset for ts-engine.          | <a href="https://www.npmjs.com/package/@ts-engine/babel-preset" rel="noopener noreferrer" target="_blank"><img src="https://img.shields.io/npm/v/@ts-engine/babel-preset?style=flat-square"></a>             | [README](./packages/babel-preset/README.md)       |
| `@ts-engine/babel-preset-react` | A Babel preset for ts-engine with React support. | <a href="https://www.npmjs.com/package/@ts-engine/babel-preset-react" rel="noopener noreferrer" target="_blank"><img src="https://img.shields.io/npm/v/@ts-engine/babel-preset-react?style=flat-square"></a> | [README](./packages/babel-preset-react/README.md) |
| `@ts-engine/cli`                | Core package providing the ts-engine CLI.        | <a href="https://www.npmjs.com/package/@ts-engine/cli" rel="noopener noreferrer" target="_blank"><img src="https://img.shields.io/npm/v/@ts-engine/cli?style=flat-square"></a>                               | [README](./packages/cli/README.md)                |
| `@ts-engine/eslint-config`      | The default ESLint config for ts-engine.         | <a href="https://www.npmjs.com/package/@ts-engine/eslint-config" rel="noopener noreferrer" target="_blank"><img src="https://img.shields.io/npm/v/@ts-engine/eslint-config?style=flat-square"></a>           | [README](./packages/eslint-config/README.md)      |

## Examples

Example Node.js applications and libraries can be found [here](./packages/@examples).
