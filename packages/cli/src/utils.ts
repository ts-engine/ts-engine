import packageJsonFinder from "find-package-json";

export const getSupportedExtensions = (options: { dots: boolean }) => {
  return ["js", "ts", "jsx", "tsx", "mjs", "cjs", ".es"].map((e) =>
    options.dots ? `.${e}` : e
  );
};

export const findPackageJson = (): packageJsonFinder.Package | undefined => {
  return packageJsonFinder().next().value;
};

export const extractFilename = (filepath: string) => {
  return filepath.substr(Math.max(0, filepath.lastIndexOf("/")));
};

export const trimExtension = (filename: string) => {
  return filename.split(".").slice(0, -1).join(".");
};
