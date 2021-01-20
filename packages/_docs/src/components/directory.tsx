import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Doc } from "../lib/docs";

interface DirectoryProps {
  docs: Doc[];
}

export const Directory = (props: DirectoryProps) => {
  const router = useRouter();

  return (
    <nav>
      <ul>
        {props.docs.map((p) => {
          const path = `/docs/${p.slug}`;
          const isActive = router.asPath === path;
          const activeStyle = isActive ? "text-blue-500 underline" : "";

          return (
            <li key={p.slug} className="pb-2">
              <Link href={path}>
                <a
                  className={`block w-100 hover:underline focus:underline whitespace-nowrap ${activeStyle}`}
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
