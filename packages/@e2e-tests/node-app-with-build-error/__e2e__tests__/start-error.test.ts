import { runCliCommand } from "@helpers/test-utils";

describe("start-error", () => {
  it("should print error and exit with 1 if there is a build error", async () => {
    const runner = runCliCommand("yarn run ts-engine start");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit with failure
    expect(statusCode).toBe(1);

    // Printed error to stderr
    const line = runner.stderrLines.find((l) => l.includes("SyntaxError"));
    expect(line).not.toBeUndefined();
  });

  it("should print build error when running in watch mode", async () => {
    const runner = runCliCommand("yarn run ts-engine start --watch");

    // Wait for tool to complete
    await runner.waitUntilStdoutLine("Watching for changes...");

    // Printed error to stderr
    const line = runner.stderrLines.find((l) => l.includes("SyntaxError"));
    expect(line).not.toBeUndefined();

    runner.kill();
  });
});
