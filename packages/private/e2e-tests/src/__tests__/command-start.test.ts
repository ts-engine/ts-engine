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
    const buildRunner = runCliCommand("yarn run ts-engine start", {
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
    const buildRunner = runCliCommand("yarn run ts-engine start --watch", {
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

  describe("in typecheck mode", () => {
    let typecheckPackageDir = "";
    let typecheckPackageDistDir = "";
    let typecheckErrorPackageDir = "";

    beforeAll(async () => {
      typecheckPackageDir = await getPackageDirectory(
        "@e2e-test/command-start-typecheck"
      );
      typecheckPackageDistDir = path.resolve(typecheckPackageDir, "dist");
      typecheckErrorPackageDir = await getPackageDirectory(
        "@e2e-test/command-start-typecheck-error"
      );
    });

    beforeEach(async () => {
      await fs.remove(typecheckPackageDistDir);
    });

    it("should present typecheck errors", async () => {
      const runner = runCliCommand("yarn run ts-engine start --typecheck", {
        cwd: typecheckErrorPackageDir,
      });

      expect(await runner.waitForStatusCode()).toBe(1);

      expect(runner.stderrLines).toContainInOrder([
        "Found 2 type errors",
        "src/main.ts",
        "(2,3) Type 'string' is not assignable to type 'number'. (TS2322)",
        "(5,31) Argument of type '2' is not assignable to parameter of type 'string'. (TS2345)",
      ]);
    });

    it("should emit type definitions", async () => {
      const runner = runCliCommand(
        "yarn run ts-engine start --typecheck --emit",
        {
          cwd: typecheckPackageDir,
        }
      );

      expect(await runner.waitForStatusCode()).toBe(0);

      expect(
        await fs.pathExists(path.resolve(typecheckPackageDir, "dist/main.d.ts"))
      ).toBe(true);
    });

    it("should watch for changes", async () => {
      // Watch
      const runner = runCliCommand(
        "yarn run ts-engine start --typecheck --emit --watch",
        {
          cwd: typecheckPackageDir,
        }
      );
      await runner.waitUntilStdoutLine("Watching for changes...");

      // Types written
      const content = await fs.readFile(
        path.resolve(typecheckPackageDistDir, "main.d.ts"),
        "utf8"
      );
      expect(content)
        .toBe(`export declare const add: (a: number, b: number) => number;
`);

      // Edit package
      const waitPromise = runner.waitUntilStdoutLine("Watching for changes...");
      revertFileEdit = await editFileTemporarily(
        path.resolve(typecheckPackageDir, "src/main.ts"),
        "export const concat = (a: string, b: string): string => a + b;"
      );
      await waitPromise;

      // New types written
      const newContent = await fs.readFile(
        path.resolve(typecheckPackageDistDir, "main.d.ts"),
        "utf8"
      );
      expect(newContent)
        .toBe(`export declare const concat: (a: string, b: string) => string;
`);

      // Kill watching tool
      runner.kill();
    });
  });
});
