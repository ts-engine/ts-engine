import os from "os";
import path from "path";
import chalk from "chalk";
import createLogger from "progress-estimator";

export const logProgress = <TPromiseResult>(
  promise: Promise<TPromiseResult>,
  message: string,
  action: string
): Promise<TPromiseResult> => {
  if (process.env.CI === "true") {
    // If in CI then don't use the progress-estimator as it muddies the logs
    console.log(chalk.greenBright(message));
    return promise;
  }

  // @ts-ignore - the official type def is wrong :face_palm:
  const logEstimate = createLogger({
    storagePath: path.join(os.tmpdir(), `.progress-estimator`),
  });

  // @ts-ignore - the official type def is wrong :face_palm:
  return logEstimate(promise, chalk.greenBright(message), { id: action });
};
