import { runCliCommand } from "@helpers/test-utils";

describe("build-no-entry-file", () => {
  it("should print error and exit with 1 if no entry file", async () => {
    const runner = runCliCommand("yarn run ts-engine build");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(1);

    // Printed error to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Error: Could not resolve entry module (src/main.ts).",
    ]);
  });
});
