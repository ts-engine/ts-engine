import React from "react";
import { GetStaticProps } from "next";

interface DirectoryProps {
  currentSlug?: string;
  pages: {
    title: string;
    slug: string;
  }[];
}

export const Directory = (props: DirectoryProps) => {
  return (
    <ul>
      {props.pages.map((p) => {
        const activeClass = p.slug === props.currentSlug ? "active" : "";
        return (
          <li key={p.slug}>
            <a href={p.slug} className={`${activeClass}`}>
              {p.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
};
