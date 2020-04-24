import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("start-watch", () => {
  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  it("should forward args onto app when run when using the --args option", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine start --watch --args --one=value --two two-value final"
    );

    // Should exit successfully
    await runner.waitUntilStdoutLine(
      `[\"--one=value\",\"--two\",\"two-value\",\"final\"]`
    );

    // Printed info to stdout which included printed args
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      `[\"--one=value\",\"--two\",\"two-value\",\"final\"]`,
    ]);

    // Kill the running app
    runner.kill();
  });
});
