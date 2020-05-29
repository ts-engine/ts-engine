import path from "path";
import fs from "fs-extra";

interface ConfigFactoryOptions {
  react: boolean;
}

export class ConfigFactory {
  options: ConfigFactoryOptions;

  constructor(options: ConfigFactoryOptions) {
    this.options = options;
  }

  createBabelConfig = () => {
    const babelConfigFilename = path.resolve(process.cwd(), "babel.config.js");
    const babelConfigExists = fs.existsSync(babelConfigFilename);

    if (babelConfigExists) {
      return {
        configFile: babelConfigFilename,
      };
    }

    const config = {
      configFile: false,
      presets: ["@ts-engine/babel-preset"],
    };

    if (this.options.react) {
      config.presets = ["@ts-engine/babel-preset-react", ...config.presets];
    }

    return config;
  };

  createJestConfig = () => {
    const jestConfigFilename = path.resolve(process.cwd(), "jest.config.js");
    const jestConfigExists = fs.existsSync(jestConfigFilename);

    const jestConfig = jestConfigExists ? require(jestConfigFilename) : {};

    return {
      testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
      testURL: "http://localhost",
      transform: {
        ".(js|jsx|ts|tsx)$": ["babel-jest", this.createBabelConfig()],
      },
      ...jestConfig,
    };
  };
}
