import { runCliCommand } from "../run-cli-command";
import { getPackageDirectory } from "../get-package-directory";

describe("command-test", () => {
  it("should run tests", async () => {
    const runner = runCliCommand("yarn test", {
      cwd: await getPackageDirectory("@e2e-test/command-test"),
    });

    const statusCode = await runner.waitForStatusCode();

    expect(statusCode).toBe(0);
    expect(runner.stderrLines).toContainInOrder([
      "Test Suites: 1 passed, 1 total",
      "Ran all test suites.",
    ]);
  });

  it("should run tests", async () => {
    const runner = runCliCommand("yarn test", {
      cwd: await getPackageDirectory("@e2e-test/command-test-react"),
    });

    const statusCode = await runner.waitForStatusCode();

    expect(statusCode).toBe(0);
    expect(runner.stderrLines).toContainInOrder([
      "Test Suites: 1 passed, 1 total",
      "Ran all test suites.",
    ]);
  });

  it("should run tests and forward jest status code", async () => {
    const runner = runCliCommand("yarn test", {
      cwd: await getPackageDirectory("@e2e-test/command-test-failure"),
    });

    const statusCode = await runner.waitForStatusCode();

    expect(statusCode).toBe(1);
    expect(runner.stderrLines).toContainInOrder([
      "Test Suites: 1 failed, 1 total",
      "Ran all test suites.",
    ]);
  });

  it.only("should forward args onto jest excluding ts-engine args", async () => {
    const runner = runCliCommand(
      "yarn test --react --passWithNoTests src/add.ts",
      {
        cwd: await getPackageDirectory("@e2e-test/command-test"),
      }
    );

    const statusCode = await runner.waitForStatusCode();
    console.log(runner.stderrLines);

    expect(statusCode).toBe(0);
  });
});
