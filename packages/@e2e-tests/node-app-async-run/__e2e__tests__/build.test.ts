import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("build", () => {
  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  it("should build the code", async () => {
    const runner = runCliCommand("yarn run ts-engine build --node-app");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
    ]);

    // Built file is written to file system
    expect(await fileSystem.readFile("dist/main.js")).toMatchSnapshot();
  });

  it("built app should work", async () => {
    const runner = runCliCommand("yarn run ts-engine build --node-app");

    // Wait for tool to complete
    await runner.waitForStatusCode();

    // Run the app
    const appRunner = runCliCommand("node dist/main.js");

    // Wait for app to complete
    const statusCode = await appRunner.waitForStatusCode();

    // Should exist successfully
    expect(statusCode).toBe(0);

    // Should have printed message
    expect(appRunner.stdoutLines).toContain("Hello Lee!");
  }, 10000);
});