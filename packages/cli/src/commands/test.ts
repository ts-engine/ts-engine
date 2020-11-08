import { CommandBuilder } from "yargs";
import fs from "fs-extra";
import path from "path";
import { getSupportedExtensions } from "../utils";

const command = "test";

const description = "Test code using Jest.";

const builder: CommandBuilder = (yargs) => {
  return yargs;
};

const handler = async () => {
  process.env.BABEL_ENV = "test";
  process.env.NODE_ENV = "test";

  const [, , , ...jestArgs] = process.argv;
  const extensions = getSupportedExtensions({ dots: false }).join("|");

  // read jest config file if it exists
  const jestConfigFilename = path.resolve(process.cwd(), "jest.config.js");
  const jestConfigExists = fs.existsSync(jestConfigFilename);
  let jestConfig = {};

  if (jestConfigExists) {
    try {
      jestConfig = require(jestConfigFilename);
    } catch (error) {
      console.error("Failed to load jest.config.js ->", error.message);
      return process.exit(1);
    }
  }

  // if a jest setup file, of TypeScript or JavaScript extension, exists then load it
  const jestJsSetupFilename = path.resolve(process.cwd(), "jest.setup.js");
  const jestTsSetupFilename = path.resolve(process.cwd(), "jest.setup.ts");
  const jestJsSetupExists = fs.existsSync(jestJsSetupFilename);
  const jestTsSetupExists = fs.existsSync(jestTsSetupFilename);
  const jestSetupConfig =
    jestJsSetupExists || jestTsSetupExists
      ? {
          setupFilesAfterEnv: [
            // favour the typescript file if both exist
            `./jest.setup.${jestTsSetupExists ? "t" : "j"}s`,
          ],
        }
      : {};

  /* eslint-disable jest/no-jest-import */
  await require("jest").run([
    ...jestArgs,
    "--config",
    JSON.stringify({
      testRegex: `(/__tests__/.*|(.|/)(test|spec)).(${extensions})?$`,
      testURL: "http://localhost",
      transform: JSON.parse(`{
        ".(${extensions})$": "@ts-engine/jest-transform"
      }`),
      ...jestConfig,
      ...jestSetupConfig,
    }),
  ]);
};

export const test = {
  command,
  description,
  builder,
  handler,
};
