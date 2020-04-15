import path from "path";

const defaultTsEngineConfig = {
  entryFilename: "main.ts",
  extensions: ["js", "jsx", "ts", "tsx", "json", "es6", "mjs", "cjs"],
  outputDir: "dist",
  outputFilename: "main.js",
  srcDir: "src",
};

export const getTsEngineConfig = () => {
  const config = {
    ...defaultTsEngineConfig,
  };

  return {
    entryFilename: path.join(config.srcDir, config.entryFilename),
    extensions: config.extensions,
    outputDir: config.outputDir,
    outputFilename: path.join(config.outputDir, config.outputFilename),
    srcDir: config.srcDir,
  };
};
