import chalk from "chalk";
import ora from "ora";
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
  if (options.watch) {
    const watcher = rollup.watch(rollupConfig as any);

    return new Promise(() => {
      const spinner = ora();
      watcher.on("event", (event) => {
        switch (event.code) {
          case "START": {
            console.clear();
            spinner.start(chalk.greenBright("Building bundle"));

            break;
          }
          case "END": {
            spinner.stop();
            for (let output of rollupConfig.output) {
              console.log(chalk.greenBright(`Written to ${output.file}`));
            }

            console.log(chalk.grey("Watching for changes..."));

            // if (options.runPostBuild) {
            //   print(
            //     chalk.blueBright(
            //       postBuildRunner ? "Restarting app..." : "Starting app..."
            //     )
            //   );
            //   killPostBuildRunner();

            //   postBuildRunner = spawn(
            //     "node",
            //     [config.output[0].file, ...(options.runArgs ?? [])],
            //     {
            //       stdio: "inherit",
            //     }
            //   );

            //   postBuildRunner.stdout?.setEncoding("utf8");
            //   postBuildRunner.stderr?.setEncoding("utf8");
            // }

            break;
          }
          case "ERROR": {
            spinner.stop();
            console.error(chalk.redBright(event.error));
            console.log(chalk.grey("Watching for changes..."));

            break;
          }
          default: {
            break;
          }
        }
      });
    });
  } else {
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
  }
};
