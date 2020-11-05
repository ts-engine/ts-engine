import { runCli } from "../../test-utils/cli-runner";
import pkg from "../../../package.json";

it("should print the version", async () => {
  const result = await runCli("--version");

  expect(result.stdout).toContain(pkg.version);
});
