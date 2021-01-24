import { createFixture } from "../test-utils/fixture";

const fixtures = {
  normal: createFixture("build-normal"),
  react: createFixture("build-react"),
  syntaxError: createFixture("build-syntax-error"),
  typeError: createFixture("build-type-error"),
  minify: createFixture("build-minify"),
  bundle: createFixture("build-bundle"),
};

beforeEach(async () => {
  await fixtures.normal.reset();
  await fixtures.react.reset();
  await fixtures.syntaxError.reset();
  await fixtures.minify.reset();
  await fixtures.bundle.reset();
});

it("should build all input files", async () => {
  const tseResult = fixtures.normal.runTse("build src/hello.ts src/foo.ts");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(/Typechecked 4 files/);
  expect(tseResult.stdout).toMatch(/src\/hello.ts -> dist\/hello.cjs/);
  expect(tseResult.stdout).toMatch(/src\/hello.ts -> dist\/hello.js/);
  expect(tseResult.stdout).toMatch(/src\/foo.ts -> dist\/foo.cjs/);
  expect(tseResult.stdout).toMatch(/src\/foo.ts -> dist\/foo.js/);

  const helloResult = fixtures.normal.runNode("dist/hello.cjs");

  expect(helloResult.status).toBe(0);
  expect(helloResult.stdout).toMatch(/hello world/);

  const fooResult = fixtures.normal.runNode("dist/foo.cjs");

  expect(fooResult.status).toBe(0);
  expect(fooResult.stdout).toMatch(/foo bar/);
});

it("should report input file not found", async () => {
  const tseResult = fixtures.normal.runTse("build src/not-found.ts");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/src\/not-found\.ts not found\./);
});

it("should build react", async () => {
  const tseResult = fixtures.react.runTse("build src/index.tsx");

  expect(tseResult.status).toBe(0);
  expect(tseResult.stdout).toMatch(/Typechecked 1 files/);

  const nodeResult = fixtures.react.runNode("dist/index.cjs");

  expect(nodeResult.status).toBe(0);
  expect(nodeResult.stdout).toMatch(/<span>hello world<\/span>/);
});

it("should report syntax errors", async () => {
  const tseResult = fixtures.syntaxError.runTse("build src/index.ts");

  expect(tseResult.status).toBe(1);
  expect(tseResult.stderr).toMatch(/SyntaxError:/);
  expect(tseResult.stderr).toMatch(/Unexpected token/);
  expect(tseResult.stderr).toMatch(/]]]/);
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

it("should skip typecheck", async () => {
  const tseResult = fixtures.typeError.runTse(
    "build src/index.ts --skip-typecheck"
  );

  expect(tseResult.status).toBe(0);
});

it("should minify", async () => {
  const unminifiedResult = fixtures.minify.runTse("build src/index.ts");

  expect(unminifiedResult.status).toBe(0);

  const unminifiedLength = (await fixtures.minify.readFile("dist/index.js"))
    .length;

  const minifiedResult = fixtures.minify.runTse("build src/index.ts --minify");

  expect(minifiedResult.status).toBe(0);

  const minifiedLength = (await fixtures.minify.readFile("dist/index.js"))
    .length;

  expect(unminifiedLength).toBeGreaterThan(minifiedLength);
});

it.skip("should bundle", async () => {
  // TODO - for some reason the bundle build does not work in this test, but works
  //        when executed in practice
  const unbundledResult = fixtures.bundle.runTse("build src/index.tsx");

  expect(unbundledResult.status).toBe(0);

  const unbundledLength = (await fixtures.bundle.readFile("dist/index.js"))
    .length;

  const unbundledExecResult = fixtures.bundle.runNode("dist/index.cjs");
  expect(unbundledExecResult.status).toBe(0);
  expect(unbundledExecResult.stdout).toMatch(/<span>hello world<\/span>/);

  const bundledResult = fixtures.bundle.runTse("build src/index.tsx --bundle");
  expect(bundledResult.status).toBe(0);
  console.log(bundledResult);

  const bundledLength = (await fixtures.bundle.readFile("dist/index.js"))
    .length;

  const bundledExecResult = fixtures.bundle.runNode("dist/index.cjs");
  expect(bundledExecResult.status).toBe(0);
  expect(bundledExecResult.stdout).toMatch(/<span>hello world<\/span>/);

  expect(unbundledLength).toBeLessThan(bundledLength);
}, 10000);

it.skip("should watch for changes", async () => {
  // TODO - implement me
});
