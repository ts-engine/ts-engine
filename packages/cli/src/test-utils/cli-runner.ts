import { cli } from "../cli";

interface RunCliResult {
  stdout: string[];
  stderr: string[];
  exitCode: number;
}

export const runCli = async (...args: string[]): Promise<RunCliResult> => {
  // capture stdout/stderr console logs
  const stderr: string[] = [];
  const stdout: string[] = [];

  const stderrSpy = jest.fn((message: any) => {
    stderr.push(message);
  });

  const stdoutSpy = jest.fn((message: any) => {
    stdout.push(message);
  });

  console.error = jest.fn(stderrSpy);
  console.info = jest.fn(stdoutSpy);
  console.log = jest.fn(stdoutSpy);
  console.warn = jest.fn(stdoutSpy);

  // capture exit code
  let exitCode = 0;

  // @ts-ignore
  process.exit = jest.fn((code: number) => (exitCode = code));

  // run cli
  cli(args);

  // let async code complete
  await new Promise((resolve) => setImmediate(resolve));

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
