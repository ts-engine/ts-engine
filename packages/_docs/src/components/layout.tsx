import React from "react";
import { Doc } from "../lib/docs";
import { Directory } from "./directory";
import TsEngineSvg from "../icons/ts-engine.svg";
import { version } from "../../package.json";

interface LayoutProps {
  children: React.ReactNode;
  docs: Doc[];
}

export const Layout = (props: LayoutProps) => {
  return (
    <div>
      <header className="font-semibold font-mono p-2 md:p-4 bg-blue-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="pr-4">
              <TsEngineSvg className="w-16 h-16 md:w-20 md:h-20" />
            </div>
            <div className="text-xl md:text-3xl">ts-engine</div>
          </div>
          <div className="text-sm md:text-lg">{version}</div>
        </div>
      </header>
      <div className="flex flex-col md:flex-row">
        <aside className="pb-4 pl-0 md:p-6">
          <Directory docs={props.docs} />
        </aside>
        <main className="container mx-auto p-6">{props.children}</main>
      </div>
    </div>
  );
};
