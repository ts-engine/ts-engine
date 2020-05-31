module.exports = {
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:jest-dom/recommended",
    "plugin:testing-library/recommended",
  ],
  parserOptions: {
    jsx: true,
  },
  plugins: ["react", "react-hooks", "jsx-a11y", "jest-dom", "testing-library"],
  settings: {
    react: {
      version: "detect",
    },
  },
};
