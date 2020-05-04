import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("start", () => {
  beforeEach(async () => {
    await fileSystem.deleteDir("dist");
  });

  it("should build and run the node app", async () => {
    const runner = runCliCommand("yarn run ts-engine start");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Starting app...",
      "Hello Lee!",
    ]);

    // Expect build file to not be minified
    expect(
      await (await fileSystem.readFile("dist/main.js"))
        .startsWith(`'use strict';

var createMessage`)
    ).toBe(true);
  });

  it("should build and run the node app with bundled dependencies", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine start --bundle-dependencies"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Starting app...",
      "Hello Lee!",
    ]);
  });

  it("should build and minify and run the node app in minified mode", async () => {
    const runner = runCliCommand("yarn run ts-engine start --minify");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed info to stdout
    expect(runner.stdoutLines).toContainInOrder([
      "Starting app...",
      "Hello Lee!",
    ]);

    // Expect build file to be minified
    expect(
      (await fileSystem.readFile("dist/main.js")).startsWith(
        `"use strict";console`
      )
    ).toBe(true);
  });
});
