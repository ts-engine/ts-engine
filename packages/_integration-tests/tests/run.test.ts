import { createFixture } from "../test-utils/fixture";

const fixtures = {
  normal: createFixture("run-normal"),
  react: createFixture("run-react"),
  syntaxError: createFixture("run-syntax-error"),
  typeError: createFixture("run-type-error"),
};

beforeEach(async () => {
  await fixtures.normal.reset();
  await fixtures.react.reset();
  await fixtures.syntaxError.reset();
  await fixtures.typeError.reset();
});

it("should run", async () => {
  const tseResult = fixtures.normal.runTse("run src/index.ts");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(/Typechecked 1 files/);
  expect(tseResult.stdout).toMatch(/src\/index.ts -> dist\/index.cjs/);
  expect(tseResult.stdout).toMatch(/src\/index.ts -> dist\/index.js/);
  expect(tseResult.stdout).toMatch(/hello world/);
});

it("should run react", async () => {
  const tseResult = fixtures.react.runTse("run src/index.tsx");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(/Typechecked 1 files/);
  expect(tseResult.stdout).toMatch(/src\/index.tsx -> dist\/index.cjs/);
  expect(tseResult.stdout).toMatch(/src\/index.tsx -> dist\/index.js/);
  expect(tseResult.stdout).toMatch(/<span>hello world<\/span>/);
});

it("should report syntax errors", async () => {
  const tseResult = fixtures.syntaxError.runTse("run src/index.ts");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/Typechecked 1 files/);
  expect(tseResult.stderr).toMatch(/error/);
  expect(tseResult.stderr).toMatch(/TS1128/);
  expect(tseResult.stderr).toMatch(/Declaration or statement expected/);
});

it("should report type errors", async () => {
  const tseResult = fixtures.typeError.runTse("run src/index.ts");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/Typechecked 1 files/);
  expect(tseResult.stderr).toMatch(/error/);
  expect(tseResult.stderr).toMatch(/TS2322/);
  expect(tseResult.stderr).toMatch(
    /Type 'string' is not assignable to type 'number'/
  );
});

it.skip("should watch for changes", async () => {});
