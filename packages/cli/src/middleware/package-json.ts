import { Context, NextFunction } from "@leecheneler/cli";
import fs from "fs-extra";
import path from "path";

export interface PackageJsonContext {
  package: {
    dir: string;
    srcDir: string;
  };
}

export const packageJson = () => async (
  ctx: Context & PackageJsonContext,
  next: NextFunction
) => {
  const packageJsonExists = await fs.pathExists(
    path.resolve(process.cwd(), "package.json")
  );

  if (packageJsonExists) {
    ctx.package = {
      dir: process.cwd(),
      srcDir: path.resolve(process.cwd(), "src"),
    };

    return next();
  }

  ctx.throw(
    1,
    "Could not locate package.json. Please run ts-engine in the same directory as your package.json file."
  );
};
