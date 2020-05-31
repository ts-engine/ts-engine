import path from "path";
import fs from "fs-extra";
import { runCliCommand } from "../run-cli-command";
import { getPackageDirectory } from "../get-package-directory";

describe("command-lint", () => {
  let originalFixedFileContents = "";
  let fixedFilepath = "";

  beforeAll(async () => {
    const fixedFilePackageDir = await getPackageDirectory(
      "@e2e-test/command-lint-fixable"
    );
    fixedFilepath = path.resolve(fixedFilePackageDir, "src/main.ts");
    originalFixedFileContents = await fs.readFile(fixedFilepath, "utf8");
  });

  afterEach(async () => {
    await fs.writeFile(fixedFilepath, originalFixedFileContents);
  });

  it("should lint code", async () => {
    const runner = runCliCommand("yarn run ts-engine lint", {
      cwd: await getPackageDirectory("@e2e-test/command-lint"),
    });

    expect(await runner.waitForStatusCode()).toBe(0);
  });

  it("should present lint errors", async () => {
    const runner = runCliCommand("yarn run ts-engine lint", {
      cwd: await getPackageDirectory("@e2e-test/command-lint-error"),
    });

    expect(await runner.waitForStatusCode()).toBe(1);
    expect(runner.stderrLines).toContainInOrder([
      "Found 1 errors (0 fixable) and 0 warnings (0 fixable)",
      "src/main.ts",
      "Error (3:3) Unreachable code. (no-unreachable)",
    ]);
  });

  it("should present fixable issues", async () => {
    const runner = runCliCommand("yarn run ts-engine lint", {
      cwd: await getPackageDirectory("@e2e-test/command-lint-fixable"),
    });

    expect(await runner.waitForStatusCode()).toBe(1);
    expect(runner.stderrLines).toContainInOrder([
      "Found 1 errors (1 fixable) and 0 warnings (0 fixable)",
      "src/main.ts",
      "Error (1:1) Unexpected var, use let or const instead. (no-var) (fixable)",
      "Rerun with --fix argument to fix fixable issues",
    ]);
  });

  it("should fix files", async () => {
    const runner = runCliCommand("yarn run ts-engine lint --fix", {
      cwd: await getPackageDirectory("@e2e-test/command-lint-fixable"),
    });

    expect(await runner.waitForStatusCode()).toBe(0);
    expect(await fs.readFile(fixedFilepath)).not.toBe(
      originalFixedFileContents
    );
  });

  it("should be unable to lint react by default", async () => {
    const runner = runCliCommand("yarn run ts-engine lint", {
      cwd: await getPackageDirectory("@e2e-test/command-lint-react"),
    });

    expect(await runner.waitForStatusCode()).toBe(1);
    expect(runner.stderrLines).toContainInOrder([
      "Found 1 errors (0 fixable) and 0 warnings (0 fixable)",
      "src/add.tsx",
      "Error (1:8) 'React' is defined but never used. (@typescript-eslint/no-unused-vars)",
    ]);
  });

  it("should lint react when --react argument is provided", async () => {
    const runner = runCliCommand("yarn run ts-engine lint --react", {
      cwd: await getPackageDirectory("@e2e-test/command-lint-react"),
    });

    expect(await runner.waitForStatusCode()).toBe(0);
  });
});
