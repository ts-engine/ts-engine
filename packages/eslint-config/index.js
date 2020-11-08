module.exports = {
  env: {
    browser: true,
    jest: true,
    node: true,
    serviceworker: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:jest/recommended",
  ],
  globals: {
    console: "readonly",
    document: "readonly",
    fetch: "readonly",
    module: "writable",
    window: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  plugins: ["prettier", "@typescript-eslint", "import", "jest"],
  rules: {
    "prettier/prettier": "error",
    "no-var": "error",
    "@typescript-eslint/no-unused-vars": "error",
    // Safe to disable the following rules as TSC will throw, ESLint doesn't understand interfaces properly,
    // https://github.com/eslint/typescript-eslint-parser/issues/437
    "no-undef": "off",
    "no-unused-vars": "off",
    "import/named": "off",
    "import/no-unresolved": "off",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
          ".json",
          ".es6",
          ".mjs",
          ".cjs",
        ],
      },
    },
    // Always ignore typescript as it adds about 90 seconds to the runtime of the import plugin
    "import/ignore": ["typescript"],
  },
};
