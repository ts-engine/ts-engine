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
}

type FixtureName =
  | "build-normal"
  | "build-react"
  | "build-syntax-error"
  | "build-type-error"
  | "run-normal"
  | "run-react"
  | "run-syntax-error"
  | "run-type-error"
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

  return {
    reset,
    runTse,
    runNode,
  };
};
