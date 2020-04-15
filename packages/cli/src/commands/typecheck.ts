import ts from "typescript";
import chalk from "chalk";
import type { Command } from "../types";
import { print, printError } from "../utils/print";
import { createBooleanOption, argsToOptions } from "../utils/options";
import { getConsumerPackage } from "../utils/package";
import { getTsEngineConfig } from "../config/ts-engine";

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
  description: `Typecheck code with ${chalk.blueBright("TypeScript")}`,
  options,
  run: async (args: string[]) => {
    const parsedOptions = argsToOptions<TypecheckCommandOptions>(args, options);

    // Announce tool
    print(`Typechecking code with ${chalk.blueBright("TypeScript")}`);
    print();

    // Setup TypeScript compiler
    const consumerPackage = getConsumerPackage();
    let program = ts.createProgram(
      consumerPackage.srcFilepaths.filter((f) => !f.includes("__tests__")),
      createConfig({
        emitDeclarationOnly: parsedOptions.emit,
        noEmit: !parsedOptions.emit,
      })
    );

    if (parsedOptions.emit) {
      // Notify where types will be written to
      print(
        `Writing type definitions to ${chalk.greenBright(
          tsEngineConfig.outputDir
        )}`
      );
      print();
    }

    // Obtain diagnostics
    let emitResult = program.emit();
    let allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    if (allDiagnostics.length === 0) {
      // Early escape if no issues
      print("No issues found");
      print();

      return Promise.resolve();
    }

    // Print out diagnostic summary
    printError(`Found ${chalk.redBright(allDiagnostics.length)} type errors:`);
    printError();

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
      )}: ${message}`;

      // Push message
      const file: DiagnosticFile = files.find(
        (f) => f.filePath === diagnostic.file?.fileName
      ) as DiagnosticFile;
      file.messages.push(composedMessage);
    }

    // Print file errors
    for (let file of files) {
      printError(chalk.greenBright(file.filePath));

      for (let message of file.messages) {
        printError(message);
      }

      printError();
    }

    // Print out generalk diagnostic error not related to a file
    const generalDiagnostics = allDiagnostics.filter((d) => !d.file);
    for (let diagnostic of generalDiagnostics) {
      printError(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      printError();
    }

    return Promise.reject();
  },
};
