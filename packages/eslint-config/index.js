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
    "plugin:jest/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:jest-dom/recommended",
    "plugin:testing-library/recommended",
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
    jsx: true,
    sourceType: "module",
  },
  plugins: [
    "prettier",
    "@typescript-eslint",
    "import",
    "jest",
    "react",
    "react-hooks",
    "jsx-a11y",
    "jest-dom",
    "testing-library",
  ],
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
    // Advanced users are fine importing jest
    "jest/no-jest-import": "off",
    // Not always true, when using libraries like RTL you don't always need expect calls
    "jest/expect-expect": "off",
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
    react: {
      version: "detect",
    },
  },
};
