import chalk from "chalk";
import type { Command } from "../types";
import { print, printError } from "../utils/print";
import { createBooleanOption, argsToOptions } from "../utils/options";
import { createRollupConfig } from "../createRollupConfig";
import { buildWithRollup } from "../buildWithRollup";

const options = [
  createBooleanOption({
    name: "watch",
    description: "Build and run the app on changes",
    isRequired: false,
    defaultValue: false,
  }),
  createBooleanOption({
    name: "bundle-dependencies",
    description: "Compile dependencies into final output file",
    isRequired: false,
    defaultValue: false,
  }),
  createBooleanOption({
    name: "args",
    description:
      "Splits ts-engine's args from args to be forwarded onto the Node.js application",
    isRequired: false,
    defaultValue: false,
  }),
];

export interface StartCommandOptions {
  watch: boolean;
  "bundle-dependencies": boolean;
}

export const start: Command<StartCommandOptions> = {
  name: "start",
  description: "Build package as a Node.js application and run it",
  options,
  run: async (args: string[]) => {
    // Ensure envs are set
    process.env.TS_ENGINE_COMMAND = "start";

    const parsedOptions = argsToOptions<StartCommandOptions>(args, options);

    const argsToForward = args.slice(args.findIndex((a) => a === "--args") + 1);

    // Announce tool
    print(`Building code with ${chalk.blueBright("Rollup")}`);
    print();

    try {
      // Run the build
      const config = createRollupConfig(
        "node-app",
        parsedOptions["bundle-dependencies"]
      );

      await buildWithRollup(config, {
        watch: parsedOptions.watch,
        runPostBuild: true,
        runArgs: argsToForward,
      });
    } catch (error) {
      printError(error);
      printError();
      return Promise.reject();
    }
  },
};
