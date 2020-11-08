"use strict";

const esbuild = require("esbuild");
const pkg = require("./package.json");

esbuild
  .build({
    bundle: true,
    external: [
      ...Object.keys(pkg.dependencies ? pkg.dependencies : {}),
      ...Object.keys(pkg.devDependencies ? pkg.devDependencies : {}),
      ...Object.keys(pkg.peerDpendencies ? pkg.peerDpendencies : {}),
    ],
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    platform: "node",
    target: "node10.13",
  })
  .catch((error) => {
    console.error(error);
  });
