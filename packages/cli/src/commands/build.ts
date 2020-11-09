import fs from "fs-extra";
import { Arguments, CommandBuilder } from "yargs";
import * as esbuild from "esbuild";
import { findPackageJson } from "../utils";

const command = "build <entrypoints...>";

const description = "Build code using ESBuild.";

const builder: CommandBuilder = (yargs) => {
  yargs
    .positional("entrypoints", { type: "string" })
    .requiresArg("entrypoints");
  yargs.boolean("w").alias("w", "watch").default("watch", false);
  yargs.boolean("skip-typecheck").default("skip-typecheck", false);
  yargs.boolean("bundle").default("bundle", false);

  return yargs;
};

interface BuildArgs {
  watch: boolean;
  skipTypecheck: boolean;
  bundle: boolean;
  entrypoints: string[];
}

const handler = async (argv: Arguments<BuildArgs>) => {
  const packageJson = findPackageJson();

  // when the bundle option is passed all externals are included in the build
  const external = argv.bundle
    ? []
    : [
        ...Object.keys(packageJson?.dependencies ?? {}),
        ...Object.keys(packageJson?.devDependencies ?? {}),
        ...Object.keys(packageJson?.peerDpendencies ?? {}),
      ];

  try {
    // first compile to common js, this is the buidl we allow to output warnings/errors
    const commonJsResults = await esbuild.build({
      bundle: true,
      external,
      entryPoints: argv.entrypoints,
      outdir: "dist",
      platform: "node",
      target: ["es2015"],
      format: "cjs",
      plugins: [],
      sourcemap: true,
      write: false,
    });

    for (let file of commonJsResults.outputFiles ?? []) {
      await fs.ensureDir(file.path.substring(0, file.path.lastIndexOf("/")));
      await fs.writeFile(file.path, Buffer.from(file.contents));
      console.log(file.path);
    }

    // then compile es module js, we silent building warnings for this build to stop duplicate errors
    const esModuleResults = await esbuild.build({
      bundle: true,
      external,
      entryPoints: argv.entrypoints,
      outdir: "dist",
      platform: "node",
      target: ["es2015"],
      format: "esm",
      plugins: [],
      sourcemap: true,
      outExtension: {
        ".js": ".esm.js",
      },
      logLevel: "silent",
      write: false,
    });

    for (let file of esModuleResults.outputFiles ?? []) {
      await fs.ensureDir(file.path.substring(0, file.path.lastIndexOf("/")));
      await fs.writeFile(file.path, Buffer.from(file.contents));
      console.log(file.path);
    }
  } catch (error) {
    console.error(error.message);
  }
};

export const build = {
  command,
  description,
  builder,
  handler,
};
