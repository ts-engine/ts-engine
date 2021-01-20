import path from "path";
import fs from "fs-extra";

interface Doc {
  markdown: string;
  slug: string;
  title: string;
}

const DOC_DIR = path.resolve(process.cwd(), "docs");

const capitalize = (str: string): string => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

export const getDocs = async (): Promise<Doc[]> => {
  const filenames = await fs.readdir(DOC_DIR);
  const filepaths = filenames.map((f) => path.resolve(DOC_DIR, f));

  const docs = await Promise.all(
    filepaths.map(async (f, i) => {
      return {
        markdown: await fs.readFile(f, { encoding: "utf8" }),
        slug: filenames[i].replace(/\.md/, "").replace(/^[0-9]+-/, ""),
        title: capitalize(
          filenames[i]
            .replace(/\.md/, "")
            .replace(/^[0-9]+-/, "")
            .replace(/-/g, " ")
        ),
      };
    })
  );

  return docs;
};

export const getDocBySlug = async (slug: string): Promise<Doc> => {
  const docs = await getDocs();

  return docs.find((d) => d.slug === slug);
};
