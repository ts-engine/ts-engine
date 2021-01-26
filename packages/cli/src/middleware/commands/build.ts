import { Context, NextFunction } from "@leecheneler/cli";
import { PackageJsonContext } from "../package-json";
import { buildFiles, buildFilesAndWatch } from "../../build-files";

interface BuildOptions {
  watch: boolean;
  minify: boolean;
  "skip-typecheck": boolean;
  "emit-types": boolean;
  bundle: boolean;
  output: "cjs" | "esm";
  ext: string;
  extension: string;
}

export const build = () => async (
  ctx: Context<BuildOptions> & PackageJsonContext,
  next: NextFunction
) => {
  const output = ctx.options.output ?? "cjs";
  const ext = ctx.options.ext ?? ".js";

  if (!["cjs", "esm"].includes(output)) {
    ctx.throw(1, `Unknown output ${output}. Only cjs and esm are supported.`);
  }

  const [...filepaths] = ctx.options._;

  if (ctx.options.watch) {
    await buildFilesAndWatch(filepaths, {
      minify: ctx.options.minify,
      skipTypecheck: ctx.options["skip-typecheck"],
      emitTypes: ctx.options["emit-types"],
      bundle: ctx.options.bundle,
      output,
      ext,
      srcDir: ctx.package.srcDir,
      dependencies: ctx.package.dependencies,
      throw: ctx.throw,
    });
  } else {
    await buildFiles(filepaths, {
      minify: ctx.options.minify,
      skipTypecheck: ctx.options["skip-typecheck"],
      emitTypes: ctx.options["emit-types"],
      bundle: ctx.options.bundle,
      output,
      ext,
      srcDir: ctx.package.srcDir,
      dependencies: ctx.package.dependencies,
      throw: ctx.throw,
    });
  }

  // if in watch mode wait for promise that will never resolve,
  // we want the user kill the process or the app closing to
  if (ctx.options.watch) {
    await new Promise(() => {});
  }

  await next();
};
