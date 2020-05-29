interface ConfigFactoryOptions {
  react: boolean;
}

export class ConfigFactory {
  options: ConfigFactoryOptions;

  constructor(options: ConfigFactoryOptions) {
    this.options = options;
  }

  createBabelConfig = () => {
    const config = {
      // TODO - if there is a babel config file in the user's
      // package directory then need to update this
      // https://babeljs.io/docs/en/options#configfile
      configFile: false,
      presets: ["@ts-engine/babel-preset"],
    };

    if (this.options.react) {
      config.presets = ["@ts-engine/babel-preset-react", ...config.presets];
    }

    return config;
  };

  createJestConfig = () => {
    return {
      testRegex: "src/.*.test.(js|jsx|ts|tsx)$",
      testURL: "http://localhost",
      transform: {
        ".(js|jsx|ts|tsx)$": ["babel-jest", this.createBabelConfig()],
      },
    };
  };
}
