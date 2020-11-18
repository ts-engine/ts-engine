import chalk from "chalk";
import randomColor from "randomcolor";

export const formatRandomColor = (str: string) =>
  chalk.hex(randomColor({ luminosity: "bright" }))(str);

export const logger = {
  error: (message: string) => console.error(chalk.redBright(message)),
  success: (message: string) => console.info(chalk.greenBright(message)),
  warn: (message: string) => console.warn(chalk.yellowBright(message)),
  subtext: (message: string) => console.log(chalk.grey(message)),
  random: (message: string) => console.log(formatRandomColor(message)),
};
