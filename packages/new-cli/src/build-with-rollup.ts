import rollup from "rollup";
import type { RollupConfig } from "./config";
import { logProgress } from "./logger";

interface BuildWithRollupOptions {
  watch: boolean;
}

export const buildWithRollup = async (
  rollupConfig: RollupConfig,
  options: BuildWithRollupOptions
) => {
  const bundle = await logProgress(
    rollup.rollup(rollupConfig as any),
    "Building bundle",
    "build"
  );

  for (let output of rollupConfig.output) {
    await logProgress(
      bundle.write(output as any),
      `Writing to ${output.file}`,
      "build-write"
    );
  }
};
