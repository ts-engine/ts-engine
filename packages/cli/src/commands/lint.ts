import path from "path";
import fs from "fs-extra";
import eslint from "eslint";
import chalk from "chalk";
import type { Command } from "../types";
import { printError, printProgress, printSuccess } from "../utils/print";
import { createBooleanOption, argsToOptions } from "../utils/options";
import { getConsumerPackage } from "../utils/package";
import eslintConfig from "@ts-engine/eslint-config";

const options = [
  createBooleanOption({
    name: "fix",
    description: "Auto fix fixable linting issues",
    isRequired: false,
    defaultValue: false,
  }),
];

export interface LintCommandOptions {
  fix: boolean;
}

export const lint: Command<LintCommandOptions> = {
  name: "lint",
  description: "Lint with ESLint",
  options,
  run: async (args: string[]) => {
    // Ensure envs are set
    process.env.TS_ENGINE_COMMAND = "lint";

    const parsedOptions = argsToOptions<LintCommandOptions>(args, options);

    // Setup linting engine
    const consumerPackage = getConsumerPackage();

    const cli = new eslint.CLIEngine({
      fix: parsedOptions.fix,
      baseConfig: eslintConfig,
      cwd: consumerPackage.dir,
    });

    const generateReport = () => {
      return new Promise<eslint.CLIEngine.LintReport>((resolve) => {
        // Defer the start of execution as it blocks output
        // being written to the console and we want
        // progress-estimator to do an initial print
        setTimeout(() => {
          resolve(cli.executeOnFiles(consumerPackage.srcFilepaths));
        }, 1000);
      });
    };

    const report = await printProgress(
      generateReport(),
      "Linting source code",
      "lint"
    );

    if (parsedOptions.fix) {
      const writeFiles = async () => {
        const files = report.results.filter((r) => r.output);

        for (const file of files) {
          await fs.writeFile(file.filePath, file.output, {
            encoding: "utf8",
          });
        }
      };

      // Immediately write fixes to file
      await printProgress(writeFiles(), "Patching files", "lint-patch");
    }

    if (report.errorCount === 0 && report.warningCount === 0) {
      // Early escape if there are no issues found
      printSuccess("✓ No issues found");

      return Promise.resolve();
    }

    // Print summary of issues eg:
    // Found 9 errors (4 fixable) and 4 warnings (2 fixable)
    const errors = `${report.errorCount} errors`;
    const warnings = `${report.warningCount} warnings`;
    const fixableErrors = `(${report.fixableErrorCount} fixable)`;
    const fixableWarnings = `(${report.fixableWarningCount} fixable)`;

    printError();
    printError(
      (report.errorCount > 0 ? chalk.redBright : chalk.yellowBright)(
        `Found ${errors} ${fixableErrors} and ${warnings} ${fixableWarnings}`
      )
    );

    // Print out file summaries
    const files = report.results.filter(
      (r) => r.errorCount + r.warningCount > 0
    );

    for (let file of files) {
      printError();

      printError(
        chalk.greenBright(path.relative(consumerPackage.dir, file.filePath))
      );

      for (let message of file.messages) {
        const prefix =
          message.severity === 2
            ? chalk.redBright(`Error (${message.line}:${message.column})`)
            : chalk.yellowBright(`Warning (${message.line}:${message.column})`);

        const fixableAffix = message.fix ? chalk.greenBright("(fixable)") : "";
        const ruleAffix = chalk.magentaBright(`(${message.ruleId})`);

        printError(`${prefix} ${message.message} ${ruleAffix} ${fixableAffix}`);
      }
    }

    // If anything is fixable mention --fix option
    if (report.fixableErrorCount + report.fixableWarningCount > 0) {
      printError();
      printError(
        `Rerun with ${chalk.yellowBright("--fix")} option to fix fixable issues`
      );
    }

    // Don't fail if we only have warnings
    return report.errorCount > 0 ? Promise.reject() : Promise.resolve();
  },
};
