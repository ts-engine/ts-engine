import { createRollupConfig } from "../config";
import { buildWithRollup } from "../build-with-rollup";

interface StartOptions {
  args: string[];
  bundleDependencies: boolean;
  emit: boolean;
  minify: boolean;
  react: boolean;
  typecheck: boolean;
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
    emit: options.emit,
    watch: options.watch,
    run: true,
    runArgs: options.args,
    typecheck: options.typecheck,
  });
};
