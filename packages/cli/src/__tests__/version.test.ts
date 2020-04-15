import { runCliCommand } from "./test-utils/run-cli-command";
import { getToolPackage } from "../utils/package";

describe("version option", () => {
  it(`should print version`, async () => {
    const runner = runCliCommand("yarn run ts-engine --version");

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect version to be logged
    const toolPackage = getToolPackage();
    expect(runner.stdoutLines).toContain(toolPackage.json.version);
  });
});
