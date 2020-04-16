import { fileSystem, runCliCommand } from "@e2e-tests/test-utils";

describe("build-watch", () => {
  let revertFileEdit: () => Promise<void>;

  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  afterEach(async () => {
    await revertFileEdit();
  });

  it("should rebuild on changes", async () => {
    const runner = runCliCommand("yarn run build --watch");

    // Wait for tool to start waiting for changes
    await runner.waitUntilStdoutLine("Watching for changes...");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
    ]);

    // Built file is written to file system
    expect(await fileSystem.readFile("dist/main.js")).toMatchSnapshot(
      "original"
    );

    // Update file
    revertFileEdit = await fileSystem.editFileTemporarily(
      "src/main.ts",
      `console.log("new content");`
    );

    // Wait for tool to start waiting for changes again
    await runner.waitUntilStdoutLine("Watching for changes...");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
      "src/main.ts ⮕  dist/main.js",
      "Watching for changes...",
    ]);

    // Built file is written to file system
    expect(await fileSystem.readFile("dist/main.js")).toMatchSnapshot(
      "updated"
    );

    // Kill watching tool
    runner.kill();
  });
});
