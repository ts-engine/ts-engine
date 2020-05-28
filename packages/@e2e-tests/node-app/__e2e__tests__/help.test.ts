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
      "--node-app               Outputs a Node.js application",
      "--library                Outputs a JavaScript library",
      "--bundle-dependencies    Compile dependencies into final output file",
      "--minify                 Minify the compiled output",
      "--config-react           Include React babel config",
      "new-package              Create a new package",
      "--node-app               Outputs a Node.js application",
      "--library                Outputs a JavaScript library",
      "--license                The new package's license",
      "--name                   The new package's name",
      "lint                     Lint with ESLint",
      "--fix                    Auto fix fixable linting issues",
      "start                    Build package as a Node.js application and run it",
      "--watch                  Build and run the app on changes",
      "--bundle-dependencies    Compile dependencies into final output file",
      "--args                   Provide arguments to be forwarded onto the Node.js application",
      "--minify                 Minify the compiled output",
      "--config-react           Include React babel config",
      "test                     Run tests using Jest",
      "--<jest_options>         Accepts all Jest options except --config",
      "typecheck                Typecheck code with TypeScript",
      "--emit                   Output type definition files",
    ]);
  });
});
