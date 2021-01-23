/**
 * Need to wrap NextJs link so we can properly lint it without ignoring invalid a tags everywhere.
 * For more information see: https://github.com/vercel/next.js/issues/5533
 */

import React, { ComponentProps } from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";

export interface LinkProps
  extends NextLinkProps,
    Omit<ComponentProps<"a">, keyof NextLinkProps> {}

export const Link = ({
  href,
  as,
  replace,
  scroll,
  shallow,
  passHref,
  prefetch,
  ...rest
}: LinkProps) => (
  <NextLink
    href={href}
    as={as}
    replace={replace}
    scroll={scroll}
    shallow={shallow}
    passHref={passHref}
    prefetch={prefetch}
  >
    {/* href is passed by NextLink */}
    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content */}
    <a {...rest} />
  </NextLink>
);
