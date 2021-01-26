import { createFixture } from "../test-utils/fixture";

const fixtures = {
  normal: createFixture("run-normal"),
  react: createFixture("run-react"),
  syntaxError: createFixture("run-syntax-error"),
  typeError: createFixture("run-type-error"),
  minify: createFixture("run-minify"),
};

beforeEach(async () => {
  await fixtures.normal.reset();
  await fixtures.minify.reset();
  await fixtures.react.reset();
  await fixtures.syntaxError.reset();
  await fixtures.typeError.reset();
});

it("should run", async () => {
  const tseResult = fixtures.normal.runTse("run src/index.ts");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(/Typechecked 1 files/);
  expect(tseResult.stdout).toMatch(/src\/index.ts -> dist\/index.js \(cjs,/);
  expect(tseResult.stdout).toMatch(/hello world/);
});

it("should report input file not found", async () => {
  const tseResult = fixtures.normal.runTse("build src/not-found.ts");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/src\/not-found\.ts not found\./);
});

it("should run react", async () => {
  const tseResult = fixtures.react.runTse("run src/index.tsx");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(/Typechecked 1 files/);
  expect(tseResult.stdout).toMatch(/src\/index.tsx -> dist\/index.js \(cjs,/);
  expect(tseResult.stdout).toMatch(/<span>hello world<\/span>/);
});

it("should report syntax errors", async () => {
  const tseResult = fixtures.syntaxError.runTse("run src/index.ts");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/SyntaxError:/);
  expect(tseResult.stderr).toMatch(/Unexpected token/);
  expect(tseResult.stderr).toMatch(/]]]/);
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

it("should skip typecheck", async () => {
  const tseResult = fixtures.typeError.runTse(
    "run src/index.ts --skip-typecheck"
  );

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(/src\/index.ts -> dist\/index.js \(cjs,/);
  expect(tseResult.stdout).toMatch(/1 \+ 2 = 3/);
});

it("should minify", async () => {
  const unminifiedResult = fixtures.minify.runTse("run src/index.ts");

  expect(unminifiedResult.status).toBe(0);
  expect(unminifiedResult.stdout).toMatch(
    /src\/index.ts -> dist\/index.js \(cjs,/
  );
  expect(unminifiedResult.stdout).toMatch(/minify me!/);

  const unminifiedLength = (await fixtures.minify.readFile("dist/index.js"))
    .length;

  const minifiedResult = fixtures.minify.runTse("run src/index.ts --minify");

  expect(minifiedResult.status).toBe(0);
  expect(minifiedResult.stdout).toMatch(
    /src\/index.ts -> dist\/index.js \(cjs,/
  );
  expect(unminifiedResult.stdout).toMatch(/minify me!/);

  const minifiedLength = (await fixtures.minify.readFile("dist/index.js"))
    .length;

  expect(unminifiedLength).toBeGreaterThan(minifiedLength);
}, 10000);

it.skip("should bundle", async () => {
  // TODO - see bundle test in build.test.ts. Need to solve that problem
  //        before writing this test
});

it.skip("should watch for changes", async () => {
  // TODO - implement me
});
