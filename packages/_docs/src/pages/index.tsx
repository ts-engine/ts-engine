import React from "react";
import { GetStaticProps } from "next";
import { Layout } from "../components/layout";
import { getDocs, Doc, getContentHtml } from "../lib/content";

interface IndexPageProps {
  docs: Doc[];
  contentHtml: string;
}

const IndexPage = (props: IndexPageProps) => {
  return (
    <Layout docs={props.docs}>
      <article
        className="prose lg:prose-lg"
        dangerouslySetInnerHTML={{ __html: props.contentHtml }}
      ></article>
    </Layout>
  );
};

export default IndexPage;

export const getStaticProps: GetStaticProps<IndexPageProps> = async () => {
  const docs = await getDocs();
  const contentHtml = await getContentHtml("home");

  return { props: { docs, contentHtml } };
};
