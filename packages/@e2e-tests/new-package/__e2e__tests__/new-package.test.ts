import { fileSystem, runCliCommand } from "@helpers/test-utils";
import packageJson from "../package.json";

describe("new-package", () => {
  beforeEach(async () => {
    await fileSystem.deleteDir("new-package");
  });

  it("should create a new node app package", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --node-app --license MIT --name new-package"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Built file is written to file system
    expect(await fileSystem.fileExists("new-package/package.json")).toBe(true);
    expect(await fileSystem.fileExists("new-package/src/main.ts")).toBe(true);

    // Package filled in correctly
    expect(
      JSON.parse(await fileSystem.readFile("new-package/package.json"))
    ).toMatchObject({
      name: "new-package",
      version: "1.0.0",
      license: "MIT",
      private: true,
      scripts: {
        build: "ts-engine build --node-app",
        lint: "ts-engine lint",
        test: "ts-engine test",
        typecheck: "ts-engine typecheck",
      },
      devDependencies: {
        "@ts-engine/cli": `^${packageJson.version}`,
      },
    });

    // source code correct
    expect(await fileSystem.readFile("new-package/src/main.ts")).toBe(
      `console.log("hello world");
`
    );
  });

  it("should create a new library package", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --library --license MIT --name new-package"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // New package files are present
    expect(await fileSystem.fileExists("new-package/package.json")).toBe(true);
    expect(await fileSystem.fileExists("new-package/src/main.ts")).toBe(true);

    // Package filled in correctly
    expect(
      JSON.parse(await fileSystem.readFile("new-package/package.json"))
    ).toMatchObject({
      name: "new-package",
      version: "1.0.0",
      license: "MIT",
      private: false,
      main: "dist/main.cjs.js",
      module: "dist/main.esm.js",
      types: "dist/main.d.ts",
      sideEffects: false,
      scripts: {
        build: "ts-engine build --library",
        lint: "ts-engine lint",
        test: "ts-engine test",
        typecheck: "ts-engine typecheck --emit",
      },
      devDependencies: {
        "@ts-engine/cli": `^${packageJson.version}`,
      },
    });

    // source code correct
    expect(await fileSystem.readFile("new-package/src/main.ts")).toBe(
      `export const printHelloWorld = () => {
  console.log("hello world");
};
`
    );
  });

  it("should create a new package with scoped name in correct folder", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --library --name @new/new-package"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // New package files are present
    expect(await fileSystem.fileExists("new-package/package.json")).toBe(true);
    expect(await fileSystem.fileExists("new-package/src/main.ts")).toBe(true);

    // Package filled in correctly
    expect(
      JSON.parse(await fileSystem.readFile("new-package/package.json"))
    ).toMatchObject({
      name: "@new/new-package",
      version: "1.0.0",
      license: "UNLICENSED",
      private: false,
      scripts: {
        build: "ts-engine build --library",
        lint: "ts-engine lint",
        test: "ts-engine test",
        typecheck: "ts-engine typecheck --emit",
      },
      devDependencies: {
        "@ts-engine/cli": `^${packageJson.version}`,
      },
    });

    // source code correct
    expect(await fileSystem.readFile("new-package/src/main.ts")).toBe(
      `export const printHelloWorld = () => {
  console.log("hello world");
};
`
    );
  });

  it("should default license if not provided", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --library --name new-package"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // New package files are present
    expect(await fileSystem.fileExists("new-package/package.json")).toBe(true);
    expect(await fileSystem.fileExists("new-package/src/main.ts")).toBe(true);

    // Package filled in correctly
    expect(
      JSON.parse(await fileSystem.readFile("new-package/package.json"))
    ).toMatchObject({
      name: "new-package",
      version: "1.0.0",
      license: "UNLICENSED",
      private: false,
      scripts: {
        build: "ts-engine build --library",
        lint: "ts-engine lint",
        test: "ts-engine test",
        typecheck: "ts-engine typecheck --emit",
      },
      devDependencies: {
        "@ts-engine/cli": `^${packageJson.version}`,
      },
    });
  });

  it("should enforce --node-app or --library to be specified", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --licence MIT --name new-package"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit in failure
    expect(statusCode).toBe(1);

    // Printed info to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Must specify either --node-app or --library",
    ]);

    // Files not written to file system
    expect(await fileSystem.fileExists("new-package/package.json")).toBe(false);
    expect(await fileSystem.fileExists("new-package/src/main.ts")).toBe(false);
  });

  it("should enforce only one of --node-app or --library to be specified", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --node-app --library --licence MIT --name new-package"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit in failure
    expect(statusCode).toBe(1);

    // Printed info to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Cannot specify both --node-app and --library, please provide one",
    ]);

    // Files not written to file system
    expect(await fileSystem.fileExists("new-package/package.json")).toBe(false);
    expect(await fileSystem.fileExists("new-package/src/main.ts")).toBe(false);
  });

  it("should enforce --name to be specified", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --node-app --licence MIT"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit in failure
    expect(statusCode).toBe(1);

    // Printed info to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Missing required option --name",
    ]);

    // Files not written to file system
    expect(await fileSystem.fileExists("new-package/package.json")).toBe(false);
    expect(await fileSystem.fileExists("new-package/src/main.ts")).toBe(false);
  });

  it("should inform the user if the folder already exists and not create the package", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --library --name existing-package"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(1);

    // Should inform the user
    // Printed info to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Folder existing-package already exists",
    ]);

    // Files not written to file system
    expect(await fileSystem.fileExists("existing-package/package.json")).toBe(
      false
    );
    expect(await fileSystem.fileExists("existing-package/src/main.ts")).toBe(
      false
    );
  });

  it("should inform the user if the folder already exists and not create the package (scoped name)", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --library --name @new/existing-package"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(1);

    // Should inform the user
    // Printed info to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Folder existing-package already exists",
    ]);

    // Files not written to file system
    expect(await fileSystem.fileExists("existing-package/package.json")).toBe(
      false
    );
    expect(await fileSystem.fileExists("existing-package/src/main.ts")).toBe(
      false
    );
  });

  it("should enforce valid package name", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine new-package --node-app --name 123"
    );

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit in failure
    expect(statusCode).toBe(1);

    // Printed info to stderr
    expect(runner.stderrLines).toContainInOrder([
      "Invalid package name provided",
    ]);

    // Files not written to file system
    expect(await fileSystem.fileExists("new-package/package.json")).toBe(false);
    expect(await fileSystem.fileExists("new-package/src/main.ts")).toBe(false);
  });
});
