import React from "react";
import { Doc } from "../lib/docs";
import { Directory } from "./directory";

interface LayoutProps {
  children: React.ReactNode;
  docs: Doc[];
}

export const Layout = (props: LayoutProps) => {
  return (
    <div>
      <header>ts-engine</header>
      <aside>
        <Directory docs={props.docs} />
      </aside>
      <main>{props.children}</main>
    </div>
  );
};
