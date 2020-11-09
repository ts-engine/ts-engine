import fs from "fs-extra";
import path from "path";
import { matchLog, runCli } from "../../test-utils";
import { getSupportedExtensions } from "../../utils";

const tempDir = path.resolve(__dirname, "temp/build");

describe("build single file", () => {
  getSupportedExtensions({ dots: true }).forEach((extension) => {
    it(`should build build${extension} file and exit with 0`, async () => {
      await fs.ensureDir(tempDir);

      const filename = path.resolve(tempDir, `build${extension}`);
      await fs.writeFile(
        filename,
        `export const add = (a: number, b: number): number => {
  return a + b;
};
`
      );

      const result = await runCli(`build ${filename}`);
      await fs.remove(filename);

      const output = await fs.readFile(
        path.resolve("dist", `build${extension}`)
      );

      expect(output).toMatchSnapshot();
      expect(
        matchLog(new RegExp(`${filename} -> dist/${filename}`), result.stdout)
      ).toBeTruthy();
      expect(result.exitCode).toBe(0);
    });
  });
});
