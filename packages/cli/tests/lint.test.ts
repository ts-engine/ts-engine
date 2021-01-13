import path from "path";
import fs from "fs-extra";
import { mockConsole } from "../test-utils/console";
import { createCli } from "../src/cli";

const errorFileContent = `/*eslint no-var: "error"*/

export var one = 1;
`;
const errorFilepath = path.resolve(process.cwd(), "temp/lint-error.ts");
const warnFileContent = `/*eslint no-var: "warn"*/

export var one = 1;
`;
const warnFilepath = path.resolve(process.cwd(), "temp/lint-warn.ts");
const fixableFileContent = `export const one = 1;`;
const fixableFilepath = path.resolve(process.cwd(), "temp/lint-fixable.ts");

const consoleMock = mockConsole();

afterEach(async () => {
  consoleMock.reset();

  await fs.remove(errorFilepath);
  await fs.remove(warnFilepath);
  await fs.remove(fixableFilepath);
});

beforeEach(async () => {
  await fs.writeFile(errorFilepath, errorFileContent);
  await fs.writeFile(warnFilepath, warnFileContent);
  await fs.writeFile(fixableFilepath, fixableFileContent);
});

it("should lint files and pass", async () => {
  const result = await createCli().run(["lint", "src"]);

  expect(result.code).toBe(0);
});

it("should lint files and fail", async () => {
  const result = await createCli().run(["lint", "temp/lint-error.ts"]);

  expect(result.code).toBe(1);
  expect(
    consoleMock.error.mock.calls[0][0].includes(
      "Unexpected var, use let or const instead"
    )
  ).toBe(true);
});

it("should lint files and warn", async () => {
  const result = await createCli().run(["lint", "temp/lint-warn.ts"]);

  expect(result.code).toBe(0);
  expect(
    consoleMock.warn.mock.calls[0][0].includes(
      "Unexpected var, use let or const instead"
    )
  ).toBe(true);
});

it("should fail if no files are found", async () => {
  const result = await createCli().run(["lint", "no-src"]);

  expect(result.code).toBe(1);
  expect(consoleMock.error).toHaveBeenCalledWith("No files found.");
});

it("should fix fixable issues", async () => {
  const result = await createCli().run([
    "lint",
    "temp/lint-fixable.ts",
    "--fix",
  ]);

  expect(result.code).toBe(0);
});
