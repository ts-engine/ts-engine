import path from "path";
import { spawnSync } from "child_process";
import fs from "fs-extra";
import { parseArgsStringToArgv } from "string-argv";
import stripAnsi from "strip-ansi";

interface RunCliResult {
  status: number;
  stdout: string;
  stderr: string;
}

interface RunToolOptions {
  name: string;
  cwd: string;
  args: string;
}

const runTool = (options: RunToolOptions) => {
  const result = spawnSync(options.name, parseArgsStringToArgv(options.args), {
    cwd: options.cwd,
    encoding: "utf8",
  });

  return {
    status: result.status,
    stdout: stripAnsi(result.stdout),
    stderr: stripAnsi(result.stderr),
  };
};

interface Fixture {
  reset: () => Promise<void>;
  runTse: (args: string) => RunCliResult;
  runNode: (args: string) => RunCliResult;
  writeFile: (filepath: string, content: string) => Promise<void>;
  removeFile: (filepath: string) => Promise<void>;
  readFile: (filepath: string) => Promise<string>;
}

type FixtureName =
  | "build-normal"
  | "build-minify"
  | "build-react"
  | "build-syntax-error"
  | "build-type-error"
  | "lint-error"
  | "lint-fix"
  | "lint-pass"
  | "lint-warning"
  | "lint-no-files"
  | "run-normal"
  | "run-minify"
  | "run-react"
  | "run-syntax-error"
  | "run-type-error"
  | "test-error"
  | "test-pass"
  | "test-config"
  | "test-setup-ts"
  | "test-setup-js"
  | "test-no-tests"
  | "version";

export const createFixture = (name: FixtureName): Fixture => {
  const dir = path.resolve("../_integration-fixtures/", name);
  const distDir = path.resolve(dir, "dist");

  const reset = async () => {
    await fs.remove(distDir);
  };

  const runTse = (args: string) => {
    return runTool({
      name: "yarn",
      cwd: dir,
      args: `run tse ${args}`,
    });
  };

  const runNode = (args: string) => {
    return runTool({
      name: "node",
      cwd: dir,
      args,
    });
  };

  const writeFile = async (filepath: string, content: string) => {
    await fs.writeFile(path.resolve(dir, filepath), content, {
      encoding: "utf8",
    });
  };

  const removeFile = async (filepath: string) => {
    await fs.remove(path.resolve(dir, filepath));
  };

  const readFile = async (filepath: string) => {
    return await fs.readFile(path.resolve(dir, filepath), { encoding: "utf8" });
  };

  return {
    reset,
    runTse,
    runNode,
    writeFile,
    removeFile,
    readFile,
  };
};
