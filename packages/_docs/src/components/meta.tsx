import React from "react";
import Head from "next/head";

interface MetaProps {
  title: string;
}

export const Meta = (props: MetaProps) => {
  return (
    <Head>
      <title>ts-engine - {props.title}</title>
      <link rel="shortcut icon" href="/favicon.svg" />
    </Head>
  );
};
