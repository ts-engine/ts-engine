import fs from "fs-extra";
import validatePackageName from "validate-npm-package-name";
import { getPackage } from "./get-package";

export const checkBuildTypeOptions = (argv: any) => {
  if (argv.library && argv.nodeApp) {
    throw new Error("Arguments library and node-app are mutually exclusive");
  }

  if (!argv.library && !argv.nodeApp) {
    throw new Error("Missing one of required arguments: library, node-app");
  }

  return true;
};

export const checkNpmPackageName = (argv: any) => {
  const result = validatePackageName(argv.name);

  if (!result.validForNewPackages) {
    throw new Error(`'${argv.name}' is not a valid npm package name:

${result.errors.map((e: string) => `- ${e}\n`)}`);
  }

  return true;
};

export const checkLibraryNpmPackageJson = (argv: any) => {
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

export const checkNewPackageFolderIsAvailable = (argv: any) => {
  const newPackageDir = argv.name.startsWith("@")
    ? argv.name.split("/")[1]
    : argv.name;

  if (fs.pathExistsSync(newPackageDir)) {
    throw new Error(`Folder '${newPackageDir}' already exists`);
  }

  return true;
};
