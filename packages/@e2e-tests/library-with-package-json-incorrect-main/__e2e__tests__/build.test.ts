import { runCliCommand } from "@helpers/test-utils";

describe("build", () => {
  it("should report package.json issue", async () => {
    const runner = runCliCommand("yarn run ts-engine build --library");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(1);

    // Printed info to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Found issues with package.json:",
      "Incorrect property main should be set to dist/main.cjs.js",
    ]);
  });
});
