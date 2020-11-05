import { runCli } from "../../test-utils/cli-runner";

it("should print help", async () => {
  const result = await runCli("--help");

  expect(result.stdout[0]).toMatch(/Commands:/);
});
