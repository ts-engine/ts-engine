import { parseArgsStringToArgv } from "string-argv";
import { cli } from "./cli";

export const testConsole = {
  log: console.debug,
};

interface RunCliResult {
  stdout: string[];
  stderr: string[];
  exitCode: number;
}

export const runCli = async (args: string): Promise<RunCliResult> => {
  // capture stdout/stderr console logs
  const stderr: string[] = [];
  const stdout: string[] = [];

  const stderrSpy = jest.fn((message: any) => {
    if (message) {
      stderr.push(message.toString());
    }
  });

  const stdoutSpy = jest.fn((message: any) => {
    if (message) {
      stdout.push(message.toString());
    }
  });

  jest.spyOn(console, "error").mockImplementation(stderrSpy);
  jest.spyOn(console, "info").mockImplementation(stdoutSpy);
  jest.spyOn(console, "log").mockImplementation(stdoutSpy);
  jest.spyOn(console, "warn").mockImplementation(stdoutSpy);

  // capture exit code
  let exitCode = 0;
  const exitPromise = new Promise((resolve) => {
    // @ts-ignore
    jest.spyOn(process, "exit").mockImplementation((code: number) => {
      // only assign if the code is still 0 (falsy) as
      // process.exit can only be called once
      exitCode = exitCode || code;
      resolve();
    });
  });

  // run cli
  cli(parseArgsStringToArgv(args));

  // let async code complete
  await exitPromise;

  // reset mocks
  (console.error as jest.Mock).mockRestore();
  (console.info as jest.Mock).mockRestore();
  (console.log as jest.Mock).mockRestore();
  (console.warn as jest.Mock).mockRestore();

  // @ts-ignore
  (process.exit as jest.Mock).mockRestore();

  // collate results
  return {
    stderr,
    stdout,
    exitCode,
  };
};

export const matchLog = (regex: RegExp | string, logs: string[]) => {
  return logs.find((log) => log.match(regex));
};
