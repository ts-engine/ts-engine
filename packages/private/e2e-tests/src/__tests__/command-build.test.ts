import os from "os";
import path from "path";
import fs from "fs-extra";
import { runCliCommand } from "../run-cli-command";
import { getPackageDirectory } from "../get-package-directory";
import { editFileTemporarily } from "../edit-file-temporarily";

describe("command-build", () => {
  let packageDir = "";
  let packageDistDir = "";
  let consumerDir = "";
  let consumerDistDir = "";
  let isolatedDir = "";
  let failurePackageDir = "";
  let reactPackageDir = "";
  let reactConsumerDir = "";
  let reactConsumerDistDir = "";
  let revertFileEdit = () => Promise.resolve();

  beforeAll(async () => {
    packageDir = await getPackageDirectory("@e2e-test/command-build");
    packageDistDir = path.resolve(packageDir, "dist");
    consumerDir = path.resolve(packageDir, "consumer");
    consumerDistDir = path.resolve(consumerDir, "dist");
    isolatedDir = path.resolve(
      os.tmpdir(),
      ".ts-engine/temp/command-build/dist"
    );
    reactPackageDir = await getPackageDirectory(
      "@e2e-test/command-build-react"
    );
    reactConsumerDir = path.resolve(reactPackageDir, "consumer");
    reactConsumerDistDir = path.resolve(reactConsumerDir, "dist");
    failurePackageDir = await getPackageDirectory(
      "@e2e-test/command-build-failure"
    );

    await fs.ensureDir(isolatedDir);
  });

  beforeEach(async () => {
    await fs.remove(packageDistDir);
    await fs.remove(consumerDistDir);
    await fs.remove(isolatedDir);
  });

  afterEach(async () => {
    await revertFileEdit();
  });

  it("should build a library", async () => {
    // Build library
    const buildRunner = runCliCommand("yarn run ts-engine build --library", {
      cwd: packageDir,
    });

    await buildRunner.waitForStatusCode();

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
    const buildConsumerRunner = runCliCommand(
      "yarn run ts-engine build --node-app",
      {
        cwd: consumerDir,
      }
    );

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
    const buildRunner = runCliCommand("yarn run ts-engine build --node-app", {
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

  it("should exit with status code 1 on failure", async () => {
    // Build app
    const buildRunner = runCliCommand("yarn run ts-engine build --node-app", {
      cwd: failurePackageDir,
    });

    expect(await buildRunner.waitForStatusCode()).toBe(1);
  });

  it("should minify", async () => {
    // Build unminified
    const unminifiedBuildRunner = runCliCommand(
      "yarn run ts-engine build --node-app",
      {
        cwd: packageDir,
      }
    );

    expect(await unminifiedBuildRunner.waitForStatusCode()).toBe(0);
    const unminifiedLength = (
      await fs.readFile(path.resolve(packageDistDir, "main.js"), {
        encoding: "utf8",
      })
    ).length;

    // Build minified
    const minifiedBuildRunner = runCliCommand(
      "yarn run ts-engine build --node-app --minify",
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
    const buildRunner = runCliCommand("yarn run ts-engine build --library", {
      cwd: packageDir,
    });

    expect(await buildRunner.waitForStatusCode()).toBe(0);

    // Build consumer
    const buildConsumerRunner = runCliCommand(
      "yarn run ts-engine build --node-app --bundle-dependencies",
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
    const buildRunner = runCliCommand(
      "yarn run ts-engine build --library --react",
      {
        cwd: reactPackageDir,
      }
    );

    expect(await buildRunner.waitForStatusCode()).toBe(0);

    // Build consumer
    const buildConsumerRunner = runCliCommand(
      "yarn run ts-engine build --node-app --react",
      {
        cwd: reactConsumerDir,
      }
    );

    expect(await buildConsumerRunner.waitForStatusCode()).toBe(0);

    // Run consumer
    const runRunner = runCliCommand("node main.js", {
      cwd: reactConsumerDistDir,
    });

    expect(await runRunner.waitForStatusCode()).toBe(0);
    expect(runRunner.stdoutLines).toContainInOrder(["<span>3</span>"]);
  });

  it("should watch for changes", async () => {
    // Build library
    const buildRunner = runCliCommand(
      "yarn run ts-engine build --node-app --watch",
      {
        cwd: packageDir,
      }
    );
    await buildRunner.waitUntilStdoutLine("Watching for changes...");

    // Edit package
    revertFileEdit = await editFileTemporarily(
      path.resolve(packageDir, "src/main.ts"),
      "console.log('editted');"
    );
    await buildRunner.waitUntilStdoutLine("Watching for changes...");

    // Run editted package
    const runRunner = runCliCommand("node main.js", {
      cwd: packageDistDir,
    });

    expect(await runRunner.waitForStatusCode()).toBe(0);
    expect(runRunner.stdoutLines).toContainInOrder(["editted"]);

    // Kill watching tool
    buildRunner.kill();
  });
});
