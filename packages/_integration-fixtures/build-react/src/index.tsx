import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const HelloWorld = () => <span>hello world</span>;

console.log(renderToStaticMarkup(<HelloWorld />));
