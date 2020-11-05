module.exports = {
  testRegex: "/__tests__/.*\\.test\\.[jt]sx?$",
  transform: {
    "^.+\\.tsx?$": "./jest-transformer.js",
  },
};
