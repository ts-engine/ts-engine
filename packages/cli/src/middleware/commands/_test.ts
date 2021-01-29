import path from "path";
import fs from "fs-extra";
import { Context, NextFunction } from "@leecheneler/cli";
import { run } from "../../jest";
import { SUPPORTED_EXTENSIONS_REGEX } from "../../constants";

export const BASE_JEST_CONFIG = {
  testRegex: `(/__tests__/.*|(.|/)(test|spec)).(${SUPPORTED_EXTENSIONS_REGEX})?$`,
  testURL: "http://localhost",
  transform: JSON.parse(`{
        ".(js|jsx|ts|tsx|mjs|cjs|es)$": [
          "babel-jest", 
          { 
            "configFile": false, 
            "presets": ["@ts-engine/babel-preset"]
          }
        ]
      }`),
};

export const _test = () => async (ctx: Context, next: NextFunction) => {
  // set environments to test
  process.env.BABEL_ENV = "test";
  process.env.NODE_ENV = "test";

  // read jest config file if it exists
  const jestConfigFilename = path.resolve(process.cwd(), "jest.config.js");
  const jestConfigExists = fs.existsSync(jestConfigFilename);
  let jestConfig = {};

  if (jestConfigExists) {
    try {
      jestConfig = require(jestConfigFilename);
    } catch (error) {
      ctx.throw(1, `Failed to load jest.config.js: ${error.message}`);
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
            // prefer the typescript file if both exist
            `./jest.setup.${jestTsSetupExists ? "t" : "j"}s`,
          ],
        }
      : {};

  let transformConfig = {};
  const babelrcFilename = path.resolve(process.cwd(), ".babelrc");
  const babelrcJsFilename = path.resolve(process.cwd(), ".babelrc.js");
  const babelConfigJsFilename = path.resolve(process.cwd(), "babel.config.js");
  const babelrcExists = fs.existsSync(babelrcFilename);
  const babelrcJsExists = fs.existsSync(babelrcJsFilename);
  const babelConfigJsExists = fs.existsSync(babelConfigJsFilename);

  if (babelrcExists || babelrcJsExists || babelConfigJsExists) {
    transformConfig = {
      transform: JSON.parse(`{
        ".(js|jsx|ts|tsx|mjs|cjs|es)$": [
          "babel-jest", 
          { 
            "configFile": "${
              babelConfigJsFilename ?? babelrcJsFilename ?? babelrcFilename
            }"
          }
        ]
      }`),
    };
  }

  const config = JSON.stringify({
    ...BASE_JEST_CONFIG,
    ...jestSetupConfig,
    ...transformConfig,
    ...jestConfig,
  });

  /* eslint-disable jest/no-jest-import */
  try {
    await run([...ctx.rawOptions, "--config", config]);
  } catch (e) {
    ctx.throw(1, "");
  }

  await next();
};
