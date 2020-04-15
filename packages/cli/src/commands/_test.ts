import chalk from "chalk";
import type { Command } from "../types";
import { print } from "../utils/print";

const createConfig = () => {
  return {
    testRegex: "/__tests__/.*.test.(js|jsx|ts|tsx)$",
    testURL: "http://localhost",
    transform: {
      ".(js|jsx|ts|tsx)$": require.resolve("../tool-files/jestPreprocessor"),
    },
  };
};

const options = [
  {
    name: "<jest_options>",
    description: `Accepts all ${chalk.blueBright(
      "Jest"
    )} options except --config`,
  },
];

export interface TestCommandOptions {}

export const test: Command<TestCommandOptions> = {
  name: "test",
  description: `Run tests using ${chalk.blueBright("Jest")}`,
  options,
  run: async (args: string[]) => {
    // Announce tool
    print(`Running tests with ${chalk.blueBright("Jest")}`);
    print();

    // Ensure envs are set
    process.env.BABEL_ENV = "test";
    process.env.NODE_ENV = "test";

    return require("jest").run([
      ...args,
      "--config",
      JSON.stringify(createConfig()),
    ]);
  },
};
