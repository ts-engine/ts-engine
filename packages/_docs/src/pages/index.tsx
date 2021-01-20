import React from "react";
import { GetStaticProps } from "next";
import { Layout } from "../components/layout";
import { getDocs, Doc } from "../lib/docs";

interface IndexPageProps {
  docs: Doc[];
}

const IndexPage = (props: IndexPageProps) => {
  return <Layout docs={props.docs}>Hola!</Layout>;
};

export default IndexPage;

export const getStaticProps: GetStaticProps<IndexPageProps> = async () => {
  const docs = await getDocs();

  return { props: { docs } };
};
