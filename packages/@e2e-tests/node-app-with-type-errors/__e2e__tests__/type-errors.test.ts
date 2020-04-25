import { runCliCommand } from "@helpers/test-utils";

describe("type-errors", () => {
  it("should print type errors and exit with 1", async () => {
    const runner = runCliCommand("yarn run ts-engine typecheck");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(1);

    // Printed errors and warnings to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Found 1 type errors:",
      "src/main.ts",
      "(2,3) Type 'string' is not assignable to type 'number'. (TS2322)",
    ]);
  });
});
