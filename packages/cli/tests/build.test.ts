import path from "path";
import fs from "fs-extra";
import { mockConsole } from "../test-utils/console";
import { createCli } from "../src/cli";

const consoleMock = mockConsole();

afterEach(async () => {
  consoleMock.reset();
});

it("should enforce build files are inside src/", async () => {
  const result = await createCli().run(["build", "index.ts"]);

  expect(result.code).toBe(1);
  expect(consoleMock.error).toBeCalledWith(
    "index.ts is not inside the src directory."
  );
});

it("should report input file not found", async () => {
  const result = await createCli().run(["build", "src/temp/index.ts"]);

  expect(result.code).toBe(1);
  expect(consoleMock.error).toBeCalledWith("src/temp/index.ts not found.");
});

it.skip("should build multiple files", async () => {});

it.skip("should build with relative imports", async () => {});

it.skip("should build JSX", async () => {});

it.skip("should build skip typecheck", async () => {});

it.skip("should build skip minify", async () => {});

it.skip("should bundle externals", async () => {});

it.skip("should report broken syntax", async () => {});

it.skip("should report a broken type", async () => {});
