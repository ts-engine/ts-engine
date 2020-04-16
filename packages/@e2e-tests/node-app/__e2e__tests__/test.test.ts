import { runCliCommand } from "@e2e-tests/test-utils";

describe("test", () => {
  it("run tests", async () => {
    const runner = runCliCommand("yarn run test");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder(["Running tests with Jest"]);

    // Printed info to stderr (jest prints test output to stderr for some reason)
    expect(runner.stderrLines).toContainInOrder([
      "Test Suites: 1 passed, 1 total",
      "Ran all test suites.",
    ]);
  });

  it("forwards jests status code", async () => {
    const runner = runCliCommand("yarn run test no-tests.ts");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with Jest's status code
    expect(statusCode).toBe(1);

    // Printed info to stderr (jest prints failure info to stdout for some reason)
    expect(runner.stdoutLines).toContainInOrder([
      "No tests found, exiting with code 1",
    ]);
  });

  it("forwards args onto jest", async () => {
    const runner = runCliCommand("yarn run test --passWithNoTests no-tests.ts");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with Jest's status code
    expect(statusCode).toBe(0);

    // Printed info to stderr (jest prints failure info to stdout for some reason)
    expect(runner.stdoutLines).toContainInOrder([
      "No tests found, exiting with code 0",
    ]);
  });
});
