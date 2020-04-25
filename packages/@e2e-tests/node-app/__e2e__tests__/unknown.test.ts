import { runCliCommand } from "@helpers/test-utils";

describe("unknown", () => {
  it("should print help suggestion for unknown command and exit with status 1", async () => {
    const runner = runCliCommand("yarn run ts-engine unknown");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(1);

    // Printed help to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Command unknown does not exist",
      "Run ts-engine --help to see available commands",
    ]);
  });
});
