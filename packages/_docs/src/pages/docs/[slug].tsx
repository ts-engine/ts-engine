import React from "react";
import { GetStaticProps } from "next";
import { markdownToHtml } from "../../lib/markdown-to-html";
import { getDocBySlug, getDocs } from "../../lib/docs";
import { Directory } from "../../components/directory";

interface DocProps {
  docHtml: string;
  currentSlug?: string;
  pages: {
    title: string;
    slug: string;
  }[];
}

const Doc = (props: DocProps) => {
  return (
    <>
      <Directory pages={props.pages} currentSlug={props.currentSlug} />
      <article
        className="prose lg:prose-xl"
        dangerouslySetInnerHTML={{ __html: props.docHtml }}
      ></article>
    </>
  );
};

export default Doc;

export const getStaticProps: GetStaticProps<DocProps> = async (context) => {
  const { slug } = context.params;

  const doc = await getDocBySlug(slug as string);
  const docHtml = await markdownToHtml(doc.markdown);

  const docs = await getDocs();
  const pages = docs.map((d) => {
    return {
      title: d.title,
      slug: d.slug,
    };
  });

  const currentSlug = slug as string;

  return { props: { docHtml, pages, currentSlug } };
};

export const getStaticPaths = async () => {
  const docs = await getDocs();

  const paths = docs.map((d) => {
    return { params: { slug: d.slug } };
  });

  return {
    paths,
    fallback: false,
  };
};
