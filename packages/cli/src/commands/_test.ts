import chalk from "chalk";
import type { Command } from "../types";
import { print } from "../utils/print";

const createConfig = () => {
  return {
    testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
    testURL: "http://localhost",
    transform: {
      ".(js|jsx|ts|tsx)$": require.resolve("../tool-files/jestPreprocessor"),
    },
  };
};

const options = [
  {
    name: "<jest_options>",
    description: "Accepts all Jest options except --config",
  },
];

export interface TestCommandOptions {}

export const test: Command<TestCommandOptions> = {
  name: "test",
  description: "Run tests using Jest",
  options,
  run: async (args: string[]) => {
    // Ensure envs are set
    process.env.TS_ENGINE_COMMAND = "test";
    process.env.BABEL_ENV = "test";
    process.env.NODE_ENV = "test";

    return require("jest").run([
      ...args,
      "--config",
      JSON.stringify(createConfig()),
    ]);
  },
};
