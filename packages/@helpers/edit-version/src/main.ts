#!/usr/bin/env node

import { spawnSync } from "child_process";
import chalk from "chalk";
import minimist from "minimist";
import semver from "semver";
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
  const publicPackages = packages.filter((p) => !p.private);

  for (let pkg of publicPackages) {
    const pkgNameVersion = chalk.blueBright(`${pkg.name}@${pkg.version}`);
    const pkgNewVersion = chalk.yellowBright(options.version);
    console.log(`${pkgNameVersion} ⮕  ${pkgNewVersion}`);
    spawnSync("npm", ["version", options.version], { cwd: pkg.dir });
  }
};

run();
