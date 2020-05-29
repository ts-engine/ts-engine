interface BuildOptions {
  buildType: "library" | "node-app";
  bundleDependencies: boolean;
  minify: boolean;
  react: boolean;
  watch: boolean;
}

export const build = (options: BuildOptions) => {
  // TODO - add package json checks if its a library
  // try {
  //   // Run the build
  //   const config = createRollupConfig({
  //     outputType,
  //     bundleDependencies: parsedOptions["bundle-dependencies"],
  //     minify: parsedOptions.minify,
  //     react: parsedOptions["config-react"],
  //   });
  //   await buildWithRollup(config, {
  //     watch: parsedOptions.watch,
  //   });
  // } catch (error) {
  //   printError(chalk.redBright(error));
  //   return Promise.reject();
  // }
};
