import fs from "fs-extra";
import path from "path";
import { matchLog, runCli } from "../../test-utils";
import { getSupportedExtensions } from "../../utils";

const tempDir = path.resolve(__dirname, "temp/build");

const checkDistFileOutput = async (filename: string, stdout: string[]) => {
  const filepath = path.resolve("dist", filename);
  expect(await fs.readFile(filepath, { encoding: "utf8" })).toMatchSnapshot();
  expect(
    matchLog(path.resolve(process.cwd(), "dist", filename), stdout)
  ).toBeTruthy();

  await fs.remove(filepath);
};

const writeFile = async (
  filename: string,
  contents: string
): Promise<string> => {
  const filepath = path.resolve(tempDir, filename);
  await fs.ensureDir(filepath.substring(0, filepath.lastIndexOf("/")));
  await fs.writeFile(filepath, contents, { encoding: "utf8" });

  return filepath;
};

const writeTypeScriptFile = async (filename: string): Promise<string> => {
  return await writeFile(
    filename,
    "export const add = (a: number, b: number): number => { return a + b; };"
  );
};

const writeJavaScriptFile = async (filename: string): Promise<string> => {
  return await writeFile(
    filename,
    "export const add = (a, b) => { return a + b; };"
  );
};

getSupportedExtensions({ dots: true }).forEach((extension) => {
  it(`should build files with extension ${extension} and produce cjs and esm outputs`, async () => {
    const filepath = await writeJavaScriptFile(`build${extension}`);

    const result = await runCli(`build ${filepath}`);
    await fs.remove(filepath);

    await checkDistFileOutput("build.js", result.stdout);
    await checkDistFileOutput("build.js.map", result.stdout);
    await checkDistFileOutput("build.esm.js", result.stdout);
    await checkDistFileOutput("build.esm.js.map", result.stdout);

    expect(result.exitCode).toBe(0);
  });
});

it("should build multiple files at once", async () => {
  const oneFilepath = await writeTypeScriptFile(`one.ts`);
  const twoFilepath = await writeJavaScriptFile(`two.js`);

  const result = await runCli(`build ${oneFilepath} ${twoFilepath}`);
  await fs.remove(oneFilepath);
  await fs.remove(twoFilepath);

  await checkDistFileOutput("one.js", result.stdout);
  await checkDistFileOutput("one.js.map", result.stdout);
  await checkDistFileOutput("one.esm.js", result.stdout);
  await checkDistFileOutput("one.esm.js.map", result.stdout);
  await checkDistFileOutput("two.js", result.stdout);
  await checkDistFileOutput("two.js.map", result.stdout);
  await checkDistFileOutput("two.esm.js", result.stdout);
  await checkDistFileOutput("two.esm.js.map", result.stdout);

  expect(result.exitCode).toBe(0);
});

it("should report file cannot be found and exit with 1", async () => {
  const result = await runCli("build does-not-exist.js");

  expect(
    matchLog(
      `error: Could not read from file: ${path.resolve(
        process.cwd(),
        "does-not-exist.js"
      )}`,
      result.stderr
    )
  ).toBeTruthy();
  expect(result.exitCode).toBe(1);
});

it("should display build errors and exit with 1", async () => {
  const filepath = await writeFile("build.ts", "console.log(]]]);");

  const result = await runCli(`build ${filepath}`);
  await fs.remove(filepath);
  console.log(result);

  expect(matchLog("1 error", result.stderr)).toBeTruthy();
  expect(result.exitCode).toBe(1);
});

it("should bundle externals", async () => {
  const filepath = await writeFile(
    "build.ts",
    "import finder from 'find-package-json'; export const findPkg = (): packageJsonFinder.Package | undefined => { return finder().next().value; };"
  );

  const result = await runCli(`build ${filepath} --bundle`);
  await fs.remove(filepath);

  await checkDistFileOutput("build.js", result.stdout);
  await checkDistFileOutput("build.js.map", result.stdout);
  await checkDistFileOutput("build.esm.js", result.stdout);
  await checkDistFileOutput("build.esm.js.map", result.stdout);

  expect(result.exitCode).toBe(0);
});

it("should minify", async () => {
  const filepath = await writeTypeScriptFile(`build.ts`);

  const result = await runCli(`build ${filepath} --minify`);
  await fs.remove(filepath);

  await checkDistFileOutput("build.js", result.stdout);
  await checkDistFileOutput("build.js.map", result.stdout);
  await checkDistFileOutput("build.esm.js", result.stdout);
  await checkDistFileOutput("build.esm.js.map", result.stdout);

  expect(result.exitCode).toBe(0);
});
