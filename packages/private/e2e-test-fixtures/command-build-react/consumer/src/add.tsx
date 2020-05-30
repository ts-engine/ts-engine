import React from "react";
import ReactDom from "react-dom/server";
import { Add } from "@e2e-test/command-build-react";

export const log = () => {
  console.log(ReactDom.renderToStaticMarkup(<Add a={1} b={2} />));
};
