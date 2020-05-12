import path from "path";
import fs from "fs-extra";
import { ESLint, LintResult } from "eslint";
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

    const eslint = new ESLint({
      fix: parsedOptions.fix,
      baseConfig: eslintConfig,
      cwd: consumerPackage.dir,
    });

    const lint = () => {
      return Promise.all(
        consumerPackage.srcFilepaths.map(async (f) => {
          const code = await fs.readFile(f, { encoding: "utf8" });
          return eslint.lintText(code, { filePath: f });
        })
      );
    };

    const rawResults: LintResult[][] = await printProgress(
      lint(),
      "Linting source code",
      "lint"
    );

    const results: LintResult[] = [];

    for (let rawResult of rawResults) {
      for (let result of rawResult) {
        const existingResult = results.find(
          (r) => r.filePath === result.filePath
        );

        if (existingResult) {
          existingResult.messages.push(...result.messages);
          existingResult.errorCount += result.errorCount;
          existingResult.warningCount += result.warningCount;
          existingResult.fixableErrorCount += result.fixableErrorCount;
          existingResult.fixableWarningCount += result.fixableWarningCount;
        } else {
          results.push(result);
        }
      }
    }

    const errorCount = results.reduce((acc, next) => acc + next.errorCount, 0);
    const warningCount = results.reduce(
      (acc, next) => acc + next.warningCount,
      0
    );
    const fixableErrorCount = results.reduce(
      (acc, next) => acc + next.fixableErrorCount,
      0
    );
    const fixableWarningCount = results.reduce(
      (acc, next) => acc + next.fixableWarningCount,
      0
    );

    if (parsedOptions.fix) {
      const writeFiles = async () => {
        const files = results.filter((r) => r.output);

        for (const file of files) {
          await fs.writeFile(file.filePath, file.output, {
            encoding: "utf8",
          });
        }
      };

      // Immediately write fixes to file
      await printProgress(writeFiles(), "Patching files", "lint-patch");
    }

    if (errorCount === 0 && warningCount === 0) {
      // Early escape if there are no issues found
      printSuccess("✓ No issues found");

      return Promise.resolve();
    }

    // Print summary of issues eg:
    // Found 9 errors (4 fixable) and 4 warnings (2 fixable)
    const errors = `${errorCount} errors`;
    const warnings = `${warningCount} warnings`;
    const fixableErrors = `(${fixableErrorCount} fixable)`;
    const fixableWarnings = `(${fixableWarningCount} fixable)`;

    printError();
    printError(
      (errorCount > 0 ? chalk.redBright : chalk.yellowBright)(
        `Found ${errors} ${fixableErrors} and ${warnings} ${fixableWarnings}`
      )
    );

    // Print out file summaries
    const files = results.filter((r) => r.errorCount + r.warningCount > 0);

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
    if (fixableErrorCount + fixableWarningCount > 0) {
      printError();
      printError(
        `Rerun with ${chalk.yellowBright("--fix")} option to fix fixable issues`
      );
    }

    // Don't fail if we only have warnings
    return errorCount > 0 ? Promise.reject() : Promise.resolve();
  },
};
