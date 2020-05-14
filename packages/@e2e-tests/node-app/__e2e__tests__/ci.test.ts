import { runCliCommand } from "@helpers/test-utils";

describe("ci", () => {
  const originalCi = process.env.CI;

  beforeEach(async () => {});

  afterEach(() => {
    process.env.CI = originalCi;
  });

  it("should not use the progress estimator when in CI mode", async () => {
    console.log(process.env);
    process.env.CI = "true";

    const runner = runCliCommand("yarn run ts-engine build --node-app");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Expect the build log to be outputted by itself, not part of the progress-estimator log
    expect(runner.stdoutLines).toContainInOrder(["Building bundle"]);
  });
});
