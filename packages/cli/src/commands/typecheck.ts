import chalk from "chalk";
import typescript from "typescript";
import chokidar from "chokidar";
import { debounce } from "debounce";
import { createTypeScriptConfig } from "../config";
import { getPackage } from "../get-package";
import { logProgress } from "../log-progress";
import { srcFileGlob } from "../constants";

interface TypecheckOptions {
  emit: boolean;
  watch: boolean;
}

export const typecheck = async (options: TypecheckOptions) => {
  const pkg = getPackage();

  const work = async (exitOnComplete: boolean) => {
    const tsConfig = createTypeScriptConfig({ emit: options.emit });

    const program = typescript.createProgram(
      pkg.srcFilepaths.filter((f) => !f.includes("__tests__")),
      tsConfig
    );

    // Obtain diagnostics
    const emitResult = await logProgress(
      new Promise<typescript.EmitResult>((resolve) => {
        const result = program.emit();
        resolve(result);
      }),
      options.emit
        ? `Writing type definitions to ${tsConfig.outDir}/`
        : "Typechecking source code",
      "typecheck"
    );

    const allDiagnostics = typescript
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    if (allDiagnostics.length === 0) {
      // Early escape if no issues
      console.log(chalk.greenBright("✓ No issues found"));

      if (exitOnComplete) {
        process.exit(0);
      }

      return;
    }

    // Print out diagnostic summary
    console.error();
    console.error(
      chalk.redBright(`Found ${allDiagnostics.length} type errors`)
    );

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
      let message = typescript.flattenDiagnosticMessageText(
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
      console.error();
      console.error(chalk.greenBright(file.filePath));

      for (let message of file.messages) {
        console.error(message);
      }
    }

    // Print out general diagnostic error not related to a file
    const generalDiagnostics = allDiagnostics.filter((d) => !d.file);
    for (let diagnostic of generalDiagnostics) {
      console.error();
      console.error(
        typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }

    if (exitOnComplete) {
      process.exit(1);
    }
  };

  if (options.watch) {
    const watcher = chokidar.watch(srcFileGlob, { cwd: pkg.dir });
    watcher.on("ready", async () => {
      // Run initial typecheck
      await work(false);

      // Then on each change typecheck again, we debounce this in order
      // to try and accomodate saving multiple files in once go
      watcher.on(
        "all",
        debounce(
          async () => {
            console.clear();
            await work(false);
            console.log(chalk.grey("Watching for changes..."));
          },
          350,
          false
        )
      );
      console.log(chalk.grey("Watching for changes..."));
    });

    await new Promise(() => {});
  } else {
    await work(true);
  }
};
