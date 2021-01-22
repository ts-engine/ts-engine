---
title: Linting project
slug: linting-project
---

# Linting project

ts-engine provides linting via ESLint and formatting via Prettier.

```sh
# lint all files
tse lint .

# lint and automatically fix what ESLint can fix
tse lint --fix .
```

## Options

`--fix`

Automatically fix linting errors that are fixable by ESLint.

## Configuration

ESLint abnd Prettier configuration is supported, see [Configuration](/docs/configuration).
