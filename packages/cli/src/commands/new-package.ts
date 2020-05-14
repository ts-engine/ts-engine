import { spawnSync } from "child_process";
import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import validatePackageName from "validate-npm-package-name";
import { printError, printProgress } from "../utils/print";
import type { Command, OutputType } from "../types";
import {
  createBooleanOption,
  createStringOption,
  argsToOptions,
} from "../utils/options";

const options = [
  createBooleanOption({
    name: "node-app",
    description: "Outputs a Node.js application",
    isRequired: false,
    defaultValue: false,
  }),
  createBooleanOption({
    name: "library",
    description: "Outputs a JavaScript library",
    isRequired: false,
    defaultValue: false,
  }),
  createStringOption({
    name: "license",
    description: "The new package's license",
    isRequired: false,
    defaultValue: "UNLICENSED",
  }),
  createStringOption({
    name: "name",
    description: "The new package's name",
    isRequired: true,
    defaultValue: "",
  }),
];

export interface NewPackageCommandOptions {
  "node-app": boolean;
  library: boolean;
  license: string;
  name: string;
}

export const newPackage: Command<NewPackageCommandOptions> = {
  name: "new-package",
  description: "Create a new package",
  options,
  run: async (args: string[]) => {
    // Ensure envs are set
    process.env.TS_ENGINE_COMMAND = "init";

    const parsedOptions = argsToOptions<NewPackageCommandOptions>(
      args,
      options
    );

    // Required to specify whether building an Node.js app or a JavaScript library
    if (!parsedOptions["node-app"] && !parsedOptions.library) {
      const nodeAppOption = chalk.yellowBright("--node-app");
      const libraryOption = chalk.yellowBright("--library");

      printError(`Must specify either ${nodeAppOption} or ${libraryOption}`);
      return Promise.reject();
    }

    if (parsedOptions["node-app"] && parsedOptions.library) {
      const nodeAppOption = chalk.yellowBright("--node-app");
      const libraryOption = chalk.yellowBright("--library");

      printError(
        `Cannot specify both ${nodeAppOption} and ${libraryOption}, please provide one`
      );
      return Promise.reject();
    }

    // Determine if the package name is valid
    const isNameValid = validatePackageName(parsedOptions.name);
    if (!isNameValid.validForNewPackages) {
      printError("Invalid package name provided");
      return Promise.reject();
    }

    // Determine the new package's dir, support scoped package names
    const newPackageDir = parsedOptions.name.startsWith("@")
      ? parsedOptions.name.split("/")[1]
      : parsedOptions.name;

    if (await fs.pathExists(newPackageDir)) {
      printError(`Folder ${newPackageDir} already exists`);
      return Promise.reject();
    }

    // Determine output type
    const outputType: OutputType = parsedOptions["node-app"]
      ? "node-app"
      : "library";

    // Write files
    const tsEngineCliVersion = spawnSync(
      "npm",
      ["show", "@ts-engine/cli", "version"],
      { encoding: "utf8" }
    ).stdout.replace("\n", "");
    const writeFiles = async () => {
      await fs.ensureDir(newPackageDir);
      await fs.writeJSON(
        path.resolve(newPackageDir, "package.json"),
        {
          name: parsedOptions.name,
          version: "1.0.0",
          license: parsedOptions.license,
          private: outputType === "node-app",
          scripts: {
            build:
              outputType === "node-app"
                ? "ts-engine build --node-app"
                : "ts-engine build --library",
            lint: "ts-engine lint",
            test: "ts-engine test",
            typecheck:
              outputType === "node-app"
                ? "ts-engine typecheck"
                : "ts-engine typecheck --emit",
          },
          devDependencies: {
            "@ts-engine/cli": `^${tsEngineCliVersion}`,
          },
        },
        { encoding: "utf8", spaces: 2 }
      );
      await fs.ensureFile(path.resolve(newPackageDir, "src/main.ts"));
      await fs.writeFile(
        path.resolve(newPackageDir, "src/main.ts"),
        outputType === "node-app"
          ? 'console.log("hello world");'
          : 'export const printHelloWorld = () => console.log("hello world");',
        { encoding: "utf8" }
      );
    };

    await printProgress(
      writeFiles(),
      "Writing package files",
      "new-package-write"
    );

    // Install ts-engine
    spawnSync("yarn", {
      cwd: newPackageDir,
      stdio: "inherit",
    });
  },
};
