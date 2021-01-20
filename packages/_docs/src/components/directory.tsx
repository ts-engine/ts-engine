import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Doc } from "../lib/docs";

export interface DirectoryProps {
  docs: Doc[];
}

export const Directory = (props: DirectoryProps) => {
  const router = useRouter();

  const pathMatches = (path: string) => {
    return router.asPath === path;
  };

  return (
    <nav>
      <ul>
        {props.docs.map((p) => {
          const path = `/docs/${p.slug}`;
          const activeClass = pathMatches(path)
            ? "text-blue-500 underline"
            : "";
          return (
            <li key={p.slug} className="pb-2">
              <Link href={`/docs/${p.slug}`}>
                <a
                  className={`block w-100 hover:underline focus:underline whitespace-nowrap ${activeClass}`}
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
