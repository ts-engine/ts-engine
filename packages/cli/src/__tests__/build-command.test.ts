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

  it("builds code", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/build-command");
    await mockPackage.writeFile("src/main.ts", `console.log("Hello world");`);

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine build", {
      cwd: mockPackage.dir,
    });

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
    ]);

    // Expect file to be written
    const builtFileContent = await mockPackage.readFile("dist/main.js");
    expect(builtFileContent).toBe(`"use strict";console.log("Hello world");
`);
  });

  it("watches for code changes and rebuilds when --watch is present", async () => {
    // Create mock package
    mockPackage = await createMockPackage("@temp/build-command");
    await mockPackage.writeFile("src/main.ts", `console.log("Hello world");`);

    // Run the tool
    const runner = runCliCommand("yarn run ts-engine build --watch", {
      cwd: mockPackage.dir,
    });

    // Wait until its watching
    await runner.waitUntilStdoutLine("Watching for changes...");

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
    ]);

    // Expect file to be written
    const builtFileContent = await mockPackage.readFile("dist/main.js");
    expect(builtFileContent).toBe(`"use strict";console.log("Hello world");
`);

    // Update file
    await mockPackage.writeFile("src/main.ts", `console.log("Goodbye world");`);

    // Wait until its watching again
    await runner.waitUntilStdoutLine("Watching for changes...");

    // Expect correct output
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
    ]);

    // Expect file to be written
    const newBuildFileContent = await mockPackage.readFile("dist/main.js");
    expect(newBuildFileContent).toBe(`"use strict";console.log("Goodbye world");
`);

    await runner.kill();
  });
});
