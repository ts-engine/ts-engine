import type { Command } from "../types";
import { getJestConfigFilename } from "../getJestConfigFilename";

const createConfig = () => {
  const userJestConfigFilename = getJestConfigFilename();

  const userJestConfig = userJestConfigFilename
    ? require(userJestConfigFilename)
    : {};

  return {
    testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
    testURL: "http://localhost",
    transform: {
      ".(js|jsx|ts|tsx)$": require.resolve("../tool-files/jestPreprocessor"),
    },
    ...userJestConfig,
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
    // Need to set this so that the jest preprocessor can insert react config if required
    // process.env.TS_ENGINE_CONFIG_REACT = parsedOptions[
    //   "config-react"
    // ].toString();
    // console.log(
    //   "process.env.TS_ENGINE_CONFIG_REACT",
    //   process.env.TS_ENGINE_CONFIG_REACT
    // );

    return require("jest").run([
      ...args,
      "--config",
      JSON.stringify(createConfig()),
    ]);
  },
};
