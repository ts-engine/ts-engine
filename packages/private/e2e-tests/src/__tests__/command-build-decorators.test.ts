import os from "os";
import path from "path";
import fs from "fs-extra";
import { runCliCommand } from "../run-cli-command";
import { getPackageDirectory } from "../get-package-directory";
import { editFileTemporarily } from "../edit-file-temporarily";

describe("command-build-decorators", () => {
  let packageDir = "";
  let packageDistDir = "";
  let revertFileEdit = () => Promise.resolve();

  beforeAll(async () => {
    packageDir = await getPackageDirectory(
      "@e2e-test/command-build-decorators"
    );
    packageDistDir = path.resolve(packageDir, "dist");
  });

  beforeEach(async () => {
    await fs.remove(packageDistDir);
  });

  it("should build a node app with decorators", async () => {
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
    expect(runRunner.stdoutLines).toContainInOrder([
      "f(): evaluated",
      "g(): evaluated",
      "g(): called",
      "f(): called",
    ]);
  });
});
