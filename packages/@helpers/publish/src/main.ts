#!/usr/bin/env node

import { spawnSync } from "child_process";
import chalk from "chalk";
import minimist from "minimist";
import semver from "semver";
import { getMonoRepo, getPackages, Package } from "./mono-repo";

interface Options {
  version: string;
  tag?: string;
}
const [, , command, ...args] = process.argv;
const options = minimist<Options>(args);

const assertVersion = () => {
  if (semver.valid(options.version) === null) {
    const example = chalk.yellowBright("--version=M.m.p-<pre>");
    console.error(`Please provide a valid version via ${example}`);
    process.exit(1);
  }
};

const getPackagesToPublish = async () => {
  const monoRepo = await getMonoRepo(process.cwd());
  const packages = await getPackages(monoRepo.dir);
  const publicPackages = packages.filter((p) => !p.private);
  return publicPackages;
};

const printPackagesToBePublished = (packages: Package[]) => {
  const version = chalk.yellowBright(options.version);
  console.log(`Packages to be published with version ${version}:\n`);

  for (let pkg of packages) {
    console.log(chalk.greenBright(pkg.name));
  }
};

const updatePackageVersions = (packages: Package[], version: string) => {
  for (let pkg of packages) {
    console.log(`Updating ${chalk.greenBright(pkg.name)}'s version`);
    spawnSync("npm", ["version", version], { cwd: pkg.dir });
  }
};

const publishPackages = (
  packages: Package[],
  version: string,
  tag: string = "latest"
): Promise<void> => {
  const successes: Package[] = [];
  for (let pkg of packages) {
    console.log(`Publishing ${chalk.greenBright(pkg.name)}...`);
    const result = spawnSync(
      "npm",
      ["publish", "--access", "public", "--tag", tag],
      {
        cwd: pkg.dir,
      }
    );
    if (result.status === 0) {
      console.log(chalk.greenBright("Success"));
      successes.push(pkg);
    } else {
      console.log(chalk.redBright("Failed"));
      break;
    }
  }

  if (successes.length === packages.length) {
    return Promise.resolve();
  }

  for (let pkg of successes) {
    console.log(`Rolling back ${chalk.greenBright(pkg.name)}...`);
    const result = spawnSync("npm", ["unpublish", `${pkg.name}@${version}`], {
      cwd: pkg.dir,
    });
    if (result.status === 0) {
      console.log(chalk.greenBright("Success"));
    } else {
      console.log(chalk.redBright("Failed"));
    }
  }

  return Promise.reject();
};

const updateGit = (version: string) => {
  console.log(
    `Creating publish git branch ${chalk.yellowBright(`publish-${version}`)}`
  );
  spawnSync("git", ["checkout", "-b", `publish-${version}`]);

  console.log(
    `Committing version updates to branch ${chalk.yellowBright(
      `publish-${version}`
    )}`
  );
  spawnSync("git", ["add", "-A"]);
  spawnSync("git", ["commit", "-m", `"updated versions to ${version}"`]);

  console.log(`Pushing branch ${chalk.yellowBright(`publish-${version}`)}`);
  spawnSync("git", ["push"]);

  console.log(`Tagging commit ${chalk.yellowBright(`${version}`)}`);
  spawnSync("git", ["tag", version]);

  console.log(`Pushing tag ${chalk.yellowBright(`${version}`)}`);
  spawnSync("git", ["push", version]);
};

const resetPackageVersions = (packages: Package[]) => {
  for (let pkg of packages) {
    console.log(`Resetting ${chalk.greenBright(pkg.name)}'s version...`);
    const result = spawnSync("npm", ["version", pkg.version], { cwd: pkg.dir });
    if (result.status === 0) {
      console.log(chalk.greenBright("Success"));
    } else {
      console.log(chalk.redBright("Failed"));
    }
  }
};

const run = async () => {
  switch (command) {
    case "plan": {
      assertVersion();
      const packages = await getPackagesToPublish();
      printPackagesToBePublished(packages);
      break;
    }
    case "publish": {
      assertVersion();
      const packages = await getPackagesToPublish();
      updatePackageVersions(packages, options.version);
      console.log();
      try {
        await publishPackages(packages, options.version, options.tag);
        console.log();
        updateGit(options.version);
      } catch {
        resetPackageVersions(packages);
      }
      break;
    }
    default: {
      const publish = chalk.yellowBright("publish");
      const plan = chalk.yellowBright("plan");
      console.error(`Please provide either the ${publish} or ${plan} command`);
      process.exit(1);
    }
  }
};

run();
