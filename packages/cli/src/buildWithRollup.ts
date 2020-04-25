import { spawn, spawnSync, ChildProcess } from "child_process";
import * as rollup from "rollup";
import chalk from "chalk";
import ora from "ora";
import type { RollupConfig } from "./types";
import { print, printError, printProgress } from "./utils/print";

export interface BuildWithRollupOptions {
  watch?: boolean;
  runPostBuild?: boolean;
  runArgs?: string[];
}

export const buildWithRollup = async (
  config: RollupConfig,
  options: BuildWithRollupOptions
): Promise<void> => {
  let postBuildRunner: ChildProcess | null = null;
  const killPostBuildRunner = () => {
    if (postBuildRunner) {
      postBuildRunner.kill("SIGTERM");
      postBuildRunner = null;
    }
  };

  if (options.watch) {
    // Setup watcher
    const watcher = rollup.watch({ ...(config as any) });

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
            for (let output of config.output) {
              print(chalk.greenBright(`Written to ${output.file}`));
            }

            print(chalk.grey("Watching for changes..."));

            if (options.runPostBuild) {
              print(
                chalk.blueBright(
                  postBuildRunner ? "Restarting app..." : "Starting app..."
                )
              );
              killPostBuildRunner();

              postBuildRunner = spawn(
                "node",
                [config.output[0].file, ...(options.runArgs ?? [])],
                {
                  stdio: "inherit",
                }
              );

              postBuildRunner.stdout?.setEncoding("utf8");
              postBuildRunner.stderr?.setEncoding("utf8");
            }

            break;
          }
          case "ERROR": {
            spinner.stop();
            printError(chalk.redBright(event.error));
            print(chalk.grey("Watching for changes..."));

            break;
          }
          default: {
            break;
          }
        }
      });
    });
  } else {
    // Perform single build and write it out
    const bundle = await printProgress(
      rollup.rollup(config as any),
      chalk.greenBright("Building bundle")
    );

    for (let output of config.output) {
      await printProgress(
        bundle.write(output as any),
        chalk.greenBright(`Writing to ${output.file}`)
      );
    }

    if (options.runPostBuild) {
      print(chalk.blueBright("Starting app..."));
      spawnSync("node", [config.output[0].file, ...(options.runArgs ?? [])], {
        encoding: "utf8",
        stdio: "inherit",
      });
    }
  }
};
