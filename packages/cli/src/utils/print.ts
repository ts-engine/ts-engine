import path from "path";
import chalk from "chalk";
import createLogger from "progress-estimator";

const logEstimate = createLogger({
  storagePath: path.join(__dirname, ".progress-estimator"),
});

export const print = (message: string = "") => {
  console.log(message);
};

export const printError = (message: any = "") => {
  console.error(message);
};

export const printProgress = <TPromiseResult>(
  promise: Promise<TPromiseResult>,
  message: string
): Promise<TPromiseResult> => {
  return logEstimate(promise, chalk.greenBright(message));
};

export const printSuccess = (message: string) => {
  print(chalk.greenBright(message));
};
