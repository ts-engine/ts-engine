import path from "path";
import fs from "fs-extra";
import { runCliCommand } from "../run-cli-command";
import { getPackageDirectory } from "../get-package-directory";
import { editFileTemporarily } from "../edit-file-temporarily";

describe("command-typecheck", () => {
  let revertFileEdit = () => Promise.resolve();

  afterEach(async () => {
    await revertFileEdit();
  });

  beforeEach(async () => {
    const packageDirectory = await getPackageDirectory(
      "@e2e-test/command-typecheck"
    );
    await fs.remove(path.resolve(packageDirectory, "dist"));
  });

  it("should typecheck code", async () => {
    const runner = runCliCommand("yarn run ts-engine typecheck", {
      cwd: await getPackageDirectory("@e2e-test/command-typecheck"),
    });

    expect(await runner.waitForStatusCode()).toBe(0);
  });

  it("should present typecheck errors", async () => {
    const runner = runCliCommand("yarn run ts-engine typecheck", {
      cwd: await getPackageDirectory("@e2e-test/command-typecheck-error"),
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
    const packageDirectory = await getPackageDirectory(
      "@e2e-test/command-typecheck"
    );
    const runner = runCliCommand("yarn run ts-engine typecheck --emit", {
      cwd: packageDirectory,
    });

    expect(await runner.waitForStatusCode()).toBe(0);

    expect(
      await fs.pathExists(path.resolve(packageDirectory, "dist/main.d.ts"))
    ).toBe(true);
  });

  it("should watch for changes", async () => {
    const packageDirectory = await getPackageDirectory(
      "@e2e-test/command-typecheck"
    );
    const packageDistDirectory = path.resolve(packageDirectory, "dist");

    // Watch
    const runner = runCliCommand(
      "yarn run ts-engine typecheck --emit --watch",
      {
        cwd: packageDirectory,
      }
    );
    await runner.waitUntilStdoutLine("Watching for changes...");

    // Types written
    const content = await fs.readFile(
      path.resolve(packageDistDirectory, "main.d.ts"),
      "utf8"
    );
    expect(content)
      .toBe(`export declare const add: (a: number, b: number) => number;
`);

    // Edit package
    revertFileEdit = await editFileTemporarily(
      path.resolve(packageDirectory, "src/main.ts"),
      "export const concat = (a: string, b: string): string => a + b;"
    );
    await runner.waitUntilStdoutLine("Watching for changes...");

    // New types written
    const newContent = await fs.readFile(
      path.resolve(packageDistDirectory, "main.d.ts"),
      "utf8"
    );
    expect(newContent)
      .toBe(`export declare const concat: (a: string, b: string) => string;
`);

    // Kill watching tool
    runner.kill();
  });
});
