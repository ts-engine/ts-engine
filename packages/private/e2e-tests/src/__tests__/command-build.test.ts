import os from "os";
import path from "path";
import fs from "fs-extra";
import { runCliCommand } from "../run-cli-command";
import { getPackageDirectory } from "../get-package-directory";

describe("command-build", () => {
  let packageDir = "";
  let packageDistDir = "";
  let consumerDir = "";
  let consumerDistDir = "";
  let isolatedDir = "";
  let reactPackageDir = "";
  let reactConsumerDir = "";
  let reactConsumerDistDir = "";

  beforeAll(async () => {
    packageDir = await getPackageDirectory("@e2e-test/command-build");
    packageDistDir = path.resolve(packageDir, "dist");
    consumerDir = path.resolve(packageDir, "consumer");
    consumerDistDir = path.resolve(consumerDir, "dist");
    reactPackageDir = await getPackageDirectory(
      "@e2e-test/command-build-react"
    );
    reactConsumerDir = path.resolve(reactPackageDir, "consumer");
    reactConsumerDistDir = path.resolve(reactConsumerDir, "dist");
    isolatedDir = path.resolve(
      os.tmpdir(),
      ".ts-engine/temp/command-build/dist"
    );

    await fs.ensureDir(isolatedDir);
  });

  beforeEach(async () => {
    await fs.remove(packageDistDir);
    await fs.remove(consumerDistDir);
    await fs.remove(isolatedDir);
  });

  it("should build a library", async () => {
    // Build library
    const buildRunner = runCliCommand("yarn build --library", {
      cwd: packageDir,
    });

    expect(await buildRunner.waitForStatusCode()).toBe(0);
    expect(
      await fs.pathExists(path.resolve(packageDistDir, "main.cjs.js"))
    ).toBe(true);
    expect(
      await fs.pathExists(path.resolve(packageDistDir, "main.cjs.js.map"))
    ).toBe(true);
    expect(
      await fs.pathExists(path.resolve(packageDistDir, "main.esm.js"))
    ).toBe(true);
    expect(
      await fs.pathExists(path.resolve(packageDistDir, "main.esm.js.map"))
    ).toBe(true);

    // Build consumer
    const buildConsumerRunner = runCliCommand("yarn build --node-app", {
      cwd: consumerDir,
    });

    expect(await buildConsumerRunner.waitForStatusCode()).toBe(0);

    // Run consumer
    const runRunner = runCliCommand("node main.js", {
      cwd: consumerDistDir,
    });

    expect(await runRunner.waitForStatusCode()).toBe(0);
    expect(runRunner.stdoutLines).toContainInOrder(["1 + 2 = 3", "1 + 2 = 3"]);
  });

  it("should build a node app", async () => {
    // Build app
    const buildRunner = runCliCommand("yarn build --node-app", {
      cwd: packageDir,
    });

    expect(await buildRunner.waitForStatusCode()).toBe(0);
    expect(await fs.pathExists(path.resolve(packageDistDir, "main.js"))).toBe(
      true
    );
    expect(
      await fs.pathExists(path.resolve(packageDistDir, "main.js.map"))
    ).toBe(true);

    // Run app
    const runRunner = runCliCommand("node main.js", {
      cwd: packageDistDir,
    });

    expect(await runRunner.waitForStatusCode()).toBe(0);
    expect(runRunner.stdoutLines).toContainInOrder(["1 + 2 = 3"]);
  });

  it("should minify", async () => {
    // Build unminified
    const unminifiedBuildRunner = runCliCommand("yarn build --node-app", {
      cwd: packageDir,
    });

    expect(await unminifiedBuildRunner.waitForStatusCode()).toBe(0);
    const unminifiedLength = (
      await fs.readFile(path.resolve(packageDistDir, "main.js"), {
        encoding: "utf8",
      })
    ).length;

    // Build minified
    const minifiedBuildRunner = runCliCommand(
      "yarn build --node-app --minify",
      {
        cwd: packageDir,
      }
    );

    expect(await minifiedBuildRunner.waitForStatusCode()).toBe(0);
    const minifiedLength = (
      await fs.readFile(path.resolve(packageDistDir, "main.js"), {
        encoding: "utf8",
      })
    ).length;

    expect(minifiedLength).toBeLessThan(unminifiedLength);
  });

  it("should bundle dependencies", async () => {
    // Build library
    const buildRunner = runCliCommand("yarn build --library", {
      cwd: packageDir,
    });

    expect(await buildRunner.waitForStatusCode()).toBe(0);

    // Build consumer
    const buildConsumerRunner = runCliCommand(
      "yarn build --node-app --bundle-dependencies",
      {
        cwd: consumerDir,
      }
    );

    expect(await buildConsumerRunner.waitForStatusCode()).toBe(0);

    // Run consumer in a directory where it can't possibly require its dependencies

    await fs.move(path.resolve(consumerDistDir), path.resolve(isolatedDir), {
      overwrite: true,
    });
    const runRunner = runCliCommand("node main.js", {
      cwd: isolatedDir,
    });

    expect(await runRunner.waitForStatusCode()).toBe(0);
    expect(runRunner.stdoutLines).toContainInOrder(["1 + 2 = 3", "1 + 2 = 3"]);
  });

  it("should build react code", async () => {
    // Build library
    const buildRunner = runCliCommand("yarn build", {
      cwd: reactPackageDir,
    });

    expect(await buildRunner.waitForStatusCode()).toBe(0);

    // Build consumer
    const buildConsumerRunner = runCliCommand("yarn build", {
      cwd: reactConsumerDir,
    });

    expect(await buildConsumerRunner.waitForStatusCode()).toBe(0);

    // Run consumer
    const runRunner = runCliCommand("node main.js", {
      cwd: reactConsumerDistDir,
    });

    expect(await runRunner.waitForStatusCode()).toBe(0);
    expect(runRunner.stdoutLines).toContainInOrder(["<span>3</span>"]);
  });
});
