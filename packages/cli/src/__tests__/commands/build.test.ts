import fs from "fs-extra";
import path from "path";
import { matchLog, runCli } from "../../test-utils";
import { getSupportedExtensions } from "../../utils";

const tempDir = path.resolve(__dirname, "temp/build");

getSupportedExtensions({ dots: true }).forEach((extension) => {
  it.only(`should build files with extension ${extension} and produce cjs and esm outputs`, async () => {
    await fs.ensureDir(tempDir);

    const filename = path.resolve(tempDir, `build${extension}`);
    await fs.writeFile(
      filename,
      `export const add = (a, b) => {
  return a + b;
};
`
    );

    const result = await runCli(`build ${filename}`);
    await fs.remove(filename);

    expect(
      await fs.readFile(path.resolve("dist", `build.js`), { encoding: "utf8" })
    ).toMatchSnapshot();
    expect(
      await fs.readFile(path.resolve("dist", `build.js.map`), {
        encoding: "utf8",
      })
    ).toMatchSnapshot();
    expect(
      await fs.readFile(path.resolve("dist", `build.esm.js`), {
        encoding: "utf8",
      })
    ).toMatchSnapshot();
    expect(
      await fs.readFile(path.resolve("dist", `build.esm.js.map`), {
        encoding: "utf8",
      })
    ).toMatchSnapshot();

    expect(
      matchLog(path.resolve(process.cwd(), "dist/build.js"), result.stdout)
    ).toBeTruthy();
    expect(
      matchLog(path.resolve(process.cwd(), "dist/build.js.map"), result.stdout)
    ).toBeTruthy();
    expect(
      matchLog(path.resolve(process.cwd(), "dist/build.esm.js"), result.stdout)
    ).toBeTruthy();
    expect(
      matchLog(
        path.resolve(process.cwd(), "dist/build.esm.js.map"),
        result.stdout
      )
    ).toBeTruthy();

    expect(result.exitCode).toBe(0);
  });
});

it("should build multiple files at once", async () => {
  throw new Error("Not implemented!");
});

it("should report file cannot be found and exit with 1", async () => {
  throw new Error("Not implemented!");
});

it("should display build warnings", async () => {
  throw new Error("Not implemented!");
});

it("should display build errors and exit with 1", async () => {
  throw new Error("Not implemented!");
});

it("should bundle externals", async () => {
  await fs.ensureDir(tempDir);

  const filename = path.resolve(tempDir, `build.ts`);
  await fs.writeFile(
    filename,
    `import finder from "find-package-json";

export const findPackageJson = (): packageJsonFinder.Package | undefined => {
  return finder().next().value;
};
`
  );

  const result = await runCli(`build ${filename} --bundle`);
  await fs.remove(filename);

  expect(
    await fs.readFile(path.resolve("dist", `build.js`), { encoding: "utf8" })
  ).toMatchSnapshot();
  expect(
    await fs.readFile(path.resolve("dist", `build.js.map`), {
      encoding: "utf8",
    })
  ).toMatchSnapshot();
  expect(
    await fs.readFile(path.resolve("dist", `build.esm.js`), {
      encoding: "utf8",
    })
  ).toMatchSnapshot();
  expect(
    await fs.readFile(path.resolve("dist", `build.esm.js.map`), {
      encoding: "utf8",
    })
  ).toMatchSnapshot();

  expect(
    matchLog(path.resolve(process.cwd(), "dist/build.js"), result.stdout)
  ).toBeTruthy();
  expect(
    matchLog(path.resolve(process.cwd(), "dist/build.js.map"), result.stdout)
  ).toBeTruthy();
  expect(
    matchLog(path.resolve(process.cwd(), "dist/build.esm.js"), result.stdout)
  ).toBeTruthy();
  expect(
    matchLog(
      path.resolve(process.cwd(), "dist/build.esm.js.map"),
      result.stdout
    )
  ).toBeTruthy();

  expect(result.exitCode).toBe(0);
});

it("should minify", async () => {
  await fs.ensureDir(tempDir);

  const filename = path.resolve(tempDir, `build.ts`);
  await fs.writeFile(
    filename,
    `export const add = (a: number, b: number): number => {
return a + b;
};
`
  );

  const result = await runCli(`build ${filename} --minify`);
  await fs.remove(filename);

  expect(
    await fs.readFile(path.resolve("dist", `build.js`), { encoding: "utf8" })
  ).toMatchSnapshot();
  expect(
    await fs.readFile(path.resolve("dist", `build.js.map`), {
      encoding: "utf8",
    })
  ).toMatchSnapshot();
  expect(
    await fs.readFile(path.resolve("dist", `build.esm.js`), {
      encoding: "utf8",
    })
  ).toMatchSnapshot();
  expect(
    await fs.readFile(path.resolve("dist", `build.esm.js.map`), {
      encoding: "utf8",
    })
  ).toMatchSnapshot();

  expect(
    matchLog(path.resolve(process.cwd(), "dist/build.js"), result.stdout)
  ).toBeTruthy();
  expect(
    matchLog(path.resolve(process.cwd(), "dist/build.js.map"), result.stdout)
  ).toBeTruthy();
  expect(
    matchLog(path.resolve(process.cwd(), "dist/build.esm.js"), result.stdout)
  ).toBeTruthy();
  expect(
    matchLog(
      path.resolve(process.cwd(), "dist/build.esm.js.map"),
      result.stdout
    )
  ).toBeTruthy();

  expect(result.exitCode).toBe(0);
});
