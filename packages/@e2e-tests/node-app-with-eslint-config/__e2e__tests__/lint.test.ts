import { runCliCommand } from "@helpers/test-utils";

describe("lint", () => {
  it("picks up .eslintrc config file and exits successfully", async () => {
    const runner = runCliCommand("yarn run ts-engine lint");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed help to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Linting with ESLint",
      "No issues found",
    ]);
  });
});
