export const SUPPORTED_EXTENSIONS = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "mjs",
  "cjs",
  "es",
];

export const SUPPORTED_EXTENSIONS_REGEX = `(${SUPPORTED_EXTENSIONS.join("|")})`;

export const SUPPORTED_EXTENSIONS_WITH_DOTS = SUPPORTED_EXTENSIONS.map(
  (e) => `.${e}`
);
