#!/usr/bin/env node

/* eslint-disable jest/no-disabled-tests,jest/expect-expect */

import yargs from "yargs";
import { options } from "./options";
import { handleFailure } from "./handle-failure";
import {
  checkBuildTypeOptions,
  checkNpmPackageName,
  checkLibraryNpmPackageJson,
  checkNewPackageFolderIsAvailable,
} from "./checks";
import { extractArgsOptionArgs, extractBuildType } from "./middleware";
import { build, lint, newPackage, start, test, typecheck } from "./commands";

yargs
  .scriptName("ts-engine")
  .middleware(extractBuildType)
  .middleware(extractArgsOptionArgs)
  .fail(handleFailure)
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
        .check(checkBuildTypeOptions)
        .check(checkLibraryNpmPackageJson);
    },
    async (argv) => {
      // @ts-ignore
      await build(argv);
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
    async (argv) => {
      // @ts-ignore
      await lint(argv);
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
          react: options.react,
        })
        .check(checkBuildTypeOptions)
        .check(checkNpmPackageName)
        .check(checkNewPackageFolderIsAvailable)
        .demandOption("name");
    },
    async (argv) => {
      // @ts-ignore
      await newPackage(argv);
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
    async (argv) => {
      // @ts-ignore
      await start(argv);
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
        watch: options.watch,
      });
    },
    async (argv) => {
      // @ts-ignore
      await typecheck(argv);
    }
  ).argv;
