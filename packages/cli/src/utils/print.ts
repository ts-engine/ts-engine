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
  // @ts-ignore in GitHub Actions this resolvs to a boolean not a string
  if (process.env.CI === "true" || process.env.CI === true) {
    const logEstimate = createLogger({
      storagePath: path.join(__dirname, `.progress-estimator-${cacheName}`),
    });
    return logEstimate(promise, chalk.greenBright(message));
  }

  console.log(chalk.greenBright(message));
  return promise;
};

export const printSuccess = (message: string) => {
  print(chalk.greenBright(message));
};
