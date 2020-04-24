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
    await runner.waitUntilStdoutLine("starting server");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "starting server",
    ]);

    // Built file is written to file system
    expect(await fileSystem.fileExists("dist/main.js")).toBe(true);

    // Clean up build
    await fileSystem.deleteDir("dist");

    // Update file
    revertFileEdit = await fileSystem.editFileTemporarily(
      "src/main.ts",
      `console.log("goodbye world");`
    );

    // Wait for app to have been run again
    await runner.waitUntilStdoutLine("goodbye world");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "starting server",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "goodbye world",
    ]);

    // Kill watching tool
    runner.kill();
  });
});
