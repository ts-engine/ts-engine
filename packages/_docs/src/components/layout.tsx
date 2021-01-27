import React from "react";
import {
  AiOutlineGithub,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
} from "react-icons/ai";
import { Link } from "./link";
import { Directory, DirectoryConfig } from "./directory";
import TsEngineSvg from "../icons/ts-engine.svg";
import { version } from "../../package.json";
import { Icon } from "./icon";

interface LayoutProps {
  children: React.ReactNode;
  directoryConfig: DirectoryConfig;
}

export const Layout = (props: LayoutProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="font-semibold font-mono p-2 md:p-4 bg-blue-500 text-white">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl md:text-3xl">
            <div className="flex items-center">
              <div className="pr-4">
                <Icon
                  icon={TsEngineSvg}
                  className="w-16 h-16 md:w-20 md:h-20"
                  label="ts-engine logo"
                />
              </div>
              <div>
                <div>ts-engine</div>
                <div className="text-xs md:text-lg">{version}</div>
              </div>
            </div>
          </Link>
          <div className="p-4">
            <a
              className="hover:underline"
              href="https://github.com/ts-engine/ts-engine"
            >
              <Icon
                icon={AiOutlineGithub}
                className="w-8 h-8 md:w-10 md:h-10"
                label="Go to GitHub"
              />
            </a>
          </div>
        </div>
      </header>
      <div className="flex flex-col md:flex-row pb-6 flex-grow">
        <aside className="p-6 pb-0 md:p-6">
          <div className="md:hidden border-b-2 pb-6">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md bg-blue-500 text-white"
            >
              <Icon
                icon={isOpen ? AiOutlineMenuFold : AiOutlineMenuUnfold}
                label={isOpen ? "Close directory" : "Open directory"}
                className="w-6 h-6"
              />
            </button>
            {isOpen && (
              <div className="pt-4">
                <Directory
                  config={props.directoryConfig}
                  onNavigation={() => setIsOpen(false)}
                />
              </div>
            )}
          </div>
          <div className="hidden md:block border-r-2 pr-6 w-56 sticky top-6">
            <Directory
              config={props.directoryConfig}
              onNavigation={() => setIsOpen(false)}
            />
          </div>
        </aside>
        <main className="container mx-auto p-6">{props.children}</main>
      </div>
      <footer className="container mx-auto text-center">
        <div className="inline-block border-t-2 p-8">
          Copyright © 2021 Lee Cheneler
        </div>
      </footer>
    </div>
  );
};
