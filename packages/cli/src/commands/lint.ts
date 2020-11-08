import { Arguments, CommandBuilder } from "yargs";
import { ESLint } from "eslint";
// @ts-ignore - its an eslint config module so has no need for types
import eslintConfig from "@ts-engine/eslint-config";
import glob from "glob-promise";

const command = "lint <glob>";

const description = "Lint code using ESLint";

const builder: CommandBuilder = (yargs) => {
  yargs.positional("glob", { type: "string" }).requiresArg("glob");
  yargs.boolean("fix").default("fix", false);

  return yargs;
};

interface LintArgs {
  fix: boolean;
  glob: string;
}

const handler = async (argv: Arguments<LintArgs>) => {
  const files = await glob(argv.glob);

  if (files.length === 0) {
    console.error("No files found");
    return process.exit(1);
  }

  const eslint = new ESLint({
    fix: argv.fix,
    baseConfig: {
      ...eslintConfig,
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs", ".es6"],
  });

  const results = await eslint.lintFiles(files);

  if (argv.fix) {
    await ESLint.outputFixes(results);
  }

  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  const hasErrors = results.find((r) => r.errorCount > 0);
  const hasWarnings = results.find((r) => r.warningCount > 0);

  if (hasErrors) {
    console.error(resultText);
    return process.exit(1);
  }

  if (hasWarnings) {
    console.warn(resultText);
  }

  return process.exit(0);
};

export const lint = {
  command,
  description,
  builder,
  handler,
};
