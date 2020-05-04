import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("build", () => {
  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  it("should build the code and generate source maps", async () => {
    const runner = runCliCommand("yarn run ts-engine build --node-app");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Built file is written to file system
    expect(await fileSystem.fileExists("dist/main.js")).toBe(true);

    // expect source map to be written to filesystem
    expect(await fileSystem.fileExists("dist/main.js.map")).toBe(true);

    // Expect build file to not be minified
    expect(
      await (await fileSystem.readFile("dist/main.js"))
        .startsWith(`'use strict';

var createMessage`)
    ).toBe(true);
  });

  it("should enforce --node-app or --library build to be specified", async () => {
    const runner = runCliCommand("yarn run ts-engine build");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit in failure
    expect(statusCode).toBe(1);

    // Printed info to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Must specify either --node-app or --library",
    ]);

    // File not written to file system
    expect(await fileSystem.fileExists("dist/main.js")).toBe(false);
  });

  it("should enforce only one of --node-app or --library to be specified", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine build --node-app --library"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit in failure
    expect(statusCode).toBe(1);

    // Printed info to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Cannot specify both --node-app and --library, please provide one",
    ]);

    // File not written to file system
    expect(await fileSystem.fileExists("dist/main.js")).toBe(false);
  });

  it("built app should work", async () => {
    const runner = runCliCommand("yarn run ts-engine build --node-app");

    // Wait for tool to complete
    await runner.waitForStatusCode();

    // Run the app
    const appRunner = runCliCommand("node dist/main.js");

    // Wait for app to complete
    const statusCode = await appRunner.waitForStatusCode();

    // Should exist successfully
    expect(statusCode).toBe(0);

    // Should have printed message
    expect(appRunner.stdoutLines).toContain("Hello Lee!");
  }, 10000);

  it("should build the code and minify it if in minify mode", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine build --node-app --minify"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Built file is written to file system
    expect(await fileSystem.fileExists("dist/main.js")).toBe(true);

    // Expect build file to be minified
    expect(
      (await fileSystem.readFile("dist/main.js")).startsWith(
        `"use strict";console`
      )
    ).toBe(true);
  });

  it("built app should work when minified", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine build --node-app --minify"
    );

    // Wait for tool to complete
    await runner.waitForStatusCode();

    // Run the app
    const appRunner = runCliCommand("node dist/main.js");

    // Wait for app to complete
    const statusCode = await appRunner.waitForStatusCode();

    // Should exist successfully
    expect(statusCode).toBe(0);

    // Should have printed message
    expect(appRunner.stdoutLines).toContain("Hello Lee!");
  }, 10000);
});
