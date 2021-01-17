import { createFixture } from "../test-utils/fixture";
import packageJson from "../../cli/package.json";

const fixtures = {
  version: createFixture("version"),
};

beforeEach(async () => {
  await fixtures.version.reset();
});

it("should build", async () => {
  const tseResult = fixtures.version.runTse("version");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(packageJson.version);
});
