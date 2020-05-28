import path from "path";
import fs from "fs-extra";
import { getConsumerPackage } from "./utils/package";

interface GetBabelConfigOptions {
  react: boolean;
}

export const getBabelConfig = (options: GetBabelConfigOptions) => {
  // Check if consumer is providing one
  const consumerPackage = getConsumerPackage();
  const consumerBabelConfigFilename = path.join(
    consumerPackage.dir,
    "babel.config.js"
  );

  if (fs.existsSync(consumerBabelConfigFilename)) {
    return require(consumerBabelConfigFilename);
  }

  // Otherwise build one internally
  const config = { presets: ["@ts-engine/babel-preset"] };

  if (options.react) {
    config.presets.push("@ts-engine/babel-preset-react");
  }

  return config;
};
