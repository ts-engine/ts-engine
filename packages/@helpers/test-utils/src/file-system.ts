import fs from "fs-extra";

export const readFile = (filename: string): Promise<string> => {
  return fs.readFile(filename, "utf8");
};

export const writeFile = (filename: string, content: string): Promise<void> => {
  return fs.writeFile(filename, content, { encoding: "utf8" });
};

export const changeFileNameTemporarily = async (
  filename: string,
  newFilename: string
): Promise<() => Promise<void>> => {
  await fs.rename(filename, newFilename);

  return () => fs.rename(newFilename, filename);
};

export const editFileTemporarily = async (
  filename: string,
  content: string
): Promise<() => Promise<void>> => {
  const originalContent = await fs.readFile(filename, "utf8");

  await fs.writeFile(filename, content);

  return () => fs.writeFile(filename, originalContent);
};

export const deleteDir = (dir: string): Promise<void> => {
  return fs.remove(dir);
};

export const fileExists = (filename: string): Promise<boolean> => {
  return fs.pathExists(filename);
};

export const copyDir = (dir: string, destDir: string): Promise<void> => {
  return fs.move(dir, destDir, { overwrite: true });
};

export const ensureDir = (dir: string): Promise<void> => {
  return fs.ensureDir(dir);
};
