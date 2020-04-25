import { runCliCommand } from "@helpers/test-utils";
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
      "--version                Print version",
      "build                    Build code using Rollup",
      "--watch                  Watch for changes and build on changes",
      "--bundle-dependencies    Compile dependencies into final output file",
      "lint                     Lint with ESLint",
      "--fix                    Auto fix fixable linting issues",
      "start                    Build package as a Node.js application and run it",
      "--watch                  Build and run the app on changes",
      "--bundle-dependencies    Compile dependencies into final output file",
      "--args                   Provide arguments to be forwarded onto the Node.js application",
      "test                     Run tests using Jest",
      "--<jest_options>         Accepts all Jest options except --config",
      "typecheck                Typecheck code with TypeScript",
      "--emit                   Output type definition files",
    ]);
  });
});
