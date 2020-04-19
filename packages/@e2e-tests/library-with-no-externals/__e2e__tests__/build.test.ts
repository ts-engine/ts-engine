import path from "path";
import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("build", () => {
  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
    await fileSystem.deleteDir("consumer/dist");
  });

  it("should build the code", async () => {
    const runner = runCliCommand("yarn run ts-engine build --library");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.cjs.js",
      "src/main.ts ⮕  dist/main.esm.js",
    ]);

    // Built file is written to file system
    expect(await fileSystem.fileExists("dist/main.cjs.js")).toBe(true);
    expect(await fileSystem.fileExists("dist/main.esm.js")).toBe(true);
  });

  it("built library should work", async () => {
    const libraryBuildRunner = runCliCommand(
      "yarn run ts-engine build --library"
    );

    // Wait for tool to complete
    expect(await libraryBuildRunner.waitForStatusCode()).toBe(0);

    // Then build consumer app
    const consumerBuildRunner = runCliCommand(
      "yarn run ts-engine build --node-app",
      { cwd: path.resolve("consumer") }
    );

    // Wait for tool to complete
    expect(await consumerBuildRunner.waitForStatusCode()).toBe(0);

    // Run the app
    const appRunner = runCliCommand("node consumer/dist/main.js");

    // Wait for app to complete
    expect(await appRunner.waitForStatusCode()).toBe(0);

    // Should have printed message
    expect(appRunner.stdoutLines).toContain("Hello Lee!");
  }, 10000);
});
