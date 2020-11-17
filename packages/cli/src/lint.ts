import { ESLint } from "eslint";
// @ts-ignore - its an eslint config module so has no need for types
import eslintConfig from "@ts-engine/eslint-config";
import glob from "glob-promise";
import { getSupportedExtensions } from "./utils";
import { TsEngineError } from "./error";

export interface LintOptions {
  fix: boolean;
  globs: string[];
}

const findFiles = async (globs: string[]) => {
  const globResults = await Promise.all(globs.map((g) => glob(g)));
  const files = globResults.reduce((arr, next) => {
    return [...arr, ...next];
  }, []);

  return files;
};

export const lint = async (options: LintOptions) => {
  // Find files to lint based on globs
  const files = await findFiles(options.globs);

  // If no files then throw friendly error
  if (files.length === 0) {
    throw new TsEngineError("No files found.");
  }

  const eslint = new ESLint({
    fix: options.fix,
    baseConfig: {
      ...eslintConfig,
    },
    extensions: getSupportedExtensions({ dots: true }),
  });

  const results = await eslint.lintFiles(files);

  if (options.fix) {
    // ESLint handles writing file fixes to disk
    await ESLint.outputFixes(results);
  }

  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);

  const hasErrors = results.find((r) => r.errorCount > 0);
  if (hasErrors) {
    // Result test is formatted by ESLint so don't overwrite that formatting
    throw new TsEngineError(resultText);
  }

  const hasWarnings = results.find((r) => r.warningCount > 0);
  if (hasWarnings) {
    console.warn(resultText);
  }
};
