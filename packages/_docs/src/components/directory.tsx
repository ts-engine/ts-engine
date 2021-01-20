import React from "react";
import { useRouter } from "next/router";
import { Doc } from "../lib/docs";

export interface DirectoryProps {
  docs: Doc[];
}

export const Directory = (props: DirectoryProps) => {
  const router = useRouter();

  const pathMatches = (slug: string) => {
    return router.pathname === `/docs/${slug}`;
  };

  return (
    <nav>
      <ul>
        {props.docs.map((p) => {
          const activeClass = pathMatches(p.slug) ? "active" : "";
          return (
            <li key={p.slug}>
              <a href={`/docs/${p.slug}`} className={`${activeClass}`}>
                {p.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
