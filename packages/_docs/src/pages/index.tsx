import React from "react";
import { GetStaticProps } from "next";
import { Meta } from "../components/meta";
import { Layout } from "../components/layout";
import { getDocs, getContentHtml } from "../lib/content";
import { DirectoryConfig } from "../components/directory";

interface IndexPageProps {
  directoryConfig: DirectoryConfig;
  contentHtml: string;
}

const IndexPage = (props: IndexPageProps) => {
  return (
    <>
      <Meta title="Home" />
      <Layout directoryConfig={props.directoryConfig}>
        <article
          className="prose lg:prose-lg"
          dangerouslySetInnerHTML={{ __html: props.contentHtml }}
        ></article>
      </Layout>
    </>
  );
};

export default IndexPage;

export const getStaticProps: GetStaticProps<IndexPageProps> = async () => {
  const docs = await getDocs();
  const contentHtml = await getContentHtml("home");
  const directoryConfig = {
    docLinks: docs.map((d) => ({
      slug: d.slug,
      title: d.title,
    })),
  };

  return { props: { directoryConfig, contentHtml } };
};
