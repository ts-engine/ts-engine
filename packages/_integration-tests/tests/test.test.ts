import { createFixture } from "../test-utils/fixture";

const fixtures = {
  error: createFixture("test-error"),
  pass: createFixture("test-pass"),
  config: createFixture("test-config"),
  setupJs: createFixture("test-setup-js"),
  setupTs: createFixture("test-setup-ts"),
};

beforeEach(async () => {
  await fixtures.error.reset();
  await fixtures.pass.reset();
  await fixtures.config.reset();
  await fixtures.setupJs.reset();
  await fixtures.setupTs.reset();
});

it("should pass", async () => {
  const tseResult = fixtures.pass.runTse("test tests");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stderr).toMatch(/✓ should pass/);
});

it("should fail", async () => {
  const tseResult = fixtures.error.runTse("test tests");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/✕ should fail/);
});

it("should load jest.config.js", async () => {
  const tseResult = fixtures.config.runTse("test tests");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stderr).toMatch(/✓ should pass/);
  expect(tseResult.stdout).toMatch(/jest.config.js/);
});

it("should load jest.setup.js", async () => {
  const tseResult = fixtures.setupJs.runTse("test tests");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stderr).toMatch(/✓ should pass/);
  expect(tseResult.stdout).toMatch(/jest.setup.js/);
});

it("should load jest.setup.ts", async () => {
  const tseResult = fixtures.setupTs.runTse("test tests");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stderr).toMatch(/✓ should pass/);
  expect(tseResult.stdout).toMatch(/jest.setup.ts/);
});
