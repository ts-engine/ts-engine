import "./test-utils/extend-expect";
import { runCliCommand } from "./test-utils/run-cli-command";
import { createMockPackage, MockPackage } from "./test-utils/mock-package";

describe("build command", () => {
  let mockPackage: MockPackage;

  beforeEach(async () => {
    if (mockPackage) {
      await mockPackage.cleanup();
    }
  });

  afterAll(async () => {
    await mockPackage.cleanup();
  });

  it("typechecks code", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/typecheck-command");
    mockPackage.writeFile(
      "src/main.ts",
      "export const add = (a: number, b: number): number => a + b;"
    );

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine typecheck", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Typechecking code with TypeScript",
      "No issues found",
    ]);
  });

  it("reports type errors", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/typecheck-command");
    mockPackage.writeFile(
      "src/main.ts",
      "export const add = (a: number, b: string): number => a + b;"
    );

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine typecheck", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(1);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Typechecking code with TypeScript",
    ]);
    expect(runner.stderrLines).toContainInOrder([
      "Found 1 type errors:",
      "src/main.ts",
      "(1,54): Type 'string' is not assignable to type 'number'.",
    ]);
  });

  it("outputs type definitions", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/typecheck-command");
    mockPackage.writeFile(
      "src/main.ts",
      "export const add = (a: number, b: number): number => a + b;"
    );

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine typecheck --emit", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Typechecking code with TypeScript",
      "Writing type definitions to dist",
      "No issues found",
    ]);

    // Expect types to be written
    const typeDefContents = await mockPackage.readFile("dist/main.d.ts");
    expect(typeDefContents.trimEnd()).toBe(
      "export declare const add: (a: number, b: number) => number;"
    );
  });
});
