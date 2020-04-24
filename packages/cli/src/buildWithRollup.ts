import { spawn, spawnSync, ChildProcess } from "child_process";
import * as rollup from "rollup";
import chalk from "chalk";
import type { RollupConfig } from "./types";
import { print, printError } from "./utils/print";

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
      console.log("killing");
      postBuildRunner.kill("SIGTERM");
      postBuildRunner = null;
    }
  };

  if (options.watch) {
    // Setup watcher
    const watcher = rollup.watch({ ...(config as any) });

    return new Promise(() => {
      watcher.on("event", (event) => {
        switch (event.code) {
          case "START": {
            for (let output of config.output) {
              print(
                `${chalk.greenBright(config.input)} ${chalk.blueBright(
                  "⮕"
                )}  ${chalk.greenBright(output.file)}`
              );
            }

            break;
          }
          case "BUNDLE_END":
          case "BUNDLE_START": {
            // kill the app if it is still being run
            killPostBuildRunner();
            break;
          }
          case "END": {
            print(chalk.grey("Watching for changes..."));

            if (options.runPostBuild) {
              postBuildRunner = spawn(
                "node",
                ["dist/main.js", ...(options.runArgs ?? [])],
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
            printError(event.error);
            printError();

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
    const bundle = await rollup.rollup(config as any);
    for (let output of config.output) {
      await bundle.write(output as any);
      print(
        `${chalk.greenBright(config.input)} ${chalk.blueBright(
          "⮕"
        )}  ${chalk.greenBright(output.file)}`
      );
    }
    print();

    if (options.runPostBuild) {
      spawnSync("node", ["dist/main.js", ...(options.runArgs ?? [])], {
        encoding: "utf8",
        stdio: "inherit",
      });
    }
  }
};
