import { createFixture } from "../test-utils/fixture";

const fixtures = {
  normal: createFixture("build-normal"),
  react: createFixture("build-react"),
  syntaxError: createFixture("build-syntax-error"),
  typeError: createFixture("build-type-error"),
};

beforeEach(async () => {
  await fixtures.normal.reset();
  await fixtures.react.reset();
  await fixtures.syntaxError.reset();
  await fixtures.typeError.reset();
});

it("should build", async () => {
  const tseResult = fixtures.normal.runTse("build src/index.ts");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(/Typechecked 1 files/);
  expect(tseResult.stdout).toMatch(/src\/index.ts -> dist\/index.cjs/);
  expect(tseResult.stdout).toMatch(/src\/index.ts -> dist\/index.js/);

  const nodeResult = fixtures.normal.runNode("dist/index.cjs");

  expect(nodeResult.status).toBe(0);
  expect(nodeResult.stdout).toMatch(/hello world/);
});

it("should build react", async () => {
  const tseResult = fixtures.react.runTse("build src/index.tsx");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(/Typechecked 1 files/);
  expect(tseResult.stdout).toMatch(/src\/index.tsx -> dist\/index.cjs/);
  expect(tseResult.stdout).toMatch(/src\/index.tsx -> dist\/index.js/);

  const nodeResult = fixtures.react.runNode("dist/index.cjs");

  expect(nodeResult.status).toBe(0);
  expect(nodeResult.stdout).toMatch(/<span>hello world<\/span>/);
});

it("should report syntax errors", async () => {
  const tseResult = fixtures.syntaxError.runTse("build src/index.ts");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/Typechecked 1 files/);
  expect(tseResult.stderr).toMatch(/error/);
  expect(tseResult.stderr).toMatch(/TS1128/);
  expect(tseResult.stderr).toMatch(/Declaration or statement expected/);
});

it("should report type errors", async () => {
  const tseResult = fixtures.typeError.runTse("build src/index.ts");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/Typechecked 1 files/);
  expect(tseResult.stderr).toMatch(/error/);
  expect(tseResult.stderr).toMatch(/TS2322/);
  expect(tseResult.stderr).toMatch(
    /Type 'string' is not assignable to type 'number'/
  );
});

it.skip("should watch for changes", async () => {});
