import typescript from "typescript";
import { TsEngineError } from "./error";

interface TypecheckOptions {
  files: string[];
}

export const typecheck = (options: TypecheckOptions) => {
  const typescriptOptions = {
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
  };

  const program = typescript.createProgram(options.files, typescriptOptions);
  const emitResult = program.emit();
  const allDiagnostics = typescript
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  if (allDiagnostics.length > 0) {
    const host = typescript.createCompilerHost(typescriptOptions);
    const output = typescript.formatDiagnosticsWithColorAndContext(
      allDiagnostics,
      host
    );

    throw new TsEngineError(output);
  }
};
