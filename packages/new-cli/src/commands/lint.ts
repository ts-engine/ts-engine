import path from "path";
import chalk from "chalk";
import type { LintResult } from "eslint";
import { ESLint } from "eslint";
import fs from "fs-extra";
import { createESLintConfig } from "../config";
import { getPackage } from "../get-package";
import { logProgress } from "../logger";
import { flattenLintResults, getCounts } from "../lint-results";

interface LintOptions {
  fix: boolean;
  react: boolean;
}

export const lint = async (options: LintOptions) => {
  const eslintConfig = createESLintConfig({ react: options.react });
  const pkg = await getPackage();

  const eslint = new ESLint({
    fix: options.fix,
    baseConfig: eslintConfig,
    cwd: pkg.dir,
  });

  const lint = () => {
    return Promise.all(
      pkg.srcFilepaths.map(async (f) => {
        const code = await fs.readFile(f, { encoding: "utf8" });
        return eslint.lintText(code, { filePath: f });
      })
    );
  };

  const rawResults: LintResult[][] = await logProgress(
    lint(),
    chalk.greenBright("Linting source code"),
    "lint"
  );

  const results = flattenLintResults(rawResults);
  const counts = getCounts(results);

  if (options.fix) {
    const writeFiles = async () => {
      const files = results.filter((r) => r.output);

      for (const file of files) {
        await fs.writeFile(file.filePath, file.output, {
          encoding: "utf8",
        });
      }
    };

    // Immediately write fixes to file
    await logProgress(writeFiles(), "Patching files", "lint-patch");
  }

  // Early bail if there are not issues
  if (counts.errorCount === 0 && counts.warningCount === 0) {
    console.log(chalk.greenBright("✓ No issues found"));
    process.exit(0);
  }

  // Print summary of issues eg:
  // Found 9 errors (4 fixable) and 4 warnings (2 fixable)
  const errors = `${counts.errorCount} errors`;
  const warnings = `${counts.warningCount} warnings`;
  const fixableErrors = `(${counts.fixableErrorCount} fixable)`;
  const fixableWarnings = `(${counts.fixableWarningCount} fixable)`;

  console.error(
    (counts.errorCount > 0 ? chalk.redBright : chalk.yellowBright)(
      `\nFound ${errors} ${fixableErrors} and ${warnings} ${fixableWarnings}`
    )
  );

  // Print out file summaries
  const files = results.filter((r) => r.errorCount + r.warningCount > 0);
  for (let file of files) {
    console.error(
      chalk.greenBright(`\n${path.relative(pkg.dir, file.filePath)}`)
    );

    for (let message of file.messages) {
      const prefix =
        message.severity === 2
          ? chalk.redBright(`Error (${message.line}:${message.column})`)
          : chalk.yellowBright(`Warning (${message.line}:${message.column})`);

      const fixableAffix = message.fix ? chalk.greenBright(" (fixable)") : "";
      const ruleAffix = chalk.magentaBright(` (${message.ruleId})`);

      console.error(`${prefix} ${message.message}${ruleAffix}${fixableAffix}`);
    }
  }

  console.log(counts);
  if (counts.fixableErrorCount + counts.fixableWarningCount > 0) {
    console.error(`\nRerun with --fix argument to fix fixable issues`);
  }

  if (counts.errorCount > 0) {
    process.exit(1);
  }
};
