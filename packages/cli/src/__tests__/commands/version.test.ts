import { runCli } from "../../test-utils";
import pkg from "../../../package.json";

it("should print the version", async () => {
  const result = await runCli("--version");

  expect(result.stdout).toContain(pkg.version);
  expect(result.exitCode).toBe(0);
});
