import { spawn } from "child_process";
import terminate from "terminate";
import stripAnsi from "strip-ansi";

export interface RunCliCommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  printLogs?: boolean;
}

export const runCliCommand = (
  command: string,
  options: RunCliCommandOptions = {
    cwd: process.cwd(),
    env: {},
    printLogs: false,
  }
) => {
  // Setup runner
  const [tool, ...args] = command.split(" ");
  const runner = spawn(tool, args, {
    cwd: options.cwd,
    stdio: "pipe",
    env: { ...process.env, ...(options?.env ?? {}) },
  });

  // Set readable encoding
  runner.stdout.setEncoding("utf8");
  runner.stderr.setEncoding("utf8");

  // Store stderr lines
  const stdoutLines: string[] = [];
  runner.stdout.on("data", (data: string) => {
    if (options.printLogs) {
      console.log(data);
    }
    stdoutLines.push(...stripAnsi(data).split("\n"));
  });

  // Store non-empty stderr lines
  const stderrLines: string[] = [];
  runner.stderr.on("data", (data: string) => {
    if (options.printLogs) {
      console.error(data);
    }
    stderrLines.push(...stripAnsi(data).split("\n"));
  });

  // Store status code
  let status: number | null = null;
  runner.on("close", (code) => {
    status = code;
  });

  // Wait until stdout prints line
  const waitUntilStdoutLine = (line: string): Promise<void> => {
    return new Promise((resolve) => {
      runner.stdout.on("data", (data: string) => {
        if (data.split("\n").includes(line)) {
          resolve();
        }
      });
    });
  };

  // Wait until stderr prints line
  const waitUntilStderrLine = (line: string): Promise<void> => {
    return new Promise((resolve) => {
      runner.stderr.on("data", (data: string) => {
        if (data.split("\n").includes(line)) {
          resolve();
        }
      });
    });
  };

  // Wait for tool to close and provide status code
  const waitForStatusCode = (): Promise<number> => {
    // Early escape if the tool has already exited as we store the status above
    if (status !== null) {
      return Promise.resolve(status);
    }

    return new Promise((resolve) => {
      runner.on("close", (code) => {
        resolve(code);
      });
    });
  };

  // Kill the process
  const kill = () => {
    terminate(runner.pid);
  };

  return {
    stdoutLines,
    stderrLines,
    waitUntilStdoutLine,
    waitUntilStderrLine,
    waitForStatusCode,
    kill,
  };
};
