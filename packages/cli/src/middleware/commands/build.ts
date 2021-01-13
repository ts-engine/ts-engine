import { Context, NextFunction } from "@leecheneler/cli";

export const build = () => async (ctx: Context, next: NextFunction) => {
  await next();
};
