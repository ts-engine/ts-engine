import type { ChildProcess } from "child_process";
import { spawn, spawnSync } from "child_process";
import chalk from "chalk";
import ora from "ora";
import rollup from "rollup";
import type { RollupConfig } from "./config";
import { logProgress } from "./log-progress";
import { typecheck } from "./typecheck";
import { getPackage } from "./get-package";

interface BuildWithRollupOptions {
  emit: boolean;
  run: boolean;
  runArgs?: string[];
  typecheck: boolean;
  watch: boolean;
}

export const buildWithRollup = async (
  rollupConfig: RollupConfig,
  options: BuildWithRollupOptions
) => {
  let postBuildRunner: ChildProcess | null = null;
  const killPostBuildRunner = () => {
    if (postBuildRunner) {
      postBuildRunner.kill("SIGTERM");
      postBuildRunner = null;
    }
  };

  if (options.watch) {
    const watcher = rollup.watch(rollupConfig as any);

    return new Promise(() => {
      const spinner = ora();
      watcher.on("event", async (event) => {
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

            if (options.typecheck) {
              await typecheck({
                emit: options.emit,
                package: getPackage(),
              });
            }

            console.log(chalk.grey("Watching for changes..."));

            if (options.run) {
              console.log(
                chalk.blueBright(
                  postBuildRunner ? "Restarting app..." : "Starting app..."
                )
              );
              killPostBuildRunner();

              postBuildRunner = spawn(
                "node",
                [rollupConfig.output[0].file, ...(options.runArgs ?? [])],
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

    if (options.typecheck) {
      const result = await typecheck({
        emit: options.emit,
        package: getPackage(),
      });

      if (!result) {
        process.exit(1);
      }
    }

    if (options.run) {
      console.log(chalk.blueBright("Starting app..."));
      spawnSync(
        "node",
        [rollupConfig.output[0].file, ...(options.runArgs ?? [])],
        {
          encoding: "utf8",
          stdio: "inherit",
        }
      );
    }
  }
};
