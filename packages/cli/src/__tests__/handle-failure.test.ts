import chalk from "chalk";
import yargs from "yargs";
import mockConsole from "jest-mock-console";
import { handleFailure } from "../handle-failure";

describe("handleFailure", () => {
  const argv = yargs.command("test", "", () => {});
  let restoreConsole = () => {};
  const originalProcessExit = process.exit;

  beforeEach(() => {
    restoreConsole = mockConsole();
    process.exit = jest.fn<never, any[]>();
  });

  afterEach(() => {
    restoreConsole();
    process.exit = originalProcessExit;
  });

  it("should print the formatted message with help if no error has occurred", () => {
    const message = "Missing arg!";
    handleFailure(message, undefined, argv);

    expect(console.error).toHaveBeenCalledWith(argv.help());
    expect(console.error).toHaveBeenCalledWith(chalk.redBright(message));
    expect(process.exit).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should print formatted error", () => {
    const error = new Error("Oops!");
    handleFailure(undefined, error, argv);

    expect(console.error).toHaveBeenCalledWith(chalk.redBright(error.stack));
    expect(process.exit).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
