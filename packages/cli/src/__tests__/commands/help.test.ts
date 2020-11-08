import { matchLog, runCli } from "../../test-utils";

it("should print help", async () => {
  const result = await runCli("--help");

  expect(matchLog(/Commands:/, result.stdout)).toBeTruthy();
  expect(result.exitCode).toBe(0);
});
