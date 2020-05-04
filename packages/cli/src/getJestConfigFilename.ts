import path from "path";
import fs from "fs-extra";
import { getConsumerPackage } from "./utils/package";

export const getJestConfigFilename = () => {
  // Check if consumer is providing one
  const consumerPackage = getConsumerPackage();
  const consumerJestConfigFilename = path.join(
    consumerPackage.dir,
    "jest.config.js"
  );

  if (fs.existsSync(consumerJestConfigFilename)) {
    return consumerJestConfigFilename;
  }

  // Otherwise use the default one
  return null;
};
