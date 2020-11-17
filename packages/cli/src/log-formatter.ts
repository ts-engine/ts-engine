import chalk from "chalk";

interface Formatter {
  error: (str: string) => string;
  success: (str: string) => string;
  warn: (str: string) => string;
}

export const formatter: Formatter = {
  error: chalk.redBright,
  success: chalk.greenBright,
  warn: chalk.yellowBright,
};
