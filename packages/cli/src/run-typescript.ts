import path from "path";
import typescript from "typescript";
import glob from "glob-promise";
import prettyMs from "pretty-ms";

interface RunTypescriptResult {
  passed: boolean;
  output: string;
}

export const runTypescript = (): RunTypescriptResult => {
  const startMs = Date.now();

  // find all files files to typecheck in the project
  const files = glob
    .sync("{,**/}*.{d.ts,ts}")
    .map((p) => path.resolve(p))
    .filter((p) => !p.includes("/node_modules/"))
    .filter((p) => !p.includes("/dist/"))
    .filter((p) => !p.includes("/coverage/"));

  const typescriptOptions: typescript.CompilerOptions = {
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
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
  };

  const program = typescript.createProgram(files, typescriptOptions);
  const emitResult = program.emit();
  const allDiagnostics = typescript
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  const endMs = Date.now();
  const duration = prettyMs(endMs - startMs);

  if (allDiagnostics.length > 0) {
    const host = typescript.createCompilerHost(typescriptOptions);
    const output = typescript.formatDiagnosticsWithColorAndContext(
      allDiagnostics,
      host
    );

    return {
      passed: false,
      output: `Typechecked ${files.length} files in ${duration}.\n\n${output}`,
    };
  }

  return {
    passed: true,
    output: `Typechecked ${files.length} files in ${duration}.`,
  };
};
