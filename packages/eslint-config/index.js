var packageJsonFinder = require("find-package-json");

const packageJson = packageJsonFinder(process.cwd()).next().value;
const hasReact =
  (packageJson.dependencies && packageJson.dependencies.react) ||
  (packageJson.devDependencies && packageJson.devDependencies.react) ||
  (packageJson.peerDependencies && packageJson.peerDependencies.react);

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
    "plugin:jsx-a11y/recommended",
    "plugin:jest-dom/recommended",
    "plugin:@typescript-eslint/recommended",
    ...(hasReact
      ? [
          "plugin:react/recommended",
          "plugin:react-hooks/recommended",
          "plugin:testing-library/react",
        ]
      : []),
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
    jsx: true,
  },
  plugins: [
    "prettier",
    "@typescript-eslint",
    "import",
    "jest",
    "jsx-a11y",
    "jest-dom",
    "testing-library",
    ...(hasReact ? ["react", "react-hooks"] : []),
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
    // some typescript-eslint recommended rules I disagree with in current ecosystem
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
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
    ...(hasReact
      ? {
          react: {
            version: "detect",
          },
        }
      : {}),
  },
};
