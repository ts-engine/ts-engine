import "./test-utils/extend-expect";
import { runCliCommand } from "./test-utils/run-cli-command";

describe("unknown command", () => {
  it("exits with status 1 on unknown command", async () => {
    const runner = runCliCommand("yarn run ts-engine unknown");

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(1);

    // Expect correct output
    expect(runner.stderrLines).toContainInOrder([
      "Command 'unknown' does not exist",
      "Run 'ts-engine --help' to see available commands",
    ]);
  });
});
