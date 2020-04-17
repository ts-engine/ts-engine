import { runCliCommand } from "@helpers/test-utils";
import packageJson from "@ts-engine/cli/package.json";

describe("--version", () => {
  it("should print the version", async () => {
    const runner = runCliCommand("yarn run ts-engine --version");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed version to stdout
    expect(runner.stdoutLines).toContainInOrder([`${packageJson.version}`]);
  });
});
