import { runCliCommand } from "@e2e-tests/test-utils";
import packageJson from "@ts-engine/cli/package.json";

describe("--help", () => {
  it("should print help", async () => {
    const runner = runCliCommand("yarn run ts-engine --help");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed help to stdout
    expect(runner.stdoutLines).toContainInOrder([
      `${packageJson.name} (${packageJson.repository.url})`,
      `${packageJson.description}`,
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
