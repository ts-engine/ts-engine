import { Arguments, CommandBuilder } from "yargs";

const command = "test <jest_args>";

const description = "Test code using Jest.";

const builder: CommandBuilder = (yargs) => {
  return yargs;
};

interface TestArgs {}

const handler = (argv: Arguments<TestArgs>) => {
  console.log("argv: ", argv);
};

export const test = {
  command,
  description,
  builder,
  handler,
};
