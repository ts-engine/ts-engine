import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("start", () => {
  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  it("should build and run the node app", async () => {
    const runner = runCliCommand("yarn run ts-engine start");

    // Wait for tool to run app
    await runner.waitUntilStdoutLine("starting server");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Starting app...",
      "starting server",
    ]);

    // Need to
    runner.kill();
  });
});
