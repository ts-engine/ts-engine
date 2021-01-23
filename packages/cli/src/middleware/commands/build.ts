import { Context, NextFunction } from "@leecheneler/cli";
import { PackageJsonContext } from "../package-json";
import { buildFiles, buildFilesAndWatch } from "../../build-files";

interface BuildOptions {
  watch: boolean;
  minify: boolean;
  "skip-typecheck": boolean;
}

export const build = () => async (
  ctx: Context<BuildOptions> & PackageJsonContext,
  next: NextFunction
) => {
  const [...filepaths] = ctx.options._;

  if (ctx.options.watch) {
    await buildFilesAndWatch(filepaths, {
      minify: ctx.options.minify,
      skipTypecheck: ctx.options["skip-typecheck"],
      srcDir: ctx.package.srcDir,
      throw: ctx.throw,
    });
  } else {
    await buildFiles(filepaths, {
      minify: ctx.options.minify,
      skipTypecheck: ctx.options["skip-typecheck"],
      srcDir: ctx.package.srcDir,
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
