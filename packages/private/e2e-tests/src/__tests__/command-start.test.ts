import path from "path";
import fs from "fs-extra";
import { runCliCommand } from "../run-cli-command";
import { getPackageDirectory } from "../get-package-directory";
import { editFileTemporarily } from "../edit-file-temporarily";

describe("command-start", () => {
  let packageDir = "";
  let packageDistDir = "";
  let revertFileEdit = () => Promise.resolve();

  beforeAll(async () => {
    packageDir = await getPackageDirectory("@e2e-test/command-start");
    packageDistDir = path.resolve(packageDir, "dist");
  });

  beforeEach(async () => {
    await fs.remove(packageDistDir);
  });

  afterEach(async () => {
    await revertFileEdit();
  });

  it("should build a node app and start", async () => {
    const buildRunner = runCliCommand("yarn start", {
      cwd: packageDir,
    });

    expect(await buildRunner.waitForStatusCode()).toBe(0);
    expect(await fs.pathExists(path.resolve(packageDistDir, "main.js"))).toBe(
      true
    );
    expect(
      await fs.pathExists(path.resolve(packageDistDir, "main.js.map"))
    ).toBe(true);
    expect(buildRunner.stdoutLines).toContainInOrder(["lee"]);
  });

  it("should watch for changes", async () => {
    const buildRunner = runCliCommand("yarn start --watch", {
      cwd: packageDir,
    });
    await buildRunner.waitUntilStdoutLine("lee");

    revertFileEdit = await editFileTemporarily(
      path.resolve(packageDir, "src/main.ts"),
      "console.log('editted');"
    );

    await buildRunner.waitUntilStdoutLine("editted");

    // Kill watching tool
    buildRunner.kill();
  });
});
