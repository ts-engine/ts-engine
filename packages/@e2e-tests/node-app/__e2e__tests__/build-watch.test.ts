import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("build-watch", () => {
  let revertFileEdit: () => Promise<void>;

  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  afterEach(async () => {
    await revertFileEdit();
  });

  it("should rebuild on changes", async () => {
    const runner = runCliCommand("yarn run ts-engine build --node-app --watch");

    // Wait for tool to start waiting for changes
    await runner.waitUntilStdoutLine("Watching for changes...");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Written to dist/main.js",
      "Watching for changes...",
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

    // Wait for tool to start waiting for changes again
    await runner.waitUntilStdoutLine("Watching for changes...");

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Written to dist/main.js",
      "Watching for changes...",
      "Written to dist/main.js",
      "Watching for changes...",
    ]);

    // Built file is written to file system
    expect(
      (await fileSystem.readFile("dist/main.js")).includes("new content")
    ).toBe(true);

    // Kill watching tool
    runner.kill();
  });
});
