import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Doc } from "../lib/content";

interface DirectoryProps {
  docs: Doc[];
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
          <Link href="/">
            <a
              onClick={props.onNavigation}
              className={`block w-100 hover:underline focus:underline whitespace-nowrap ${homeActiveStyle}`}
            >
              Home
            </a>
          </Link>
        </li>
        {props.docs.map((p) => {
          const path = `/docs/${p.slug}`;
          const isDocActive = router.asPath === path;
          const docActiveStyle = isDocActive ? activeStyle : "";

          return (
            <li key={p.slug} className="pb-2 text-lg">
              <Link href={path}>
                <a
                  onClick={props.onNavigation}
                  className={`block w-100 hover:underline focus:underline whitespace-nowrap ${docActiveStyle}`}
                >
                  {p.title}
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
