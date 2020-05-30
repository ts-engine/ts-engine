import { spawnSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import { runCliCommand } from "../run-cli-command";

describe("command-new-package", () => {
  const tsEngineCliVersion = spawnSync(
    "npm",
    ["show", "@ts-engine/cli", "version"],
    { encoding: "utf8" }
  ).stdout.replace("\n", "");
  const packageDir = path.resolve(process.cwd(), "temp");
  const packageJsonFilepath = path.resolve(packageDir, "package.json");
  const packageMainFilepath = path.resolve(packageDir, "src/main.ts");

  beforeEach(async () => {
    await fs.remove(packageDir);
  });

  afterEach(async () => {
    await fs.remove(packageDir);
  });

  it("should create a node app package", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine-new new-package --node-app --name temp"
    );

    expect(await runner.waitForStatusCode()).toBe(0);
    expect(await fs.readJson(packageJsonFilepath)).toEqual({
      name: "temp",
      version: "1.0.0",
      private: true,
      scripts: {
        build: "ts-engine build --node-app",
        lint: "ts-engine lint",
        start: "ts-engine start",
        test: "ts-engine test",
        typecheck: "ts-engine typecheck",
      },
      devDependencies: {
        "@ts-engine/cli": `^${tsEngineCliVersion}`,
      },
    });
    expect(await fs.readFile(packageMainFilepath, "utf8")).toBe(
      `console.log("hello world");
`
    );
  });

  it("should create a node app package (react)", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine-new new-package --node-app --name temp --react"
    );

    expect(await runner.waitForStatusCode()).toBe(0);
    expect(await fs.readJson(packageJsonFilepath)).toEqual({
      name: "temp",
      version: "1.0.0",
      private: true,
      scripts: {
        build: "ts-engine build --node-app --react",
        lint: "ts-engine lint --react",
        start: "ts-engine start --react",
        test: "ts-engine test --react",
        typecheck: "ts-engine typecheck",
      },
      devDependencies: {
        "@ts-engine/cli": `^${tsEngineCliVersion}`,
      },
    });
    expect(await fs.readFile(packageMainFilepath, "utf8")).toBe(
      `console.log("hello world");
`
    );
  });

  it("should create a library package", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine-new new-package --library --name temp"
    );

    expect(await runner.waitForStatusCode()).toBe(0);
    expect(await fs.readJson(packageJsonFilepath)).toEqual({
      name: "temp",
      version: "1.0.0",
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
        "@ts-engine/cli": `^${tsEngineCliVersion}`,
      },
    });
    expect(await fs.readFile(packageMainFilepath, "utf8")).toBe(
      `export const printHelloWorld = () => {
  console.log("hello world");
};
`
    );
  });

  it("should create a library package (react)", async () => {
    const runner = runCliCommand(
      "yarn run ts-engine-new new-package --library --name temp --react"
    );

    expect(await runner.waitForStatusCode()).toBe(0);
    expect(await fs.readJson(packageJsonFilepath)).toEqual({
      name: "temp",
      version: "1.0.0",
      private: false,
      main: "dist/main.cjs.js",
      module: "dist/main.esm.js",
      types: "dist/main.d.ts",
      sideEffects: false,
      scripts: {
        build: "ts-engine build --library --react",
        lint: "ts-engine lint --react",
        test: "ts-engine test --react",
        typecheck: "ts-engine typecheck --emit",
      },
      devDependencies: {
        "@ts-engine/cli": `^${tsEngineCliVersion}`,
      },
    });
    expect(await fs.readFile(packageMainFilepath, "utf8")).toBe(
      `export const printHelloWorld = () => {
  console.log("hello world");
};
`
    );
  });
});
