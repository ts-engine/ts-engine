import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const HelloWorld = () => {
  return <span>hello world</span>;
};

export const renderHelloWorld = (): string => {
  return renderToStaticMarkup(<HelloWorld />);
};
