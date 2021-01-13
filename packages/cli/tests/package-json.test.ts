import path from "path";
import mockFs from "mock-fs";
import { mockConsole } from "../test-utils/console";
import { createCli } from "../src/cli";
import { PackageJsonContext } from "../src/middleware/package-json";
import { createPackageJsonMock } from "../test-utils/package-json";

const consoleMock = mockConsole();

afterEach(() => {
  mockFs.restore();
  consoleMock.reset();
});

it("should fail if it cannot find a package.json", async () => {
  mockFs({});

  const result = await createCli().run(["version"]);

  expect(result.code).toBe(1);
  expect(consoleMock.error).toHaveBeenCalledWith(
    "Could not locate package.json. Please run ts-engine in the same directory as your package.json file."
  );
});

it("should put the package on context", async () => {
  mockFs({
    "package.json": JSON.stringify(createPackageJsonMock()),
  });

  const result = await createCli()
    .use(async (ctx: PackageJsonContext) => {
      expect(ctx.package).toEqual({
        dir: process.cwd(),
        srcDir: path.resolve(process.cwd(), "src"),
      });
    })
    .run(["version"]);

  expect(result.code).toBe(0);
});
