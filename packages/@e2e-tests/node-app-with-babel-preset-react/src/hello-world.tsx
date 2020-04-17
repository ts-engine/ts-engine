import React from "react";
import ReactDom from "react-dom/server";

export const HelloWorld = () => {
  return <span>hello world</span>;
};

export const render = (): string => {
  return ReactDom.renderToStaticMarkup(<HelloWorld />);
};
