import createLogger from "progress-estimator";
import mockConsole from "jest-mock-console";
import { logProgress } from "../logger";

jest.mock("progress-estimator", () => {
  return jest.fn(jest.requireActual("progress-estimator"));
});

describe("logger", () => {
  let restoreConsole = () => {};

  beforeEach(() => {
    restoreConsole = mockConsole();
  });

  afterEach(() => {
    restoreConsole();
    // @ts-ignore - its being mocked at the module level
    createLogger.mockReset();
  });

  describe("logProgress", () => {
    it("should return the result of the promise", async () => {
      const promise = Promise.resolve("hello world");
      expect(logProgress(promise, "test", "test-return")).resolves.toBe(
        "hello world"
      );
    });

    it("should not use progress-estimator when run in CI", async () => {
      process.env.CI = "true";
      const promise = Promise.resolve("hello world");
      expect(logProgress(promise, "test", "test-return")).resolves.toBe(
        "hello world"
      );
      expect(createLogger).not.toHaveBeenCalled();
    });
  });
});
