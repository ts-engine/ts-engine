// @ts-ignore
/* eslint-disable jest/no-jest-import */
import jest from "jest";
import { createJestConfig } from "../config";

interface TestOptions {
  react: boolean;
}

export const test = (options: TestOptions) => {
  process.env.BABEL_ENV = "test";
  process.env.NODE_ENV = "test";

  const [, , , ...args] = process.argv;
  jest.run([
    ...args.filter((a) => !["--react"].includes(a)),
    "--config",
    JSON.stringify(
      createJestConfig({
        react: options.react,
      })
    ),
  ]);
};
