import jest from "jest";
import { ConfigFactory } from "../config";

interface TestOptions {
  react: boolean;
}

export const test = (options: TestOptions) => {
  process.env.BABEL_ENV = "test";
  process.env.NODE_ENV = "test";

  const configFactory = new ConfigFactory({
    react: options.react,
  });

  const [, , , ...args] = process.argv;

  jest.run([
    ...args.filter((a) => a !== "--react"),
    "--config",
    JSON.stringify(configFactory.createJestConfig()),
  ]);
};
