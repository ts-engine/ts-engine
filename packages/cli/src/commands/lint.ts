import { Arguments, CommandBuilder } from "yargs";
import { ESLint } from "eslint";
// @ts-ignore - its an eslint config module so has no need for types
import eslintConfig from "@ts-engine/eslint-config";
import glob from "glob-promise";
import { getSupportedExtensions } from "../utils";

const command = "lint <globs...>";

const description = "Lint code using ESLint";

const builder: CommandBuilder = (yargs) => {
  yargs.positional("globs", { type: "string" }).requiresArg("globs");
  yargs.boolean("fix").default("fix", false);

  return yargs;
};

interface LintArgs {
  fix: boolean;
  globs: string[];
}

const handler = async (argv: Arguments<LintArgs>) => {
  const files = await (
    await Promise.all(argv.globs.map((g) => glob(g)))
  ).reduce((arr, next) => {
    return [...arr, ...next];
  }, []);

  if (files.length === 0) {
    console.error("No files found");
    return process.exit(1);
  }

  const eslint = new ESLint({
    fix: argv.fix,
    baseConfig: {
      ...eslintConfig,
    },
    extensions: getSupportedExtensions({ dots: true }),
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
