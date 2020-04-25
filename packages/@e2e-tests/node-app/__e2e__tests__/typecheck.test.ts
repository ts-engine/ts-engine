import { fileSystem, runCliCommand } from "@helpers/test-utils";

describe("typecheck", () => {
  it("exits successfully on well typed code base", async () => {
    const runner = runCliCommand("yarn run ts-engine typecheck");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed help to stdout
    expect(runner.stdoutLines).toContainInOrder(["✓ No issues found"]);
  });

  it("type declaration files when run in emit mode", async () => {
    const runner = runCliCommand("yarn run ts-engine typecheck --emit");

    // Wait for tool to complete
    const statusCode = await runner.waitForStatusCode();

    // Should exit successfully
    expect(statusCode).toBe(0);

    // Printed help to stdout
    expect(runner.stdoutLines).toContainInOrder(["✓ No issues found"]);

    // Files should be written
    expect(await fileSystem.readFile("dist/main.d.ts")).toMatchSnapshot(
      "main.d.ts"
    );
    expect(
      await fileSystem.readFile("dist/create-message.d.ts")
    ).toMatchSnapshot("create-message.d.ts");

    // Test files should not be written
    expect(
      await fileSystem.fileExists("dist/__tests__/create-message.d.ts")
    ).toBe(false);
  });
});
