interface BuildOptions {
  buildType: "library" | "node-app";
  bundleDependencies: boolean;
  minify: boolean;
  react: boolean;
  watch: boolean;
}

export const build = (options: BuildOptions) => {
  console.log(options);
};
