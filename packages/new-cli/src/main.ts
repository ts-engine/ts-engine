#!/usr/bin/env node

import yargs from "yargs";
import { options } from "./options";
import { checkBuildTypeOptions, checkNpmPackageName } from "./checks";
import { extractArgsOptionArgs, extractBuildType } from "./middleware";
import { build, lint, newPackage, start, test, typecheck } from "./commands";

yargs
  .scriptName("ts-engine")
  .middleware(extractBuildType)
  .middleware(extractArgsOptionArgs)
  .command(
    "build",
    "Compile src/main.ts",
    (yargs) => {
      return yargs
        .options({
          ["bundle-dependencies"]: options["bundle-dependencies"],
          library: options.library,
          minify: options.minify,
          "node-app": options["node-app"],
          react: options.react,
          watch: options.watch,
        })
        .check(checkBuildTypeOptions);
      // TODO - add package json checks if its a library
    },
    async (argv) => {
      // @ts-ignore
      return build(argv);
    }
  )
  .command(
    "lint",
    "Lint code using ESLint",
    (yargs) => {
      return yargs.options({
        fix: options.fix,
        react: options.react,
      });
    },
    (argv) => {
      // @ts-ignore
      lint(argv);
    }
  )
  .command(
    "new-package",
    "Create a new package",
    (yargs) => {
      return yargs
        .options({
          library: options.library,
          name: options.name,
          "node-app": options["node-app"],
        })
        .check(checkBuildTypeOptions)
        .check(checkNpmPackageName)
        .demandOption("name");
    },
    (argv) => {
      // @ts-ignore
      newPackage(argv);
    }
  )
  .command(
    "start",
    "Compile and run src/main.ts",
    (yargs) => {
      return yargs.options({
        args: options.args,
        ["bundle-dependencies"]: options["bundle-dependencies"],
        minify: options.minify,
        react: options.react,
        watch: options.watch,
      });
    },
    (argv) => {
      // @ts-ignore
      start(argv);
    }
  )
  .command(
    "test",
    "Run tests using Jest",
    (yargs) => {
      return yargs.options({
        react: options.react,
        "<jest_options>": options["<jest_options>"],
      });
    },
    (argv) => {
      // @ts-ignore
      test(argv);
    }
  )
  .command(
    "typecheck",
    "Typecheck code using TypeScript",
    (yargs) => {
      return yargs.options({
        emit: options.emit,
      });
    },
    (argv) => {
      // @ts-ignore
      typecheck(argv);
    }
  ).argv;
