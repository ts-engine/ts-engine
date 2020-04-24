import chalk from "chalk";
import type { Command, OutputType } from "../types";
import { print, printError } from "../utils/print";
import {
  getConsumerPackage,
  getLibraryPackageJsonReport,
} from "../utils/package";
import { createBooleanOption, argsToOptions } from "../utils/options";
import { createRollupConfig } from "../createRollupConfig";
import { buildWithRollup } from "../buildWithRollup";

const options = [
  createBooleanOption({
    name: "watch",
    description: "Watch for changes and build on changes",
    isRequired: false,
    defaultValue: false,
  }),
  createBooleanOption({
    name: "node-app",
    description: "Outputs a Node.js application",
    isRequired: false,
    defaultValue: false,
  }),
  createBooleanOption({
    name: "library",
    description: "Outputs a JavaScript library",
    isRequired: false,
    defaultValue: false,
  }),
  createBooleanOption({
    name: "bundle-dependencies",
    description: "Compile dependencies into final output file",
    isRequired: false,
    defaultValue: false,
  }),
];

export interface BuildCommandOptions {
  watch: boolean;
  "node-app": boolean;
  library: boolean;
  "bundle-dependencies": boolean;
}

export const build: Command<BuildCommandOptions> = {
  name: "build",
  description: `Build code using ${chalk.blueBright("Rollup")}`,
  options,
  run: async (args: string[]) => {
    // Ensure envs are set
    process.env.TS_ENGINE_COMMAND = "build";

    const parsedOptions = argsToOptions<BuildCommandOptions>(args, options);

    // Required to specify whether building an Node.js app or a JavaScript library
    if (!parsedOptions["node-app"] && !parsedOptions.library) {
      const nodeAppOption = chalk.yellowBright("--node-app");
      const libraryOption = chalk.yellowBright("--library");

      printError(`Must specify either ${nodeAppOption} or ${libraryOption}`);
      printError();
      return Promise.reject();
    }

    if (parsedOptions["node-app"] && parsedOptions.library) {
      const nodeAppOption = chalk.yellowBright("--node-app");
      const libraryOption = chalk.yellowBright("--library");

      printError(
        `Cannot specify both ${nodeAppOption} and ${libraryOption}, please provide one`
      );
      printError();
      return Promise.reject();
    }

    // Determine output type
    const outputType: OutputType = parsedOptions["node-app"]
      ? "node-app"
      : "library";

    // Check package.json is valid
    if (outputType === "library") {
      const report = getLibraryPackageJsonReport(getConsumerPackage().json);
      if (report.messages.length > 0) {
        printError(`Found issues with ${chalk.greenBright("package.json")}:`);

        for (let message of report.messages) {
          printError(message);
        }

        printError();
        return Promise.reject();
      }
    }

    // Announce tool
    print(`Building code with ${chalk.blueBright("Rollup")}`);
    print();

    try {
      // Run the build
      const config = createRollupConfig(
        outputType,
        parsedOptions["bundle-dependencies"]
      );

      await buildWithRollup(config, {
        watch: parsedOptions.watch,
      });
    } catch (error) {
      printError(error);
      printError();
      return Promise.reject();
    }
  },
};
