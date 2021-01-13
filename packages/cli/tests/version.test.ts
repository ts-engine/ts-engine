import mockFs from "mock-fs";
import { mockConsole } from "../test-utils/console";
import { createCli } from "../src/cli";
import packageJson from "../package.json";
import { createPackageJsonMock } from "../test-utils/package-json";

const consoleMock = mockConsole();

afterEach(() => {
  mockFs.restore();
  consoleMock.reset();
});

it("should display version", async () => {
  mockFs({
    "package.json": JSON.stringify(createPackageJsonMock()),
  });

  const result = await createCli().run(["version"]);

  expect(result.code).toBe(0);
  expect(consoleMock.log).toHaveBeenCalledWith(packageJson.version);
});
