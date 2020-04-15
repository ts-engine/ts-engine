import { spawnSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import { getToolPackage } from "../../utils/package";
import { getTsEngineConfig } from "../../config/ts-engine";

const tsEngineConfig = getTsEngineConfig();

export interface MockPackage {
  dir: string;
  cleanup: () => Promise<void>;
  writeFile: (filename: string, content: string) => Promise<void>;
  readFile: (filename: string) => Promise<string>;
}

export const createMockPackage = async (name: string): Promise<MockPackage> => {
  // Create directories
  const packageDir = path.resolve(getToolPackage().dir, "..", name);
  await fs.ensureDir(path.resolve(packageDir, tsEngineConfig.srcDir));
  await fs.ensureDir(
    path.resolve(packageDir, tsEngineConfig.srcDir, "__tests__")
  );

  // Write package.json file
  const toolPackageJson = getToolPackage().json;
  await fs.writeJSON(
    path.resolve(packageDir, "package.json"),
    {
      name,
      version: "1.0.0",
      license: "MIT",
      devDependencies: JSON.parse(
        `{"${toolPackageJson.name}": "${toolPackageJson.version}"}`
      ),
    },
    { spaces: 2 }
  );

  // Install dependencies
  const result = spawnSync("yarn", { cwd: packageDir, encoding: "utf8" });

  // If yarn didn't exit correctly the we can't
  // continue test as node_modules won't be wired up
  if (result.status !== 0) {
    return Promise.reject();
  }

  // Cleanup the package
  const cleanup = async (): Promise<void> => {
    await fs.remove(packageDir);
  };

  // Write file to the package
  const writeFile = async (
    filename: string,
    content: string
  ): Promise<void> => {
    await fs.writeFile(path.resolve(packageDir, filename), content);
  };

  // Read file from the package
  const readFile = async (filename: string): Promise<string> => {
    return await fs.readFile(path.resolve(packageDir, filename), "utf8");
  };

  return Promise.resolve({
    dir: packageDir,
    cleanup,
    writeFile,
    readFile,
  });
};
