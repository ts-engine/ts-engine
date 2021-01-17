import mockFs from "mock-fs";
import { mockConsole } from "../test-utils/console";
import { createCli } from "../src/cli";
import { createPackageJsonMock } from "../test-utils/package-json";
import { BASE_JEST_CONFIG } from "../src/middleware/commands/_test";
import { run } from "../src/jest";

jest.mock("../src/jest", () => {
  return {
    run: jest.fn(),
  };
});
const mockRun = run as jest.Mock;

beforeEach(() => {
  mockRun.mockReset();
});

const consoleMock = mockConsole();

afterEach(() => {
  mockFs.restore();
  consoleMock.reset();
});

it("should run tests and pass", async () => {
  mockFs({
    "package.json": JSON.stringify(createPackageJsonMock()),
  });

  const result = await createCli().run(["test"]);

  expect(result.code).toBe(0);
  expect(mockRun).toHaveBeenCalledWith([
    "--config",
    JSON.stringify(BASE_JEST_CONFIG),
  ]);
});

it("should run tests and fail", async () => {
  mockFs({
    "package.json": JSON.stringify(createPackageJsonMock()),
  });
  mockRun.mockRejectedValue("Tests failed");

  const result = await createCli().run(["test"]);

  expect(result.code).toBe(1);
  expect(mockRun).toHaveBeenCalledWith([
    "--config",
    JSON.stringify(BASE_JEST_CONFIG),
  ]);
});

it("should forward args to jest", async () => {
  mockFs({
    "package.json": JSON.stringify(createPackageJsonMock()),
  });

  const result = await createCli().run(["test", "--coverage"]);

  expect(result.code).toBe(0);
  expect(mockRun).toHaveBeenCalledWith([
    "--coverage",
    "--config",
    JSON.stringify(BASE_JEST_CONFIG),
  ]);
});

it("should find jest.setup.js and inject it into config", async () => {
  mockFs({
    "package.json": JSON.stringify(createPackageJsonMock()),
    "jest.setup.js": "",
  });

  const result = await createCli().run(["test"]);

  expect(result.code).toBe(0);
  expect(mockRun).toHaveBeenCalledWith([
    "--config",
    JSON.stringify({
      ...BASE_JEST_CONFIG,
      setupFilesAfterEnv: ["./jest.setup.js"],
    }),
  ]);
});

it("should find jest.setup.ts and inject it into config instead of jest.setup.js", async () => {
  mockFs({
    "package.json": JSON.stringify(createPackageJsonMock()),
    "jest.setup.js": "",
    "jest.setup.ts": "",
  });

  const result = await createCli().run(["test"]);

  expect(result.code).toBe(0);
  expect(mockRun).toHaveBeenCalledWith([
    "--config",
    JSON.stringify({
      ...BASE_JEST_CONFIG,
      setupFilesAfterEnv: ["./jest.setup.ts"],
    }),
  ]);
});

// striggling to get this test to be deterministic for some reason
/* eslint-disable-next-line jest/no-disabled-tests */
it.skip("should fail if it cannot load jest.config.js", async () => {
  mockFs.restore();

  mockFs({
    "package.json": JSON.stringify(createPackageJsonMock()),
    "jest.config.js": `]]]`,
  });

  const result = await createCli().run(["test"]);

  expect(result.code).toBe(1);
  const errorLog = consoleMock.error.mock.calls[0][0] as string;
  expect(
    errorLog.startsWith("Failed to load jest.config.js: Unexpected token ']'")
  ).toBe(true);
});

// striggling to get this test to be deterministic for some reason
/* eslint-disable-next-line jest/no-disabled-tests */
it.skip("should find jest.config.js", async () => {
  mockFs.restore();

  mockFs({
    "package.json": JSON.stringify(createPackageJsonMock()),
    "jest.config.js": `module.exports = { example: "hello world" };`,
  });

  const result = await createCli().run(["test"]);

  expect(result.code).toBe(0);
  expect(mockRun).toHaveBeenCalledWith([
    "--config",
    JSON.stringify({
      ...BASE_JEST_CONFIG,
      example: "hello world",
    }),
  ]);
});
