import "./test-utils/extend-expect";
import { runCliCommand } from "./test-utils/run-cli-command";
import { createMockPackage, MockPackage } from "./test-utils/mock-package";

describe("lint command", () => {
  let mockPackage: MockPackage;

  beforeEach(async () => {
    if (mockPackage) {
      await mockPackage.cleanup();
    }
  });

  afterAll(async () => {
    await mockPackage.cleanup();
  });

  it("runs eslint", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/lint-command");

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine lint", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Linting with ESLint",
      "No issues found",
    ]);
  });

  it("lints unfixable issues and does not present auto fix option", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/lint-command");
    mockPackage.writeFile(
      "src/main.ts",
      `export const fn = () => {
  return;
  console.log("hello world");
};
`
    );

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine lint", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(1);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder(["Linting with ESLint"]);
    expect(runner.stderrLines).toContainInOrder([
      "Found 1 errors (0 fixable) and 0 warnings (0 fixable)",
      "Error (3:3) Unreachable code. (no-unreachable)",
    ]);
    expect(runner.stderrLines).not.toContain(
      "Rerun with --fix to fix fixable issues"
    );
  });

  it("lints fixable issues and presents auto fix suggestion", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/lint-command");
    mockPackage.writeFile("src/main.ts", "var a = 1; console.log(a)");

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine lint", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(1);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder(["Linting with ESLint"]);
    expect(runner.stderrLines).toContainInOrder([
      "Found 2 errors (2 fixable) and 0 warnings (0 fixable)",
      "Error (1:1) Unexpected var, use let or const instead. (no-var)",
      "Error (1:11) Replace `·console.log(a)` with `⏎console.log(a);⏎` (prettier/prettier)",
      "Rerun with --fix to fix fixable issues",
    ]);
  });

  it("fixes autofixable lint issues when --fix is present", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/lint-command");
    mockPackage.writeFile("src/main.ts", "var a = 1; console.log(a)");

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine lint --fix", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Linting with ESLint",
      "No issues found",
    ]);

    // Expect file to be fixed
    const fixedFileContent = await mockPackage.readFile("src/main.ts");
    expect(fixedFileContent).toBe(`let a = 1;
console.log(a);
`);
  });

  it("picks up .eslintrc.js file if there is one", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/lint-command");
    mockPackage.writeFile(
      "src/main.ts",
      `export var a = 1;
`
    );
    mockPackage.writeFile(
      ".eslintrc.js",
      `module.exports = {
  rules: {
    "no-var": "off",
  }
}
`
    );

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine lint", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Linting with ESLint",
      "No issues found",
    ]);
  });

  it("picks up .eslintrc file if there is one", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/lint-command");
    mockPackage.writeFile(
      "src/main.ts",
      `export var a = 1;
`
    );
    mockPackage.writeFile(
      ".eslintrc",
      `{
  "rules": {
    "no-var": "off"
  }
}
`
    );

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine lint", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Linting with ESLint",
      "No issues found",
    ]);
  });
});
