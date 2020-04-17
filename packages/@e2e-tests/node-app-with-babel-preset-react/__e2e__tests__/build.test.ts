import { fileSystem, runCliCommand } from "@e2e-tests/test-utils";

describe("build", () => {
  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  it("should build the code containing JSX", async () => {
    const runner = runCliCommand("yarn run ts-engine build");

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
});
