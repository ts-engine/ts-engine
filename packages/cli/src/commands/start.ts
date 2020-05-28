import type { Command } from "../types";
import { printError } from "../utils/print";
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
      "Provide arguments to be forwarded onto the Node.js application",
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

export interface StartCommandOptions {
  watch: boolean;
  "bundle-dependencies": boolean;
  minify: boolean;
  "config-react": boolean;
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

    try {
      // Run the build
      const config = createRollupConfig({
        outputType: "node-app",
        bundleDependencies: parsedOptions["bundle-dependencies"],
        minify: parsedOptions.minify,
        react: parsedOptions["config-react"],
      });

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
