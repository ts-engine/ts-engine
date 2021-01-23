import React from "react";
import { GetStaticProps } from "next";
import { getDocs, Doc } from "../../lib/content";
import { Layout } from "../../components/layout";
import { Meta } from "../../components/meta";

interface DocPageProps {
  doc: Doc;
  docs: Doc[];
}

const DocPage = (props: DocPageProps) => {
  return (
    <>
      <Meta title={props.doc.title} />
      <Layout docs={props.docs}>
        <article
          className="prose lg:prose-lg"
          dangerouslySetInnerHTML={{ __html: props.doc.html }}
        ></article>
      </Layout>
    </>
  );
};

export default DocPage;

export const getStaticProps: GetStaticProps<DocPageProps> = async (context) => {
  const { slug } = context.params;

  const docs = await getDocs();
  const doc = docs.find((d) => d.slug === slug);

  return { props: { doc, docs } };
};

export const getStaticPaths = async () => {
  const docs = await getDocs();

  const paths = docs.map((d) => ({
    params: {
      slug: d.slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};
