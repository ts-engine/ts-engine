import path from "path";
import fs from "fs-extra";
import typescript from "typescript";
import glob from "glob-promise";
import prettyMs from "pretty-ms";
import chalk from "chalk";

const typeScriptOptions: typescript.CompilerOptions = {
  declaration: true,
  esModuleInterop: true,
  jsx: typescript.JsxEmit.React,
  lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
  resolveJsonModule: true,
  skipLibCheck: true,
  strict: true,
  outDir: "dist",
  allowJs: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  allowSyntheticDefaultImports: true,
  noEmitOnError: true,
  listEmittedFiles: true,
};

const typescriptHost = typescript.createCompilerHost(typeScriptOptions);
interface ProcessFilesOptions {
  emitTypes: boolean;
}

const processFiles = async (files: string[], options: ProcessFilesOptions) => {
  const program = typescript.createProgram(files, {
    ...typeScriptOptions,
    noEmit: !options.emitTypes,
    emitDeclarationOnly: options.emitTypes,
  });
  const emitResult = program.emit();
  const diagnostics = typescript
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  return {
    diagnostics,
    emitResult,
  };
};

export interface RunTypescriptResult {
  passed: boolean;
  output: string;
}

export const typecheck = async (
  entryFilepaths: string[]
): Promise<RunTypescriptResult> => {
  const startMs = Date.now();

  // find all test files to typecheck
  const testFiles = glob
    .sync("{,**/}*.{test,spec}.{.d.ts,ts,tsx}")
    .map((p) => path.resolve(p))
    .filter((p) => !p.includes("/node_modules/"))
    .filter((p) => !p.includes("/dist/"))
    .filter((p) => !p.includes("/coverage/"));

  // find all source files to typecheck and emit types for
  const sourceFiles = glob
    .sync("{,**/}*.{d.ts,ts,tsx}")
    .map((p) => path.resolve(p))
    .filter((p) => !testFiles.includes(p)) // don't want tp emit types for test files
    .filter((p) => !p.includes("/node_modules/"))
    .filter((p) => !p.includes("/dist/"))
    .filter((p) => !p.includes("/coverage/"));

  const testFilesResults = await processFiles(testFiles, {
    emitTypes: false,
  });
  const sourceFilesResults = await processFiles(sourceFiles, {
    emitTypes: true,
  });

  const emittedFiles = [
    ...(testFilesResults.emitResult.emittedFiles ?? []),
    ...(sourceFilesResults.emitResult.emittedFiles ?? []),
  ];
  const emittedEntryFiles = emittedFiles.filter((emittedFile) =>
    entryFilepaths.find((entryFile) =>
      entryFile
        .replace("src", "dist")
        .startsWith(emittedFile.replace("d.ts", ""))
    )
  );

  // create a copy of each type file for .cjs output files
  for (let file of emittedEntryFiles ?? []) {
    await fs.copyFile(file, file.replace(".d.ts", ".cjs.d.ts"));
  }

  const endMs = Date.now();
  const duration = prettyMs(endMs - startMs);
  const totalFiles = sourceFiles.length + testFiles.length;

  const diagnostics = [
    ...sourceFilesResults.diagnostics,
    ...sourceFilesResults.diagnostics,
  ];

  if (diagnostics.length === 0) {
    return {
      passed: true,
      output: chalk.green`Typechecked ${chalk.bold`${totalFiles}`} files (${chalk.bold`${duration}`})`,
    };
  }

  const normalisedDiagnostics: typescript.Diagnostic[] = [];

  for (let d of diagnostics) {
    const exists = normalisedDiagnostics.find(
      (nd) =>
        nd.category === d.category &&
        nd.code === d.code &&
        nd.file?.fileName === d.file?.fileName &&
        nd.length === d.length &&
        nd.messageText === d.messageText &&
        nd.source === d.source &&
        nd.start === d.start
    );

    if (!exists) {
      normalisedDiagnostics.push(d);
    }
  }

  const output = typescript.formatDiagnosticsWithColorAndContext(
    normalisedDiagnostics,
    typescriptHost
  );

  return {
    passed: false,
    output: chalk.redBright`Typechecked ${chalk.bold`${totalFiles}`} files (${chalk.bold`${duration}`}).\n\n${output}`,
  };
};
