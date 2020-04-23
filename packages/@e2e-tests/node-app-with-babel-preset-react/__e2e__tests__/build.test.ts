import path from "path";
import os from "os";
import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("build", () => {
  const tempDir = path.resolve(
    os.homedir(),
    ".ts-engine/temp/node-app-with-babel-preset-react/dist"
  );
  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
    await fileSystem.ensureDir(tempDir);
    await fileSystem.deleteDir(tempDir);
  });

  afterEach(async () => {
    await fileSystem.deleteDir(tempDir);
  });

  it("should build the code containing JSX", async () => {
    const runner = runCliCommand("yarn run ts-engine build --node-app");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Building code with Rollup",
      "src/main.ts ⮕  dist/main.js",
    ]);

    // Built file is written to file system
    expect(await fileSystem.fileExists("dist/main.js")).toBe(true);
  });

  it("built app should work without node_modules as externals should be bundled in", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine build --node-app --bundle-dependencies"
    );

    // Wait for tool to complete
    await runner.waitForStatusCode();

    // Copy app to dir without node_modules access
    await fileSystem.copyDir("dist", tempDir);

    // Run the app in temp dir
    const appRunner = runCliCommand(`node ${path.resolve(tempDir, "main.js")}`);

    // Wait for app to complete
    const statusCode = await appRunner.waitForStatusCode();

    // Should exist successfully
    expect(statusCode).toBe(0);

    // Should have printed message
    expect(appRunner.stdoutLines).toContain("<span>hello world</span>");
  }, 10000);
});
