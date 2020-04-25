import ts from "typescript";
import chalk from "chalk";
import type { Command } from "../types";
import { printError, printProgress, printSuccess } from "../utils/print";
import { createBooleanOption, argsToOptions } from "../utils/options";
import { getConsumerPackage } from "../utils/package";
import { getTsEngineConfig } from "../getTsEngineConfig";

const tsEngineConfig = getTsEngineConfig();

const createConfig = (
  mergeConfig: Partial<ts.CompilerOptions>
): ts.CompilerOptions => {
  return {
    noEmit: true,
    declaration: true,
    emitDeclarationOnly: false,
    esModuleInterop: true,
    jsx: ts.JsxEmit.React,
    lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
    resolveJsonModule: true,
    skipLibCheck: true,
    strict: true,
    outDir: tsEngineConfig.outputDir,
    allowJs: true,
    ...mergeConfig,
  };
};

const options = [
  createBooleanOption({
    name: "emit",
    description: "Output type definition files",
    isRequired: false,
    defaultValue: false,
  }),
];

export interface TypecheckCommandOptions {
  emit: boolean;
}

export const typecheck: Command<TypecheckCommandOptions> = {
  name: "typecheck",
  description: "Typecheck code with TypeScript",
  options,
  run: async (args: string[]) => {
    // Ensure envs are set
    process.env.TS_ENGINE_COMMAND = "typecheck";

    const parsedOptions = argsToOptions<TypecheckCommandOptions>(args, options);

    // Setup TypeScript compiler
    const consumerPackage = getConsumerPackage();
    const program = ts.createProgram(
      consumerPackage.srcFilepaths.filter((f) => !f.includes("__tests__")),
      createConfig({
        emitDeclarationOnly: parsedOptions.emit,
        noEmit: !parsedOptions.emit,
      })
    );

    // Obtain diagnostics
    const emitResult = await printProgress(
      new Promise<ts.EmitResult>((resolve) => {
        const result = program.emit();
        resolve(result);
      }),
      parsedOptions.emit
        ? `Writing type definitions to ${tsEngineConfig.outputDir}/`
        : "Typechecking source code"
    );

    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    if (allDiagnostics.length === 0) {
      // Early escape if no issues
      printSuccess("✓ No issues found");

      return Promise.resolve();
    }

    // Print out diagnostic summary
    printError();
    printError(`Found ${chalk.redBright(allDiagnostics.length)} type errors:`);

    // Compile list of files with their error messages
    type DiagnosticFile = { filePath: string; messages: string[] };
    const files: DiagnosticFile[] = [];
    const fileDiagnostics = allDiagnostics.filter((d) => d.file);
    for (let diagnostic of fileDiagnostics) {
      // Push new file
      if (!files.find((f) => f.filePath === diagnostic.file?.fileName)) {
        files.push({
          filePath: diagnostic.file?.fileName as string,
          messages: [],
        });
      }

      // Compose message
      let lineAndCharacter = diagnostic.file?.getLineAndCharacterOfPosition(
        diagnostic.start as number
      );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );

      const composedMessage = `${chalk.redBright(
        `(${lineAndCharacter!.line + 1},${lineAndCharacter!.character + 1})`
      )} ${message} ${chalk.magentaBright(`(TS${diagnostic.code})`)}`;

      // Push message
      const file: DiagnosticFile = files.find(
        (f) => f.filePath === diagnostic.file?.fileName
      ) as DiagnosticFile;
      file.messages.push(composedMessage);
    }

    // Print file errors
    for (let file of files) {
      printError();
      printError(chalk.greenBright(file.filePath));

      for (let message of file.messages) {
        printError(message);
      }
    }

    // Print out general diagnostic error not related to a file
    const generalDiagnostics = allDiagnostics.filter((d) => !d.file);
    for (let diagnostic of generalDiagnostics) {
      printError();
      printError(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }

    return Promise.reject();
  },
};
