import { Arguments, CommandBuilder } from "yargs";

const command = "lint <glob>";

const description = "Lint code using ESLint";

const builder: CommandBuilder = (yargs) => {
  yargs.positional("glob", { type: "string" }).requiresArg("glob");
  yargs.boolean("fix").default("fix", false);

  return yargs;
};

interface LintArgs {
  fix: boolean;
  glob: string;
}

const handler = (argv: Arguments<LintArgs>) => {
  console.log("argv: ", argv);
};

export const lint = {
  command,
  description,
  builder,
  handler,
};
