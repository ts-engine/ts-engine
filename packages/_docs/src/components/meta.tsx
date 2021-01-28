import React from "react";
import Head from "next/head";

interface MetaProps {
  title: string;
}

export const Meta = (props: MetaProps) => {
  return (
    <Head>
      <title>ts-engine - {props.title}</title>
    </Head>
  );
};
