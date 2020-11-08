import { runCli } from "../../test-utils";

it("should print help", async () => {
  const result = await runCli("--help");

  expect(result.stdout[0]).toMatch(/Commands:/);
  expect(result.exitCode).toBe(0);
});
