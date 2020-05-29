import path from "path";
import fs from "fs-extra";
import glob from "glob-promise";
import { srcFileGlob } from "./constants";

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

export const getPackage = (): Package => {
  const dir = process.cwd();

  return {
    dir,
    json: fs.readJSONSync(path.resolve(dir, "package.json")) as PackageJson,
    srcFilepaths: glob.sync(srcFileGlob, {
      root: dir,
    }),
  };
};
