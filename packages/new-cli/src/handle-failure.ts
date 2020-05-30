import type { Argv } from "yargs";
import chalk from "chalk";

export const handleFailure = (
  message: string,
  error: Error | undefined,
  yargs: Argv
) => {
  if (message) {
    console.error(yargs.help());
    console.error();
    console.error(chalk.redBright(message));
  } else if (error) {
    console.error(chalk.redBright(error.stack));
  }

  process.exit(1);
};
