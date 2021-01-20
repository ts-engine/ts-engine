import path from "path";
import fs from "fs-extra";
import matter from "gray-matter";

const DOC_DIR = path.resolve(process.cwd(), "docs");

export interface Doc {
  markdown: string;
  slug: string;
  title: string;
}

export const getDocs = async (): Promise<Doc[]> => {
  const filenames = await fs.readdir(DOC_DIR);
  const fileContents = await Promise.all(
    filenames
      .map((f) => path.resolve(DOC_DIR, f))
      .map((f) => fs.readFile(f, { encoding: "utf8" }))
  );

  const docs = fileContents
    .map((c) => matter(c))
    .map((m) => ({
      markdown: m.content,
      slug: m.data.slug,
      title: m.data.title,
    }));

  return docs;
};
