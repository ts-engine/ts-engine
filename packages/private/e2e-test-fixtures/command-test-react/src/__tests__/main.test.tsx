import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Add } from "../main";

it("should add 2 numbers", () => {
  expect(renderToStaticMarkup(<Add a={1} b={2} />)).toBe("<span>3</span>");
});
