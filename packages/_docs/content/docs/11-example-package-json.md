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
  "scripts": {
    "build": "tse build src/index.ts",
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
