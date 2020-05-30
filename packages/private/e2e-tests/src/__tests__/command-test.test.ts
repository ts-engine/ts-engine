import { runCliCommand } from "../run-cli-command";
import { getPackageDirectory } from "../get-package-directory";

describe("command-test", () => {
  it("should run tests", async () => {
    const runner = runCliCommand("yarn test", {
      cwd: await getPackageDirectory("@e2e-test/command-test"),
    });

    expect(await runner.waitForStatusCode()).toBe(0);
    expect(runner.stderrLines).toContainInOrder([
      "Test Suites: 1 passed, 1 total",
      "Ran all test suites.",
    ]);
  });

  it("should run tests (react)", async () => {
    const runner = runCliCommand("yarn test", {
      cwd: await getPackageDirectory("@e2e-test/command-test-react"),
    });

    expect(await runner.waitForStatusCode()).toBe(0);
    expect(runner.stderrLines).toContainInOrder([
      "Test Suites: 1 passed, 1 total",
      "Ran all test suites.",
    ]);
  });

  it("should run tests and forward jest status code", async () => {
    const runner = runCliCommand("yarn test", {
      cwd: await getPackageDirectory("@e2e-test/command-test-failure"),
    });

    expect(await runner.waitForStatusCode()).toBe(1);
    expect(runner.stderrLines).toContainInOrder([
      "Test Suites: 1 failed, 1 total",
      "Ran all test suites.",
    ]);
  });

  it("should forward args onto jest excluding ts-engine args", async () => {
    const runner = runCliCommand(
      "yarn test --react --passWithNoTests src/add.ts",
      {
        cwd: await getPackageDirectory("@e2e-test/command-test"),
      }
    );

    expect(await runner.waitForStatusCode()).toBe(0);
  });
});
