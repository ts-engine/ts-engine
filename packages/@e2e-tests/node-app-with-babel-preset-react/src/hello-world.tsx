import React from "react";
import { renderToString } from "react-dom/server";

const HelloWorld = () => {
  return <span>hello world</span>;
};

export const render = (): string => {
  return renderToString(<HelloWorld />);
};
