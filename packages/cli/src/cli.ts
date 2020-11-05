import yargs from "yargs";
import { build, lint, run, test } from "./commands";

export const cli = (options: { args: string[]; exitProcess: boolean }) => {
  yargs(options.args)
    .command(build.command, build.description, build.builder, build.handler)
    .command(lint.command, lint.description, lint.builder, lint.handler)
    .command(run.command, run.description, run.builder, run.handler)
    .command(test.command, test.description, test.builder, test.handler)
    .exitProcess(options.exitProcess).argv;
};
