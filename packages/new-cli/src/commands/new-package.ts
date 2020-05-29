interface NewPackageOptions {
  buildType: "library" | "node-app";
  name: string;
}

export const newPackage = (options: NewPackageOptions) => {
  console.log(options);
};
