"use strict";

const path = require("path");
const fs = require("fs-extra");
const esbuild = require("esbuild");
const uuid = require("uuid");

// All temp files are stored in the same place with a cache busting name
const getTempFilename = (filename, cacheBuster) => {
  return path.join(
    require.resolve("./package.json").replace("package.json", ""),
    "/node_modules/.temp/jest-transformer",
    `${cacheBuster}-${filename}`
  );
};

module.exports = {
  getCacheKey: () => {
    // Forces Jest to ignore cache
    return Math.random().toString();
  },
  process: (src, filename) => {
    const cacheBuster = uuid.v4();
    const filenameParts = filename.split("/");
    const file = filenameParts[filenameParts.length - 1];

    const jsFilename = getTempFilename(`${file}`, cacheBuster);
    const sourcemapFilename = getTempFilename(`${file}.map`, cacheBuster);

    // build file using esbuild, don't perform bundling or it will break code coverage
    esbuild.buildSync({
      sourcemap: "external",
      format: "cjs",
      entryPoints: [filename],
      target: "node10.13",
      platform: "node",
      outfile: jsFilename,
    });

    // read compiled js and sourcemap, delete the temp files as they aren't needed again
    let js = fs.readFileSync(jsFilename, "utf-8");
    fs.removeSync(jsFilename);
    let sourcemap = fs.readFileSync(sourcemapFilename, "utf-8");
    fs.removeSync(sourcemapFilename);

    return {
      code: js,
      map: JSON.parse(sourcemap),
    };
  },
};
