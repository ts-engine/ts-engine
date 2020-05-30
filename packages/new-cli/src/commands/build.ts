import { createRollupConfig } from "../config";
import { buildWithRollup } from "../build-with-rollup";

interface BuildOptions {
  buildType: "library" | "node-app";
  bundleDependencies: boolean;
  minify: boolean;
  react: boolean;
  watch: boolean;
}

export const build = async (options: BuildOptions) => {
  const rollupConfig = createRollupConfig({
    buildType: options.buildType,
    bundleDependencies: options.bundleDependencies,
    minify: options.minify,
    react: options.react,
  });

  await buildWithRollup(rollupConfig, {
    watch: options.watch,
  });
};
