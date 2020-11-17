export const supportedExtensions = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "mjs",
  "cjs",
  "es",
];

export const supportedExtensionsWithDot = supportedExtensions.map(
  (e) => `.${e}`
);
