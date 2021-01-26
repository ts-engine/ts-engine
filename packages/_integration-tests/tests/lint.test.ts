import { createFixture } from "../test-utils/fixture";

const fixtures = {
  error: createFixture("lint-error"),
  pass: createFixture("lint-pass"),
  warning: createFixture("lint-warning"),
  fix: createFixture("lint-fix"),
  noFiles: createFixture("lint-no-files"),
};

beforeEach(async () => {
  await fixtures.error.reset();
  await fixtures.pass.reset();
  await fixtures.warning.reset();
  await fixtures.fix.reset();
  await fixtures.noFiles.reset();
});

afterEach(async () => {
  await fixtures.fix.removeFile("index.ts");
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

it("should fail when no files are found", async () => {
  const tseResult = fixtures.noFiles.runTse("lint src");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/No files found/);
});

it("should fix errors", async () => {
  await fixtures.fix.writeFile("index.ts", `export const one = 1;`);
  const tseResult = fixtures.fix.runTse("lint index.ts --fix");

  expect(tseResult.status).toBe(0);
  expect(await fixtures.fix.readFile("index.ts")).toBe(
    `export const one = 1;\n`
  );
}, 10000);
