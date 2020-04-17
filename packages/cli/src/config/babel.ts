import path from "path";
import fs from "fs-extra";
import { getConsumerPackage } from "../utils/package";

export const getBabelConfigFilename = () => {
  // Check if consumer is providing one
  const consumerPackage = getConsumerPackage();
  const consumerBabelConfigFilename = path.join(
    consumerPackage.dir,
    "babel.config.js"
  );

  if (fs.existsSync(consumerBabelConfigFilename)) {
    return consumerBabelConfigFilename;
  }

  // Otherwise use the default one
  return require.resolve("../tool-files/babel.config.js");
};
