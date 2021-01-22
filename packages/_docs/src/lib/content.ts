import path from "path";
import fs from "fs-extra";
import matter from "gray-matter";
import { markdownToHtml } from "./markdown-to-html";

const CONTENT_DIR = path.resolve(process.cwd(), "content");
const DOC_DIR = path.resolve(CONTENT_DIR, "docs");

export interface Doc {
  markdown: string;
  slug: string;
  title: string;
  html: string;
}

export const getDocs = async (): Promise<Doc[]> => {
  const filenames = await fs.readdir(DOC_DIR);
  const fileContents = await Promise.all(
    filenames
      .map((f) => path.resolve(DOC_DIR, f))
      .map((f) => fs.readFile(f, { encoding: "utf8" }))
  );

  const docs = await Promise.all(
    fileContents
      .map((c) => matter(c))
      .map(async (m) => ({
        markdown: m.content,
        html: await markdownToHtml(m.content),
        slug: m.data.slug,
        title: m.data.title,
      }))
  );

  return docs;
};

export const getContentHtml = async (name: string): Promise<string> => {
  const filepath = path.resolve(CONTENT_DIR, `${name}.md`);
  const fileContent = await fs.readFile(filepath, { encoding: "utf8" });

  return await markdownToHtml(matter(fileContent).content);
};
