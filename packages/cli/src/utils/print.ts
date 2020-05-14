import path from "path";
import chalk from "chalk";
import createLogger from "progress-estimator";

export const print = (message: string = "") => {
  console.log(message);
};

export const printError = (message: any = "") => {
  console.error(message);
};

export const printProgress = <TPromiseResult>(
  promise: Promise<TPromiseResult>,
  message: string,
  cacheName: string
): Promise<TPromiseResult> => {
  if (process.env.CI === "true") {
    // If in CI then don't use the progress-estimator as it muddies the logs
    console.log(chalk.greenBright(message));
    return promise;
  }

  const logEstimate = createLogger({
    storagePath: path.join(__dirname, `.progress-estimator-${cacheName}`),
  });
  return logEstimate(promise, chalk.greenBright(message));
};

export const printSuccess = (message: string) => {
  print(chalk.greenBright(message));
};
