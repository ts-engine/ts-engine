import packageJsonFinder from "find-package-json";

export const getSupportedExtensions = (options: { dots: boolean }) => {
  return ["js", "ts", "jsx", "tsx", "mjs", "cjs", "es6"].map((e) =>
    options.dots ? `.${e}` : e
  );
};

export const findPackageJson = (): packageJsonFinder.Package | undefined => {
  return packageJsonFinder().next().value;
};
