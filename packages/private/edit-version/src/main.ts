#!/usr/bin/env node

import path from "path";
import chalk from "chalk";
import minimist from "minimist";
import semver from "semver";
import fs from "fs-extra";
import { findMonoRepo, findPackages } from "@mono-repo/utils";

interface Options {
  version: string;
}

const run = async () => {
  const [, , ...args] = process.argv;
  const options = minimist<Options>(args);

  if (semver.valid(options.version) === null) {
    const example = chalk.yellowBright("--version=M.m.p-<pre>");
    console.error(`Please provide a valid version that looks like ${example}`);
    process.exit(1);
  }

  const monoRepo = await findMonoRepo();
  const packages = await findPackages(monoRepo);
  const buildSelfVersion = packages.find(
    (p) => p.json.name === "@ts-engine/cli"
  ).json.devDependencies["@ts-engine/cli"];

  // Update public package versions
  for (let pkg of packages) {
    const pkgNameVersion = chalk.greenBright(
      `${pkg.json.name}@${pkg.json.version}`
    );
    const pkgNewVersion = chalk.yellowBright(options.version);
    console.log(`${pkgNameVersion} ⮕  ${pkgNewVersion}...`);

    // Update package version
    const packageJsonFilepath = path.join(pkg.dir, "package.json");
    const publicPkgJson = await fs.readJson(packageJsonFilepath);
    publicPkgJson.version = options.version;
    await fs.writeJson(packageJsonFilepath, publicPkgJson, { spaces: 2 });

    // Update consumers versions of this dependency
    for (let consumerPkg of packages) {
      const consumerPackageJsonFilepath = path.join(
        consumerPkg.dir,
        "package.json"
      );

      const consumerPkgJson = await fs.readJson(consumerPackageJsonFilepath);

      // Built by an old version of itself so don't bump
      const version =
        consumerPkgJson.name === "@ts-engine/cli" &&
        pkg?.json?.name === "@ts-engine/cli"
          ? buildSelfVersion
          : options.version;

      if (
        consumerPkgJson.dependencies &&
        consumerPkgJson.dependencies[pkg.json.name]
      ) {
        consumerPkgJson.dependencies[pkg.json.name] = version;
      }

      if (
        consumerPkgJson.devDependencies &&
        consumerPkgJson.devDependencies[pkg.json.name]
      ) {
        consumerPkgJson.devDependencies[pkg.json.name] = version;
      }

      await fs.writeJson(consumerPackageJsonFilepath, consumerPkgJson, {
        spaces: 2,
      });
    }
  }
};

run();
