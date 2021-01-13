import { Context, NextFunction } from "@leecheneler/cli";

export const run = () => async (ctx: Context, next: NextFunction) => {
  await next();
};
