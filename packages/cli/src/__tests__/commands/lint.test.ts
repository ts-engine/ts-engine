/* eslint-disable jest/no-standalone-expect */

import fs from "fs-extra";
import path from "path";
import { matchLog, runCli } from "../../test-utils";

const tempDir = path.resolve(__dirname, "temp/lint");

describe("no lint issues", () => {
  ["js", "ts", "mjs", "jsx", "tsx"].forEach((extension) => {
    it(`should report no issues in valid.${extension} file and exit with 0`, async () => {
      await fs.ensureDir(tempDir);

      const filename = path.resolve(tempDir, `valid.${extension}`);
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
});

describe("lint errors", () => {
  ["js", "ts", "mjs", "jsx", "tsx"].forEach((extension) => {
    it(`should report errors in error.${extension} file and exit with 1`, async () => {
      await fs.ensureDir(tempDir);

      const filename = path.resolve(tempDir, `error.${extension}`);
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
});

describe("lint warnings", () => {
  ["js", "ts", "mjs", "jsx", "tsx"].forEach((extension) => {
    it(`should report warnings in warning.${extension} file and exit with 0`, async () => {
      await fs.ensureDir(tempDir);

      const filename = path.resolve(tempDir, `warning.${extension}`);
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
});

describe("no files found", () => {
  it("should warn the user and exit with 1", async () => {
    const result = await runCli("lint does-not-exist.js");

    expect(matchLog(/No files found/, result.stderr)).toBeTruthy();
    expect(result.exitCode).toBe(1);
  });
});

describe("linting multiple files", () => {
  it("should find and lint multiple files", async () => {
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
});

describe("auto fix", () => {
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

    expect(fixedFile)
      .toBe(`export const add = (a: number, b: number): number => {
  return a + b;
};
`);
    expect(result.exitCode).toBe(0);
  });
});
