import chalk from "chalk";
import type { Command, OutputType } from "../types";
import { printError } from "../utils/print";
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
  createBooleanOption({
    name: "minify",
    description: "Minify the compiled output",
    isRequired: false,
    defaultValue: false,
  }),
  createBooleanOption({
    name: "config-react",
    description: "Include React babel config",
    isRequired: false,
    defaultValue: false,
  }),
];

export interface BuildCommandOptions {
  watch: boolean;
  "node-app": boolean;
  library: boolean;
  "bundle-dependencies": boolean;
  minify: boolean;
  "config-react": boolean;
}

export const build: Command<BuildCommandOptions> = {
  name: "build",
  description: "Build code using Rollup",
  options,
  run: async (args: string[]) => {
    const parsedOptions = argsToOptions<BuildCommandOptions>(args, options);

    // Ensure envs are set
    process.env.TS_ENGINE_COMMAND = "build";

    // Required to specify whether building an Node.js app or a JavaScript library
    if (!parsedOptions["node-app"] && !parsedOptions.library) {
      const nodeAppOption = chalk.yellowBright("--node-app");
      const libraryOption = chalk.yellowBright("--library");

      printError(`Must specify either ${nodeAppOption} or ${libraryOption}`);
      return Promise.reject();
    }

    if (parsedOptions["node-app"] && parsedOptions.library) {
      const nodeAppOption = chalk.yellowBright("--node-app");
      const libraryOption = chalk.yellowBright("--library");

      printError(
        `Cannot specify both ${nodeAppOption} and ${libraryOption}, please provide one`
      );
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
        printError();

        for (let message of report.messages) {
          printError(message);
        }

        return Promise.reject();
      }
    }

    try {
      // Run the build
      const config = createRollupConfig({
        outputType,
        bundleDependencies: parsedOptions["bundle-dependencies"],
        minify: parsedOptions.minify,
        react: parsedOptions["config-react"],
      });

      await buildWithRollup(config, {
        watch: parsedOptions.watch,
      });
    } catch (error) {
      printError(chalk.redBright(error));
      return Promise.reject();
    }
  },
};
