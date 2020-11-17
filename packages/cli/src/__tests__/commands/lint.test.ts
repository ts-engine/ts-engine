import fs from "fs-extra";
import path from "path";
import { matchLog, runCli } from "../../test-utils";
import { supportedExtensionsWithDot } from "../../constants";

const tempDir = path.resolve(__dirname, "temp/lint");

supportedExtensionsWithDot.forEach((extension) => {
  it(`should report no issues in file with extension ${extension}`, async () => {
    await fs.ensureDir(tempDir);

    const filename = path.resolve(tempDir, `valid${extension}`);
    await fs.writeFile(
      filename,
      `export const add = (a: number, b: number): number => {
  return a + b;
};
`
    );

    const result = await runCli(`lint ${filename}`);
    await fs.remove(filename);

    expect(result.stderr.length).toBe(0);
    expect(result.exitCode).toBe(0);
  });
});

supportedExtensionsWithDot.forEach((extension) => {
  it(`should report errors in file with extension ${extension} and exit with 1`, async () => {
    await fs.ensureDir(tempDir);

    const filename = path.resolve(tempDir, `error${extension}`);
    await fs.writeFile(
      filename,
      `var add = (a: number, b: number): number => {
  return a + b;
};
`
    );

    const result = await runCli(`lint ${filename}`);
    await fs.remove(filename);

    expect(matchLog(/no-var/, result.stderr)).toBeTruthy();
    expect(
      matchLog(/@typescript-eslint\/no-unused-vars/, result.stderr)
    ).toBeTruthy();
    expect(result.exitCode).toBe(1);
  });
});

supportedExtensionsWithDot.forEach((extension) => {
  it(`should report warnings in file with extension ${extension}`, async () => {
    await fs.ensureDir(tempDir);

    const filename = path.resolve(tempDir, `warning${extension}`);
    await fs.writeFile(
      filename,
      `import fs from "fs";
import fs2 from "fs";

export const fs3 = fs;
export const fs4 = fs2;
`
    );

    const result = await runCli(`lint ${filename}`);
    await fs.remove(filename);

    expect(matchLog(/import\/no-duplicates/, result.stdout)).toBeTruthy();
    expect(result.exitCode).toBe(0);
  });
});

it("should warn the user and exit with 1", async () => {
  const result = await runCli("lint does-not-exist.js");

  expect(matchLog(/No files found/, result.stderr)).toBeTruthy();
  expect(result.exitCode).toBe(1);
});

it("should find and lint multiple files from single glob", async () => {
  await fs.ensureDir(tempDir);

  const filename1 = path.resolve(tempDir, `error-1.js`);
  await fs.writeFile(
    filename1,
    `const add = (a: number, b: number): number => {
return a + b;
};
`
  );
  const filename2 = path.resolve(tempDir, `error-2.ts`);
  await fs.writeFile(
    filename2,
    `export var add = (a: number, b: number): number => {
return a + b;
};
`
  );

  const result = await runCli(`lint ${tempDir}`);
  await fs.remove(tempDir);

  expect(matchLog(/no-var/, result.stderr)).toBeTruthy();
  expect(
    matchLog(/@typescript-eslint\/no-unused-vars/, result.stderr)
  ).toBeTruthy();
  expect(result.exitCode).toBe(1);
});

it("should find and lint multiple files from multiple globs", async () => {
  await fs.ensureDir(tempDir);

  const filename1 = path.resolve(tempDir, `error-1.js`);
  await fs.writeFile(
    filename1,
    `const add = (a: number, b: number): number => {
return a + b;
};
`
  );
  const filename2 = path.resolve(tempDir, `error-2.ts`);
  await fs.writeFile(
    filename2,
    `export var add = (a: number, b: number): number => {
return a + b;
};
`
  );

  const result = await runCli(`lint ${filename1} ${filename2}`);
  await fs.remove(tempDir);

  expect(matchLog(/no-var/, result.stderr)).toBeTruthy();
  expect(
    matchLog(/@typescript-eslint\/no-unused-vars/, result.stderr)
  ).toBeTruthy();
  expect(result.exitCode).toBe(1);
});

it("should apply fixes to files", async () => {
  await fs.ensureDir(tempDir);

  const filename = path.resolve(tempDir, "fixable.js");
  await fs.writeFile(
    filename,
    `export const add = (a: number, b: number): number => {
return a + b;
}
`
  );

  const result = await runCli(`lint --fix ${filename}`);

  expect(matchLog(/prettier\/prettier/, result.stderr)).toBeFalsy();
  const fixedFile = await fs.readFile(filename, { encoding: "utf8" });
  await fs.remove(filename);

  expect(fixedFile).toBe(`export const add = (a: number, b: number): number => {
  return a + b;
};
`);
  expect(result.exitCode).toBe(0);
});
