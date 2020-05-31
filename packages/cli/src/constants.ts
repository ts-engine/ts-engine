export const srcDir = "src";
export const outputDir = "dist";

export const entryFilename = "main.ts";
export const entryFilepath = `./${srcDir}/${entryFilename}`;

export const outputFilename = "main.js";
export const outputFilepath = `./${outputDir}/${outputFilename}`;

export const cjsOutputFilename = "main.cjs.js";
export const cjsOutputFilepath = `./${outputDir}/${cjsOutputFilename}`;

export const esmOutputFilename = "main.esm.js";
export const esmOutputFilepath = `./${outputDir}/${esmOutputFilename}`;

export const extensions = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "es6",
  "mjs",
  "cjs",
];
export const extensionsWithDots = extensions.map((e) => `.${e}`);

export const srcFileGlob = `${srcDir}/**/*.{${extensions.join(",")}}`;
