import path from "path";

const defaultTsEngineConfig = {
  entryFilename: "main.ts",
  extensions: ["js", "jsx", "ts", "tsx", "json", "es6", "mjs", "cjs"],
  outputDir: "dist",
  outputLibraryCjsFilename: "main.cjs.js",
  outputLibraryEsmFilename: "main.esm.js",
  outputNodeAppFilename: "main.js",
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
    outputLibraryCjsFilename: path.join(
      config.outputDir,
      config.outputLibraryCjsFilename
    ),
    outputLibraryEsmFilename: path.join(
      config.outputDir,
      config.outputLibraryEsmFilename
    ),
    outputNodeAppFilename: path.join(
      config.outputDir,
      config.outputNodeAppFilename
    ),
    srcDir: config.srcDir,
  };
};
