"use strict";

const path = require("path");
const fs = require("fs-extra");
const pkg = require("./package.json");
const esbuild = require("esbuild");

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

module.exports = {
  getCacheKey: () => {
    // Forces Jest to ignore cache
    return Math.random().toString();
  },
  process: (src, filename) => {
    const filenameParts = filename.split("/");
    const outfile = path.join(
      require.resolve("./package.json").replace("package.json", ""),
      "/node_modules/.cache/jest-transformer",
      `${filenameParts[filenameParts.length - 1]}-${Date.now()}.js`
    );

    esbuild.buildSync({
      sourcemap: "inline",
      format: "cjs",
      bundle: true,
      entryPoints: [filename],
      external,
      target: "node10.13",
      platform: "node",
      outfile,
    });

    let js = fs.readFileSync(outfile, "utf-8");
    fs.removeSync(outfile);

    return js;
  },
};
