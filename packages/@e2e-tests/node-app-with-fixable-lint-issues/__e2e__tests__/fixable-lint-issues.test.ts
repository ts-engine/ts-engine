import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("fixable-lint-issues", () => {
  afterEach(async () => {
    // Put back unfixed file
    await fileSystem.writeFile(
      "src/main.ts",
      `var a = 1;

export const getA = () => {
  return a;
};
`
    );
  });

  it("should print fixable issues and suggest auto fix", async () => {
    const runner = runCliCommand("yarn run ts-engine lint");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(1);

    // Printed errors and suggest auto fix to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Found 1 errors (1 fixable) and 0 warnings (0 fixable)",
      "src/main.ts",
      "Error (1:1) Unexpected var, use let or const instead. (no-var) (fixable)",
      "Rerun with --fix option to fix fixable issues",
    ]);
  });

  it("should fix fixable linting issues", async () => {
    const runner = runCliCommand("yarn run ts-engine lint --fix");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(0);

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder(["✓ No issues found"]);
  });
});
