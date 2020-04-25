import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("start", () => {
  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  it("should forward args onto app when run when using the --args option", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine start --args --one=value --two two-value final"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed info to stdout which included printed args
    expect(runner.stdoutLines).toContainInOrder([
      `[\"--one=value\",\"--two\",\"two-value\",\"final\"]`,
    ]);
  });
});
