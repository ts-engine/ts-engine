import yargs from "yargs";

export const extractBuildType = (argv: any) => {
  if (argv.library) {
    argv.buildType = "library";
  }

  if (argv.nodeApp) {
    argv.buildType = "node-app";
  }

  return argv;
};

export const extractArgsOptionArgs = (argv: any) => {
  const argsIndex = process.argv.indexOf("--args");
  if (argsIndex !== -1) {
    argv.args = process.argv.slice(argsIndex + 1);
  }

  return argv;
};
