import yargs from "yargs";
import { lint, LintOptions } from "./lint";
import { build, BuildOptions } from "./build";
import { test } from "./test";
import { formatter } from "./log-formatter";
import { isTsEngineError } from "./error";

interface RunOptions {
  filepath: string;
  watch: boolean;
  typecheck: boolean;
  bundle: boolean;
  minify: boolean;
}

const handleError = (error: Error) => {
  if (isTsEngineError(error)) {
    console.error(formatter.error(error.message.toString()));
  } else {
    console.error(formatter.error(error.toString()));
  }

  process.exit(1);
};

export const runCli = (args: string[]) => {
  yargs(args)
    .command(
      "build <filepaths...>",
      "Build code using Rollup.",
      (yargs) => {
        yargs
          .positional("filepaths", { type: "string" })
          .requiresArg("filepaths");
        yargs.boolean("w").alias("w", "watch").default("watch", false);
        yargs.boolean("typecheck").default("typecheck", true);
        yargs.boolean("bundle").default("bundle", false);
        yargs.boolean("minify").default("minify", true);
      },
      async (options: BuildOptions) => {
        try {
          await build(options);
        } catch (error) {
          handleError(error);
        }
      }
    )
    .command(
      "lint <globs...>",
      "Lint code using ESLint.",
      (yargs) => {
        yargs.positional("globs", { type: "string" }).requiresArg("globs");
        yargs.boolean("fix").default("fix", false);
      },
      async (options: LintOptions) => {
        try {
          await lint(options);
        } catch (error) {
          handleError(error);
        }
      }
    )
    .command(
      "run <filepath>",
      "Build and run code.",
      (yargs) => {
        yargs
          .positional("filepath", { type: "string" })
          .requiresArg("filepath");
        yargs.boolean("w").alias("w", "watch").default("watch", true);
        yargs.boolean("typecheck").default("typecheck", true);
        yargs.boolean("bundle").default("bundle", false);
        yargs.boolean("minify").default("minify", true);
      },
      (options: RunOptions) => {
        console.log("hello world from run!", options);
      }
    )
    .command(
      "test",
      "Run tests using Jest.",
      () => {},
      async () => {
        try {
          await test();
        } catch (error) {
          handleError(error);
        }
      }
    ).argv;
};
