---
title: Example package.json
slug: example-package-json
---

# Example package.json

## For a library

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.esm.d.ts",
  "scripts": {
    "build": "yarn build:cjs && yarn build:esm",
    "build:cjs": "tse build src/index.ts --emit-types --ext .cjs.js",
    "build:esm": "tse build src/index.ts --emit-types --ext .esm.js --output esm",
    "lint": "tse lint .",
    "test": "tse test --coverage"
  },
  "devDependencies": {
    "@ts-engine/cli": "latest"
  }
}
```

## For an application

When writing an application remember to install `@ts-engine/runtime`.

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tse build src/index.ts",
    "lint": "tse lint .",
    "start": "tse run src/index.ts",
    "test": "tse test --coverage"
  },
  "dependencies": {
    "@ts-engine/runtime": "latest"
  },
  "devDependencies": {
    "@ts-engine/cli": "latest"
  }
}
```
