import { Context, NextFunction } from "@leecheneler/cli";
import glob from "glob-promise";
// @ts-ignore - its an eslint config module so has no need for types
import eslintConfig from "@ts-engine/eslint-config";
import { ESLint } from "eslint";
import { SUPPORTED_EXTENSIONS } from "../../constants";

const findFiles = async (globs: string[]) => {
  const globResults = await Promise.all(globs.map((g) => glob(g)));
  const files = globResults.reduce((arr, next) => {
    return [...arr, ...next];
  }, []);

  return files;
};

interface LintContext {
  fix: boolean;
}

export const lint = () => async (
  ctx: Context & LintContext,
  next: NextFunction
) => {
  const [...globs] = ctx.options._;

  const files = await findFiles(globs);

  if (files.length === 0) {
    ctx.throw(1, "No files found.");
  }

  const eslint = new ESLint({
    fix: ctx.options.fix,
    baseConfig: {
      ...eslintConfig,
    },
    extensions: SUPPORTED_EXTENSIONS.map((e) => `.${e}`),
  });

  const results = await eslint.lintFiles(files);

  if (ctx.options.fix) {
    await ESLint.outputFixes(results);
  }

  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  const hasErrors = results.find((r) => r.errorCount > 0);
  if (hasErrors) {
    ctx.throw(1, resultText);
  }

  const hasWarnings = results.find((r) => r.warningCount > 0);
  if (hasWarnings) {
    console.warn(resultText);
  }

  await next();
};
