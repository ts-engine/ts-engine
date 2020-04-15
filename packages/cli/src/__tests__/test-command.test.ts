import "./test-utils/extend-expect";
import { runCliCommand } from "./test-utils/run-cli-command";
import { createMockPackage, MockPackage } from "./test-utils/mock-package";

describe("test command", () => {
  let mockPackage: MockPackage;

  beforeEach(async () => {
    if (mockPackage) {
      await mockPackage.cleanup();
    }
  });

  afterAll(async () => {
    await mockPackage.cleanup();
  });

  it("runs jest", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/test-command");
    mockPackage.writeFile(
      "src/__tests__/main.test.ts",
      "it('should pass', () => { expect(1 + 2).toBe(3) });"
    );

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine test", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder(["Running tests with Jest"]);

    // Jest outputs everything to stderr, always has for some reason
    expect(runner.stderrLines).toContainInOrder([
      "Test Suites: 1 passed, 1 total",
      "Ran all test suites.",
    ]);
  });

  it("forwards args onto jest", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/test-command");

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine test --passWithNoTests", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);
  });

  it("forwards jest's status code", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/test-command");

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine test", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(1);
  });
});
