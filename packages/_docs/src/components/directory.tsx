import React from "react";
import { useRouter } from "next/router";
import { Link } from "./link";

export interface DirectoryConfig {
  docLinks: {
    slug: string;
    title: string;
  }[];
}
interface DirectoryProps {
  config: DirectoryConfig;
  onNavigation: () => void;
}

export const Directory = (props: DirectoryProps) => {
  const router = useRouter();

  const activeStyle = " underline font-bold";

  const isHomeActive = router.asPath === "/";
  const homeActiveStyle = isHomeActive ? activeStyle : "";

  return (
    <nav>
      <ul>
        <li className="pb-2 text-lg">
          <Link
            href="/"
            onClick={props.onNavigation}
            className={`block w-100 hover:underline focus:underline whitespace-nowrap ${homeActiveStyle}`}
          >
            Home
          </Link>
        </li>
        {props.config.docLinks.map((p) => {
          const path = `/docs/${p.slug}`;
          const isDocActive = router.asPath === path;
          const docActiveStyle = isDocActive ? activeStyle : "";

          return (
            <li key={p.slug} className="pb-2 text-lg">
              <Link
                href={path}
                onClick={props.onNavigation}
                className={`block w-100 hover:underline focus:underline whitespace-nowrap ${docActiveStyle}`}
              >
                {p.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
