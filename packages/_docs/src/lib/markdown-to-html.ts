import unified from "unified";
import parse from "remark-parse";
import highlight from "remark-highlight.js";
import remark2rehype from "remark-rehype";
import doc from "rehype-document";
import format from "rehype-format";
import html from "rehype-stringify";

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const virtualFile = await unified()
    .use(parse)
    .use(highlight)
    .use(remark2rehype)
    .use(doc)
    .use(format)
    .use(html)
    .process(markdown);

  return virtualFile.toString();
};
