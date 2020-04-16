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
