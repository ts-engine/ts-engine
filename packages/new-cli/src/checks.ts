import validatePackageName from "validate-npm-package-name";

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
    throw new Error(`${argv.name} is not a valid npm package name`);
  }

  return true;
};

// TODO - add package json checks if its a library
