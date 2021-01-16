import path from "path";
import fs from "fs-extra";
import { spawnSync, SpawnSyncReturns } from "child_process";
import { mockConsole } from "../test-utils/console";
import { createCli } from "../src/cli";

const consoleMock = mockConsole();
const srcDir = path.resolve(process.cwd(), "src/temp/build");
const distDir = path.resolve(process.cwd(), "dist/temp/build");

const writeSrcFile = async (filepath: string, content: string) => {
  await fs.writeFile(path.resolve(srcDir, filepath), content);
};

const executeDistFile = (filepath: string): SpawnSyncReturns<string> => {
  return spawnSync("node", [`${distDir}/${filepath}`], {
    encoding: "utf8",
  });
};

beforeEach(async () => {
  await fs.ensureDir(srcDir);
});

afterEach(async () => {
  consoleMock.reset();
  await fs.remove(srcDir);
});

it("should enforce build files are inside src/", async () => {
  const result = await createCli().run(["build", "outside-src.ts"]);

  expect(result.code).toBe(1);
  expect(consoleMock.error).toBeCalledWith(
    "outside-src.ts is not inside the src directory."
  );
});

it("should report input file not found", async () => {
  const result = await createCli().run([
    "build",
    "src/temp/build/not-found.ts",
  ]);

  expect(result.code).toBe(1);
  expect(consoleMock.error).toBeCalledWith(
    "src/temp/build/not-found.ts not found."
  );
});

it("should build given files", async () => {
  await writeSrcFile("index.ts", `console.log("hello world!");`);

  const result = await createCli().run(["build", "src/temp/build/index.ts"]);

  expect(result.code).toBe(0);
  expect(await fs.pathExists(path.resolve(distDir, "index.js"))).toBe(true);
  expect(await fs.pathExists(path.resolve(distDir, "index.cjs"))).toBe(true);

  const nodeResult = executeDistFile("index.cjs");

  expect(nodeResult.status).toBe(0);
  expect(nodeResult.output).toContain("hello world!\n");
}, 10000);

it("should build with relative imports", async () => {
  await writeSrcFile(
    "index.ts",
    `import {output} from "./output";\nconsole.log(output);`
  );
  await writeSrcFile("output.ts", `export const output = "hello world!";`);

  const result = await createCli().run(["build", "src/temp/build/index.ts"]);

  expect(result.code).toBe(0);
  expect(await fs.pathExists(path.resolve(distDir, "index.js"))).toBe(true);
  expect(await fs.pathExists(path.resolve(distDir, "index.cjs"))).toBe(true);

  const nodeResult = executeDistFile("index.cjs");

  expect(nodeResult.status).toBe(0);
  expect(nodeResult.output).toContain("hello world!\n");
}, 10000);

it("should build JSX", async () => {
  await writeSrcFile(
    "index.tsx",
    `import React from "react";\nimport {renderToStaticMarkup} from "react-dom/server";\nconsole.log(renderToStaticMarkup(<div>hello world!</div>));`
  );

  const result = await createCli().run(["build", "src/temp/build/index.tsx"]);

  expect(result.code).toBe(0);
  expect(await fs.pathExists(path.resolve(distDir, "index.js"))).toBe(true);
  expect(await fs.pathExists(path.resolve(distDir, "index.cjs"))).toBe(true);

  const nodeResult = executeDistFile("index.cjs");

  expect(nodeResult.status).toBe(0);
  expect(nodeResult.output).toContain("<div>hello world!</div>\n");
}, 10000);

it("should skip typecheck", async () => {
  await writeSrcFile("index.ts", `export const one: number = "1";`);

  const result = await createCli().run([
    "build",
    "src/temp/build/index.ts",
    "--skip-typecheck",
  ]);

  expect(result.code).toBe(0);
}, 10000);

it("should minify", async () => {
  await writeSrcFile("index.ts", `const abc = 1; console.log(abc);`);

  const result = await createCli().run(["build", "src/temp/build/index.ts"]);
  const { length } = await fs.readFile(path.resolve(distDir, "index.cjs"));

  const minifiedResult = await createCli().run([
    "build",
    "src/temp/build/index.ts",
    "--minify",
  ]);
  const { length: minifiedLength } = await fs.readFile(
    path.resolve(distDir, "index.cjs")
  );

  expect(result.code).toBe(0);
  expect(minifiedResult.code).toBe(0);
  expect(length).toBeGreaterThan(minifiedLength);
}, 15000);

it("should report broken syntax", async () => {
  await writeSrcFile("index.ts", `]]]`);

  const result = await createCli().run(["build", "src/temp/build/index.ts"]);

  expect(result.code).toBe(1);
  expect(consoleMock.error.mock.calls[0][0]).toMatch(
    /Declaration or statement expected/
  );
});

it("should report a broken type", async () => {
  await writeSrcFile("index.ts", `export const one: number = "1";`);

  const result = await createCli().run(["build", "src/temp/build/index.ts"]);

  expect(result.code).toBe(1);
  expect(consoleMock.error.mock.calls[0][0]).toMatch(
    /Type 'string' is not assignable to type 'number'/
  );
});
