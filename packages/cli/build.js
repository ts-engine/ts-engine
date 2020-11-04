const esbuild = require("esbuild");
const pkg = require("./package.json");

esbuild
  .build({
    bundle: true,
    external: Object.keys(pkg.dependencies),
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    platform: "node",
    target: "node10.13",
  })
  .catch((error) => {
    console.error(error);
  });
