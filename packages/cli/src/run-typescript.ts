import path from "path";
import fs from "fs-extra";
import typescript from "typescript";
import glob from "glob-promise";
import prettyMs from "pretty-ms";

interface ProcessFilesOptions {
  emitTypes: boolean;
}

interface ProcessFilesResult {
  passed: boolean;
  output: string;
}

const processFiles = async (
  files: string[],
  options: ProcessFilesOptions
): Promise<ProcessFilesResult> => {
  const typeScriptOptions: typescript.CompilerOptions = {
    noEmit: !options.emitTypes,
    declaration: true,
    emitDeclarationOnly: options.emitTypes,
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

  const program = typescript.createProgram(files, typeScriptOptions);
  const emitResult = program.emit();
  const diagnostics = typescript
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  // create a copy of each type file for .cjs output files
  for (let file of emitResult.emittedFiles ?? []) {
    await fs.copyFile(file, file.replace(".d.ts", ".cjs.d.ts"));
  }

  if (diagnostics.length > 0) {
    const host = typescript.createCompilerHost(typeScriptOptions);
    const output = typescript.formatDiagnosticsWithColorAndContext(
      diagnostics,
      host
    );

    return {
      passed: false,
      output: output,
    };
  }

  return {
    passed: true,
    output: "",
  };
};

interface RunTypescriptResult {
  passed: boolean;
  output: string;
}

export const runTypescript = async (): Promise<RunTypescriptResult> => {
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

  const testFilesResult = await processFiles(testFiles, { emitTypes: false });
  const sourceFilesResult = await processFiles(sourceFiles, {
    emitTypes: true,
  });

  const endMs = Date.now();
  const duration = prettyMs(endMs - startMs);
  const totalFiles = sourceFiles.length + testFiles.length;

  if (sourceFilesResult.passed && testFilesResult.passed) {
    return {
      passed: true,
      output: `Typechecked ${totalFiles} files in ${duration}.`,
    };
  } else {
    const output = `${sourceFilesResult.output}${testFilesResult.output}`;

    return {
      passed: false,
      output: `Typechecked ${totalFiles} files in ${duration}.\n\n${output}`,
    };
  }
};
