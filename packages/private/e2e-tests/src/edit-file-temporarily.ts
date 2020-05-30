import fs from "fs-extra";

export const editFileTemporarily = async (
  filename: string,
  content: string
): Promise<() => Promise<void>> => {
  const originalContent = await fs.readFile(filename, "utf8");

  await fs.writeFile(filename, content);

  return () => fs.writeFile(filename, originalContent);
};
