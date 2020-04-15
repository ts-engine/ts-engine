import "./test-utils/extend-expect";
import { runCliCommand } from "./test-utils/run-cli-command";
import { getToolPackage } from "../utils/package";

describe("help option", () => {
  it("should help info", async () => {
    const runner = runCliCommand("yarn run ts-engine --help");

    // Expect tool to exit with correct status code
    const status = await runner.waitForStatusCode();
    expect(status).toBe(0);

    // Expect correct output
    const toolPackage = getToolPackage();
    expect(runner.stdoutLines).toContainInOrder([
      `${toolPackage.json.name} (${toolPackage.json.repository.url})`,
      toolPackage.json.description,
      "--version           Print version",
      "build               Build code using Rollup",
      "--watch             Watch for changes and build on changes",
      "lint                Lint with ESLint",
      "--fix               Auto fix fixable linting issues",
      "test                Run tests using Jest",
      "--<jest_options>    Accepts all Jest options except --config",
      "typecheck           Typecheck code with TypeScript",
      "--emit              Output type definition files",
    ]);
  });
});
