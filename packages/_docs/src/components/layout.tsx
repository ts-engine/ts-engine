import React from "react";
import Link from "next/link";
import { Doc } from "../lib/docs";
import { Directory } from "./directory";
import TsEngineSvg from "../icons/ts-engine.svg";
import { version } from "../../package.json";

interface LayoutProps {
  children: React.ReactNode;
  docs: Doc[];
}

export const Layout = (props: LayoutProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <header className="font-semibold font-mono p-2 md:p-4 bg-blue-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="pr-4">
              <TsEngineSvg className="w-16 h-16 md:w-20 md:h-20" />
            </div>
            <div>
              <div>
                <Link href="/">
                  <a className="text-xl md:text-3xl">ts-engine</a>
                </Link>
              </div>
              <div className="text-xs md:text-md">{version}</div>
            </div>
          </div>
          <div className="p-4">
            <a
              className="hover:underline"
              href="https://github.com/ts-engine/ts-engine"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>
      <div className="flex flex-col md:flex-row">
        <aside className="p-6 pb-0 md:p-6">
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md bg-blue-500 text-white"
            >
              {isOpen ? "Hide" : "Open"} Doc directory
            </button>
            {isOpen && (
              <div className="pt-4">
                <Directory docs={props.docs} />
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <Directory docs={props.docs} />
          </div>
        </aside>

        <main className="container mx-auto p-6">{props.children}</main>
      </div>
    </div>
  );
};
