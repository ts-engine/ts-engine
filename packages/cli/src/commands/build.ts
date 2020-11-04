import { Arguments, CommandBuilder } from "yargs";

const command = "build <entrypoints...>";

const description = "Build code using ESBuild.";

const builder: CommandBuilder = (yargs) => {
  yargs
    .positional("entrypoints", { type: "string" })
    .requiresArg("entrypoints");
  yargs.boolean("w").alias("w", "watch").default("watch", false);
  yargs.boolean("skip-typecheck").default("skip-typecheck", false);
  yargs.boolean("es5").default("es5", false);

  return yargs;
};

interface BuildArgs {
  watch: boolean;
  skipTypecheck: boolean;
  es5: boolean;
  entrypoints: string[];
}

const handler = (argv: Arguments<BuildArgs>) => {
  console.log("argv: ", argv);
};

export const build = {
  command,
  description,
  builder,
  handler,
};
