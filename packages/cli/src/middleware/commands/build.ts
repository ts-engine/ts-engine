import { Context, NextFunction } from "@leecheneler/cli";
import { PackageJsonContext } from "../package-json";
import { buildFiles } from "../../build-files";

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

  await buildFiles(filepaths, {
    minify: ctx.options.minify,
    skipTypecheck: ctx.options["skip-typecheck"],
    watch: ctx.options.watch,
    srcDir: ctx.package.srcDir,
    throw: ctx.throw,
  });

  await next();
};
