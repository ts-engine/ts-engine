import { Arguments, CommandBuilder } from "yargs";

const name = "run <entrypoint>";

const description = "Build and run code.";

const builder: CommandBuilder = (yargs) => {
  yargs.positional("entrypoint", { type: "string" }).requiresArg("entrypoint");
  yargs.boolean("w").alias("w", "watch").default("watch", false);
  yargs.boolean("skip-typecheck").default("skip-typecheck", false);
  yargs.boolean("es5").default("es5", false);

  return yargs;
};

interface RunArgs {
  watch: boolean;
  skipTypecheck: boolean;
  es5: boolean;
  entrypoint: string;
}

const handler = (argv: Arguments<RunArgs>) => {
  console.log("argv: ", argv);
};

export const run = {
  name,
  description,
  builder,
  handler,
};
