import { runCliCommand } from "@helpers/test-utils";

describe("test", () => {
  it("merges jest.config.js and run tests", async () => {
    const runner = runCliCommand("yarn run ts-engine test");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed info to stderr (jest prints test output to stderr for some reason)
    expect(runner.stderrLines).toContainInOrder([
      "Test Suites: 1 passed, 1 total",
      "Ran all test suites.",
    ]);
  });
});
