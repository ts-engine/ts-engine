import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("start-watch", () => {
  let revertFileEdit: () => Promise<void>;

  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  afterEach(async () => {
    await revertFileEdit();
  });

  it("should rebuild on changes and rerun the app", async () => {
    const runner = runCliCommand("yarn run ts-engine start --watch");

    // Wait for app to have been run
    await runner.waitUntilStdoutLine("Hello Lee!");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "Hello Lee!",
    ]);

    // Built file is written to file system
    expect(await fileSystem.fileExists("dist/main.js")).toBe(true);

    // Clean up build
    await fileSystem.deleteDir("dist");

    // Update file
    revertFileEdit = await fileSystem.editFileTemporarily(
      "src/main.ts",
      `console.log("new content");`
    );

    // Wait for app to have been run again
    await runner.waitUntilStdoutLine("new content");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "Hello Lee!",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "new content",
    ]);

    // Kill watching tool
    runner.kill();
  });

  it("should rebuild on changes and rerun the app with bundled dependencies", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine start --watch --bundle-dependencies"
    );

    // Wait for app to have been run
    await runner.waitUntilStdoutLine("Hello Lee!");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "Hello Lee!",
    ]);

    // Built file is written to file system
    expect(await fileSystem.fileExists("dist/main.js")).toBe(true);

    // Clean up build
    await fileSystem.deleteDir("dist");

    // Update file
    revertFileEdit = await fileSystem.editFileTemporarily(
      "src/main.ts",
      `console.log("new content");`
    );

    // Wait for app to have been run again
    await runner.waitUntilStdoutLine("new content");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "Hello Lee!",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "new content",
    ]);

    // Kill watching tool
    runner.kill();
  });
});
