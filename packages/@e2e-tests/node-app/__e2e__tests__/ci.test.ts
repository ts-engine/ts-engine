import { runCliCommand } from "@helpers/test-utils";

describe("ci", () => {
  it("should not use the progress estimator when in CI mode", async () => {
    const runner = runCliCommand("yarn run ts-engine build --node-app", {
      env: { CI: "true" },
    });

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Expect the build log to be outputted by itself, not part of the progress-estimator log
    expect(runner.stdoutLines).toContainInOrder(["Building bundle"]);
  });
});
