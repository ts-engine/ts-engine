import { createRollupConfig } from "../config";
import { buildWithRollup } from "../build-with-rollup";

interface StartOptions {
  args: string[];
  bundleDependencies: boolean;
  minify: boolean;
  react: boolean;
  watch: boolean;
}

export const start = async (options: StartOptions) => {
  const rollupConfig = createRollupConfig({
    buildType: "node-app",
    bundleDependencies: options.bundleDependencies,
    minify: options.minify,
    react: options.react,
  });

  await buildWithRollup(rollupConfig, {
    watch: options.watch,
    run: true,
    runArgs: options.args,
  });
};
