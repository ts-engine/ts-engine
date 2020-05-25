import path from "path";
import glob from "glob-promise";
import chalk from "chalk";
import { getTsEngineConfig } from "../getTsEngineConfig";

const tsEngineConfig = getTsEngineConfig();
const extensions = tsEngineConfig.extensions.join(",");
const srcGlob = `${tsEngineConfig.srcDir}/**/*.{${extensions}}`;

export interface PackageJson {
  name: string;
  description: string;
  repository: {
    url: string;
  };
  version: string;
  dependencies?: {
    [key: string]: string;
  };
  peerDependencies?: {
    [key: string]: string;
  };
  main?: string;
  module?: string;
  types?: string;
}

export interface Package {
  dir: string;
  json: PackageJson;
  srcFilepaths: string[];
}

export const getToolPackage = (): Package => {
  const dir = path.resolve(__dirname, "../..");

  return {
    dir,
    json: require(path.resolve(dir, "package.json")) as PackageJson,
    srcFilepaths: glob.sync(srcGlob, {
      root: path.resolve(dir),
    }),
  };
};

export const getConsumerPackage = (): Package => {
  const dir = process.cwd();

  return {
    dir,
    json: require(path.resolve(dir, "package.json")) as PackageJson,
    srcFilepaths: glob.sync(srcGlob, {
      root: path.resolve(dir),
    }),
  };
};

export interface LibraryPackageJsonReport {
  messages: string[];
}

export const getLibraryPackageJsonReport = (
  pkg: PackageJson
): LibraryPackageJsonReport => {
  const messages: string[] = [];

  const mainProperty = chalk.yellowBright("main");
  const mainValue = chalk.greenBright("dist/main.cjs.js");
  if (pkg.main === undefined) {
    messages.push(
      `Missing property ${mainProperty} should be set to ${mainValue}`
    );
  } else if (pkg.main !== "dist/main.cjs.js") {
    messages.push(
      `Incorrect property ${mainProperty} should be set to ${mainValue}`
    );
  }

  const moduleProperty = chalk.yellowBright("module");
  const moduleValue = chalk.greenBright("dist/main.esm.js");
  if (pkg.module === undefined) {
    messages.push(
      `Missing property ${moduleProperty} should be set to ${moduleValue}`
    );
  } else if (pkg.module !== "dist/main.esm.js") {
    messages.push(
      `Incorrect property ${moduleProperty} should be set to ${moduleValue}`
    );
  }

  const typesProperty = chalk.yellowBright("types");
  const typesValue = chalk.greenBright("dist/main.d.ts");
  if (pkg.types === undefined) {
    messages.push(
      `Missing property ${typesProperty} should be set to ${typesValue}`
    );
  } else if (pkg.types !== "dist/main.d.ts") {
    messages.push(
      `Incorrect property ${typesProperty} should be set to ${typesValue}`
    );
  }

  return {
    messages,
  };
};
