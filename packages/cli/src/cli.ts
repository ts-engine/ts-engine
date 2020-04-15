#!/usr/bin/env node

import chalk from "chalk";
import type { Command } from "./types";
import { getToolPackage } from "./utils/package";
import { print, printError } from "./utils/print";
import { build } from "./commands/build";
import { lint } from "./commands/lint";
import { test } from "./commands/_test";
import { typecheck } from "./commands/typecheck";

const run = async (): Promise<void> => {
  const [, , commandArg, ...args] = process.argv;
  const toolPackage = getToolPackage();
  const commands: Command<unknown>[] = [build, lint, test, typecheck];

  if (commandArg === "--version") {
    // Handle top level tool options
    print(toolPackage.json.version);

    return Promise.resolve();
  }

  if (commandArg == "--help") {
    // Print out helpful infomation
    print(
      `${toolPackage.json.name} (${chalk.blueBright(
        toolPackage.json.repository.url
      )})`
    );
    print();

    print(toolPackage.json.description);
    print();

    const nameColumnWidth = 20;

    const versionName = chalk.bold("--version".padEnd(nameColumnWidth));
    const versionDesc = "Print version";
    print(`${versionName}${versionDesc}`);
    print();

    for (let command of commands) {
      const commandName = chalk.bold(command.name.padEnd(nameColumnWidth));
      const commandDesc = command.description;
      print(`${commandName}${commandDesc}`);

      for (let option of command.options) {
        const optionName = `--${option.name}`.padEnd(nameColumnWidth);
        const optionDesc = option.description;
        print(`${optionName}${optionDesc}`);
      }

      print();
    }

    return Promise.resolve();
  }

  const command = commands.find((c) => c.name === commandArg);
  if (!command) {
    // Notify command doesn't exist via stderr logs
    printError(`Command '${commandArg}' does not exist`);
    print();

    printError("Run 'ts-engine --help' to see available commands");
    print();

    // Reject to ensure the project exits with status 1
    return Promise.reject();
  }

  // Run the command
  try {
    await command.run(args);
  } catch (error) {
    printError(error);
    return Promise.reject();
  }
};

// Run immediately
run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
