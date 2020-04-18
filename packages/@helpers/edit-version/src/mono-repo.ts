import path from "path";
import fs from "fs-extra";
import glob from "glob-promise";

export interface MonoRepo {
  dir: string;
  private: boolean;
  workspaces: string[];
}

export const getMonoRepo = async (currentDir: string): Promise<MonoRepo> => {
  const packageJsonExists = await fs.pathExists(
    path.resolve(currentDir, "package.json")
  );

  // If a package.json exists at this level then check if it is valid mono repo
  // config and return it if it is
  if (packageJsonExists) {
    const packageJson = await fs.readJson(
      path.resolve(currentDir, "package.json")
    );

    // Check if it has valid Yarn Workspaces config
    if (packageJson.private === true && Array.isArray(packageJson.workspaces)) {
      return { ...packageJson, dir: currentDir };
    }
  }

  // Not valid mono repo config, so jump up a level and check there
  const directoryUp = path.resolve(currentDir, "..");

  // If we've reached the top then exit and return null
  if (directoryUp === currentDir) {
    console.error("No inside the mono repo");
    return Promise.reject();
  }

  return getMonoRepo(directoryUp);
};

export interface Package {
  dir: string;
  name: string;
  private: boolean;
  version: string;
}

export const getPackages = async (currentDir: string): Promise<Package[]> => {
  // Load mono repo config
  const monoRepo: MonoRepo | null = await getMonoRepo(currentDir);

  // If we can't find a mono repo then we can't find any packages
  if (!monoRepo) {
    return [];
  }

  // Build globs to packages package.json files
  const packageGlobs = monoRepo.workspaces.map((x) =>
    path.resolve(monoRepo.dir, x, "package.json")
  );

  // Find all paths to package.jsons via globs
  const globResults = await Promise.all(packageGlobs.map((g) => glob(g)));

  // Need to flatten glob results into a simple array of filepaths
  const workspaceFilePaths = globResults
    .reduce((acc, next) => [...acc, ...next], [])
    .filter((x) => !x.includes("node_modules"));

  // Load all file contents into a JS object, it's JSON so serializes properly
  const packages = await Promise.all(
    workspaceFilePaths.map((x: string): Promise<Package> => fs.readJson(x))
  );

  // Apply package meta data on the way out
  return packages.map(
    (x, i): Package => ({
      ...x,
      dir: workspaceFilePaths[i].replace("/package.json", ""),
    })
  );
};
