import { Context, NextFunction } from "@leecheneler/cli";
import fs from "fs-extra";
import path from "path";

export interface PackageJsonContext {
  package: {
    dir: string;
    srcDir: string;
    dependencies: string[];
  };
}

export const packageJson = () => async (
  ctx: Context & PackageJsonContext,
  next: NextFunction
) => {
  const packageJsonFilepath = path.resolve(process.cwd(), "package.json");
  const packageJsonExists = await fs.pathExists(packageJsonFilepath);

  if (packageJsonExists) {
    const json = await fs.readJSON(packageJsonFilepath);
    const dependencies = Object.keys(json.dependencies ?? {});

    ctx.package = {
      dir: process.cwd(),
      srcDir: path.resolve(process.cwd(), "src"),
      dependencies,
    };

    return next();
  }

  ctx.throw(
    1,
    "Could not locate package.json. Please run ts-engine in the same directory as your package.json file."
  );
};
