import { runCliCommand } from "@e2e-tests/test-utils";

describe("lint-reports-issues", () => {
  it("should print linting issues with auto fix suggestion and exit with 1", async () => {
    const runner = runCliCommand("yarn run lint");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(1);

    // Printed errors and warnings to stderr
    expect(runner.stdoutLines).toContainInOrder(["Linting with ESLint"]);
    expect(runner.stderrLines).toContainInOrder([
      "Found 1 errors (0 fixable) and 0 warnings (0 fixable)",
      "src/main.ts",
      "Error (1:8) Unexpected var, use let or const instead. (no-var)",
      "Rerun with --fix to fix fixable issues",
    ]);
  });
});
