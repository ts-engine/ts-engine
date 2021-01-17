import { createFixture } from "../test-utils/fixture";

const fixtures = {
  error: createFixture("lint-error"),
  pass: createFixture("lint-pass"),
  warning: createFixture("lint-warning"),
};

beforeEach(async () => {
  await fixtures.error.reset();
  await fixtures.pass.reset();
  await fixtures.warning.reset();
});

it("should lint", async () => {
  const tseResult = fixtures.pass.runTse("lint src");

  expect(tseResult.status).toBe(0);
});

it("should report warnings", async () => {
  const tseResult = fixtures.warning.runTse("lint src");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stderr).toMatch(
    /warning  Unexpected var, use let or const instead  no-var/
  );
});

it("should report errors", async () => {
  const tseResult = fixtures.error.runTse("lint src");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(
    /error  Unexpected var, use let or const instead  no-var/
  );
});
