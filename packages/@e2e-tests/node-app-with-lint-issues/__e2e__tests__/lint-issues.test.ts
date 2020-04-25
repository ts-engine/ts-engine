import { runCliCommand } from "@helpers/test-utils";

describe("lint-issues", () => {
  it("should print linting issues with auto fix suggestion and exit with 1", async () => {
    const runner = runCliCommand("yarn run ts-engine lint");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(1);

    // Printed errors and warnings to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Found 1 errors (1 fixable) and 0 warnings (0 fixable)",
      "src/main.ts",
      "Error (1:1) Unexpected var, use let or const instead. (no-var) (fixable)",
      "Rerun with --fix option to fix fixable issues",
    ]);
  });
});
