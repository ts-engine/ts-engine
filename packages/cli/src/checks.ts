import chalk from "chalk";
import fs from "fs-extra";
import validatePackageName from "validate-npm-package-name";
import { getPackage } from "./get-package";

export const checkBuildTypeOptions = (argv) => {
  if (argv.library && argv.nodeApp) {
    throw new Error("Arguments library and node-app are mutually exclusive");
  }
  if (!argv.library && !argv.nodeApp) {
    throw new Error("Missing one of required arguments: library, node-app");
  }
  return true;
};

export const checkNpmPackageName = (argv) => {
  const result = validatePackageName(argv.name);

  if (!result.validForNewPackages) {
    throw new Error(`'${argv.name}' is not a valid npm package name`);
  }

  return true;
};

export const checkLibraryNpmPackageJson = (argv) => {
  if (!argv.library) {
    return true;
  }

  const pkg = getPackage();

  if (pkg.json.main !== "dist/main.cjs.js") {
    throw new Error(
      "Incorrectly configured package.json, set 'main' to 'dist/main.cjs.js'"
    );
  }

  if (pkg.json.module !== "dist/main.esm.js") {
    throw new Error(
      "Incorrectly configured package.json, set 'module' to 'dist/main.esm.js'"
    );
  }

  if (pkg.json.types !== "dist/main.d.ts") {
    throw new Error(
      "Incorrectly configured package.json, set 'types' to 'dist/main.d.ts'"
    );
  }

  return true;
};

export const checkNewPackageFolderIsAvailable = (argv) => {
  const newPackageDir = argv.name.startsWith("@")
    ? argv.name.split("/")[1]
    : argv.name;

  if (fs.pathExistsSync(newPackageDir)) {
    throw new Error(`Folder '${newPackageDir}' already exists`);
  }

  return true;
};
