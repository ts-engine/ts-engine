#!/usr/bin/env node

import chalk from "chalk";
import minimist from "minimist";
import semver from "semver";
import fs from "fs-extra";
import { getMonoRepo, getPackages } from "./mono-repo";

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

  const monoRepo = await getMonoRepo(process.cwd());
  const packages = await getPackages(monoRepo.dir);

  // Update public package versions
  for (let pkg of packages) {
    const pkgNameVersion = chalk.greenBright(`${pkg.name}@${pkg.version}`);
    const pkgNewVersion = chalk.yellowBright(options.version);
    console.log(`${pkgNameVersion} ⮕  ${pkgNewVersion}...`);

    // Update package version
    const publicPkgJson = await fs.readJson(pkg.filepath);
    publicPkgJson.version = options.version;
    await fs.writeJson(pkg.filepath, publicPkgJson, { spaces: 2 });

    // Update consumers versions of this dependency
    for (let consumerPkg of packages) {
      const consumerPkgJson = await fs.readJson(consumerPkg.filepath);

      if (
        consumerPkgJson.dependencies &&
        consumerPkgJson.dependencies[pkg.name]
      ) {
        consumerPkgJson.dependencies[pkg.name] = options.version;
      }

      if (
        consumerPkgJson.devDependencies &&
        consumerPkgJson.devDependencies[pkg.name]
      ) {
        consumerPkgJson.devDependencies[pkg.name] = options.version;
      }

      await fs.writeJson(consumerPkg.filepath, consumerPkgJson, {
        spaces: 2,
      });
    }
  }
};

run();
