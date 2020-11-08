module.exports = {
  testRegex: "/__tests__/.*\\.test\\.[jt]sx?$",
  transform: {
    "^.+\\.tsx?$": "@ts-engine/jest-transform",
  },
};
