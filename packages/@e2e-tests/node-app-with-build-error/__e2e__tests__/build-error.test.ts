import { runCliCommand } from "@helpers/test-utils";

describe("build-error", () => {
  it("should print error and exit with 1 if no entry file", async () => {
    const runner = runCliCommand("yarn run ts-engine build --node-app");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(1);

    // Printed error to stderr
    const line = runner.stderrLines.find((l) => l.includes("SyntaxError"));
    expect(line).not.toBeUndefined();
  });
});
